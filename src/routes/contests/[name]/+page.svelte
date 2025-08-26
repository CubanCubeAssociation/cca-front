<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import {
    PERMISSIONS,
    STATUS_ORDER,
    type CONTEST,
    type CONTEST_STATUS,
    type FORMAT,
    type ROUND,
  } from "@interfaces";
  import {
    getContest,
    getFormats,
    inscribeContestUser,
    modifyUserContest,
    removeContestUser,
  } from "@helpers/API";
  import { getRoundsInfo } from "@helpers/statistics";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { hasPermission, minRole } from "@helpers/auth";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { userStore } from "@stores/user";
  import ResultView from "@components/ResultView.svelte";
  import { page } from "$app/state";
  import UserField from "@components/UserField.svelte";
  import { contestNameToLink, contestParamName } from "@helpers/routing";
  import Indicator from "@components/Indicator.svelte";
  import { createEmptyContest } from "@helpers/object";
  import {
    CalendarIcon,
    CircleAlertIcon,
    ClockIcon,
    DollarSignIcon,
    EyeIcon,
    MapPinIcon,
    OrbitIcon,
    PencilIcon,
    PuzzleIcon,
    SaveIcon,
    SendIcon,
    UserMinusIcon,
    UserPlusIcon,
  } from "lucide-svelte";
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import Modal from "@components/Modal.svelte";
  import { twMerge } from "tailwind-merge";
  import { NotificationService } from "@stores/notification.service";

  const size = "1.4rem";
  const spanClass = "flex items-center gap-1 text-green-200!";
  const notification = NotificationService.getInstance();

  let contest: CONTEST = $state(createEmptyContest());
  let roundGroup: ROUND[][][] = $state([]);
  let formats: FORMAT[] = $state([]);
  let loading = $state(false);
  let error = $state(false);
  let name = $state("");
  let canInscribe = $derived(
    contest.name &&
      contest.status === "inscription" &&
      $userStore &&
      !contest.contestants.some(ct => ct.user.id === $userStore.id)
  );
  let showInscriptionModal = $state(false);
  let selectedCategories: boolean[] = $state([]);
  let inscribeLoading = $state(false);
  let unsubscribeLoading = $state(false);
  let canUnsubscribe = $derived(
    contest.name &&
      contest.status === "inscription" &&
      $userStore &&
      contest.contestants.some(ct => ct.user.id === $userStore.id)
  );
  let canModifyCategories = $derived(
    minRole($userStore, "admin") ||
      hasPermission($userStore, PERMISSIONS.contest.modifyUserCategories)
  );
  let showRemoveContestUserModal = $state(false);
  let isModifying = $state(false);
  let selectedUser = $state("");

  function before(state: CONTEST_STATUS) {
    let idx = STATUS_ORDER.indexOf(contest.status);
    let idx1 = STATUS_ORDER.indexOf(state);

    return idx < idx1;
  }

  function checkProperty(p: string) {
    return Object.prototype.hasOwnProperty.call(contest, p);
  }

  function updateData() {
    loading = true;
    error = false;

    name = contestParamName(page.params.name);

    Promise.all([getFormats(), getContest(name)])
      .then(res => {
        formats = res[0];
        contest = res[1];
        contest.date = moment.utc(contest.date).format("YYYY-MM-DDThh:mm");
        contest.inscriptionStart = moment(contest.inscriptionStart).format("YYYY-MM-DD");
        contest.inscriptionEnd = moment(contest.inscriptionEnd).format("YYYY-MM-DD");

        let roundInfo = getRoundsInfo(contest.rounds, contest.categories, formats);

        contest.rounds = roundInfo.rounds;
        roundGroup = roundInfo.roundGroup;
      })
      .catch(e => {
        if (e.name === "HTTPError" && e.response.status === 404) {
          error = true;
        }
      })
      .finally(() => (loading = false));
  }

  function inscribeMe() {
    if (!$userStore) return;
    inscribeLoading = true;
    showInscriptionModal = false;

    inscribeContestUser(
      contest,
      $userStore,
      contest.categories.filter((_, p) => selectedCategories[p])
    )
      .then(() => {
        notification.addNotification({
          header: "Inscrito",
          text: `Se ha inscrito en la competencia "${contest.name}".`,
        });
        updateData();
      })
      .catch(() =>
        notification.addNotification({
          header: "Error",
          text: `Ha habido un error en la inscripción.`,
        })
      )
      .finally(() => (inscribeLoading = false));
  }

  function unsubscribeMe() {
    if (!$userStore) return;
    unsubscribeLoading = true;
    showRemoveContestUserModal = false;

    removeContestUser(contest, $userStore)
      .then(() => {
        notification.addNotification({
          header: "Hecho",
          text: `Se ha dado de baja de la competencia "${contest.name}".`,
        });
        updateData();
      })
      .catch(() =>
        notification.addNotification({
          header: "Error",
          text: `Ha habido un error al intentar darse de baja.`,
        })
      )
      .finally(() => (unsubscribeLoading = false));
  }

  function modifyCategories() {
    if (!$userStore) return;

    showInscriptionModal = false;

    modifyUserContest(
      contest.id,
      selectedUser,
      contest.categories.filter((_, p) => selectedCategories[p])
    )
      .then(() => {
        notification.addNotification({
          header: "Modificado",
          text: "Se guardaron los cambios correctamente.",
        });
        updateData();
      })
      .catch(() => {
        notification.addNotification({
          header: "Error",
          text: "Ha ocurrido un error al guardar los datos.",
        });
      });
  }

  onMount(() => {
    updateData();
  });
</script>

<svelte:head>
  <title>Competencias - {contest?.name}</title>
</svelte:head>

<LoadingLayout class="!bg-base-300" {loading} {error} altError={false} reloadFunction={updateData}>
  {#snippet title()}
    {name}

    {#if minRole($userStore, "delegate")}
      <a href={contestNameToLink(contest.name, {}, true)}><PencilIcon size="1.2rem" /></a>
    {/if}
  {/snippet}

  {#snippet content()}
    <div class="card mt-4 max-w-4xl mx-auto mb-4">
      <ul class="grid gap-2 info-list">
        <!-- Lugar -->
        <li>
          <span class={spanClass}>
            <MapPinIcon {size} /> Lugar:
          </span>
          <span>{contest.place}</span>
        </li>

        <!-- Fecha -->
        <li>
          <span class={spanClass}>
            <CalendarIcon {size} />Fecha:
          </span>
          <span>{moment(contest.date).format("DD/MM/YYYY")}</span>
        </li>

        <!-- Hora -->
        <li>
          <span class={spanClass}>
            <ClockIcon {size} />Hora:
          </span>
          <span>{moment(contest.date).format("hh:mm a")}</span>
        </li>

        {#if before("running")}
          <!-- Inscripcion (inicio) -->
          <li>
            <span class={spanClass}>
              <CalendarIcon {size} />Inicio de inscripción:
            </span>
            <span>{moment(contest.inscriptionStart).format("DD/MM/YYYY")}</span>
          </li>

          <!-- Inscripcion (fin) -->
          <li>
            <span class={spanClass}>
              <CalendarIcon {size} />Fin de inscripción:
            </span>
            <span>{moment(contest.inscriptionEnd).format("DD/MM/YYYY")}</span>
          </li>

          <!-- Costo -->
          <li>
            <span class={spanClass}>
              <DollarSignIcon {size} />Costo de inscripción:
            </span>
            <span>
              {contest.inscriptionCost === 0
                ? "Gratis"
                : new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: "CUP",
                  }).format(contest.inscriptionCost)}
            </span>
          </li>
        {/if}

        <li>
          <span class={spanClass}>
            <PuzzleIcon {size} />Categorías:
          </span>
          <span class="flex flex-wrap gap-2 max-w-[25rem]">
            {#each contest.categories as ct}
              <div class="tooltip" data-tip={ct.category.name}>
                <WcaCategory icon={ct.category.scrambler} size="1.5rem" />
              </div>
            {/each}
          </span>
        </li>

        <!-- Estado -->
        <li>
          <span class={spanClass}>
            <OrbitIcon {size} />Estado:
          </span>
          <span class="p-1 flex gap-2 items-center">
            <Indicator color={getIndicatorColor(contest.status)} />
            {getStatus(contest.status)}
          </span>
        </li>

        <!-- Visible -->
        {#if checkProperty("visible")}
          <li>
            <span class={spanClass}>
              <EyeIcon {size} />Visible:
            </span>
            <span>{contest.visible ? "Si" : "No"}</span>
          </li>
        {/if}
      </ul>

      <div class="actions flex gap-2 flex-wrap">
        {#if canInscribe}
          <button
            class="btn btn-primary relative"
            onclick={() => {
              showInscriptionModal = true;
              isModifying = false;
              selectedUser = $userStore?.id || "";
            }}
          >
            <UserPlusIcon size="1.2rem" /> Inscribirme
            {#if inscribeLoading}
              <div class="w-full h-full bg-primary absolute rounded-md grid p-1">
                <span class="loading loading-spinner loading-lg mx-auto mb-4"></span>
              </div>
            {/if}
          </button>
        {/if}

        {#if canUnsubscribe}
          <button
            class="btn btn-warning relative"
            onclick={() => (showRemoveContestUserModal = true)}
          >
            <UserMinusIcon size="1.2rem" /> Darme de baja

            {#if unsubscribeLoading}
              <div class="w-full h-full bg-warning absolute rounded-md grid p-1">
                <span class="loading loading-spinner loading-lg mx-auto mb-4"></span>
              </div>
            {/if}
          </button>
        {/if}
      </div>
    </div>

    {#if contest.contestants.length > 0}
      <div class="card max-w-4xl mx-auto">
        <h2 class="text-center text-2xl flex justify-center gap-1">Competidores</h2>

        <div
          class="overflow-x-auto w-full rounded-lg border border-base-content/10
          max-h-[30rem] overflow-y-auto
        "
        >
          <table class="table table-zebra">
            <thead>
              <tr>
                <th class="max-md:pr-0 max-md:pl-2">#</th>
                <th class="max-md:px-2">Nombre</th>
                <th class="min-w-[10rem]">Categorías</th>
                {#if $userStore && contest.contestants.some(ct => ct.user.id === $userStore.id)}
                  <th></th>
                {/if}
              </tr>
            </thead>

            <tbody>
              {#each contest.contestants as c, p (c.user.username)}
                <tr>
                  <td class="max-md:pr-0 max-md:pl-2">{p + 1}</td>
                  <td class="max-md:px-2"><UserField user={c.user} link /></td>
                  <td>
                    <div class="w-full flex flex-wrap gap-2">
                      {#each c.categories as ct}
                        <div class="tooltip" data-tip={ct.name}>
                          <WcaCategory icon={ct.scrambler} size="1.2rem" />
                        </div>
                      {/each}
                    </div>
                  </td>

                  {#if contest.status === "inscription" && ($userStore?.id === c.user.id || canModifyCategories)}
                    <td class="max-w-[2rem]">
                      <button
                        onclick={() => {
                          selectedCategories = contest.categories.map(ct =>
                            c.categories.some(ct1 => ct1.id === ct.category.id)
                          );
                          isModifying = true;
                          showInscriptionModal = true;
                          selectedUser = c.user.id;
                        }}
                        class="btn btn-primary p-2"
                      >
                        <PencilIcon size="1.2rem" /></button
                      >
                    </td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if contest.status !== "pending" && contest.status !== "inscription"}
      <div class="card mt-4 max-w-4xl mx-auto mb-4">
        <h2 class="text-center text-2xl flex justify-center gap-1">Resultados</h2>

        {#if contest.status === "running" || contest.status === "results"}
          <p class="max-w-2xl text-sm">
            {#if contest.status === "running"}
              Se están añadiendo los resultados de la competencia. A medida que se vayan añadiendo,
              aparecerán debajo (no se actualiza en tiempo real, debes recargar la página para
              obtener las últimas actualizaciones).
            {:else if contest.status === "results"}
              Se están revisando detalladamente todos los resultados de la competencia antes de
              publicarlos de manera oficial.
            {/if}
          </p>
        {/if}

        <ResultView bind:roundGroup {formats} {contest} categories={contest.categories} />
      </div>
    {/if}
  {/snippet}

  {#snippet altErrorContent()}
    <span class="text-center">No se encontró la competencia: "{name}"</span>
  {/snippet}
</LoadingLayout>

<Modal bind:show={showInscriptionModal}>
  <h2 class="text-2xl text-center mb-4">Seleccione las categorías</h2>

  <div>
    <ul class="flex items-center gap-2 justify-center flex-wrap">
      {#each contest.categories as ct, p}
        <li>
          <button
            class={twMerge("btn px-1 tooltip", selectedCategories[p] ? "btn-primary" : "btn-ghost")}
            data-tip={ct.category.name}
            onclick={() => {
              selectedCategories[p] = !selectedCategories[p];
            }}
          >
            <WcaCategory icon={ct.category.scrambler} size="1.5rem" />
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <div class="flex gap-2 justify-center mt-4">
    <button
      class="btn btn-neutral"
      onclick={() => {
        showInscriptionModal = false;
      }}>Cancelar</button
    >
    {#if isModifying}
      <button
        class="btn btn-primary"
        onclick={modifyCategories}
        disabled={selectedCategories.every(c => !c)}
      >
        <SaveIcon size="1.2rem" /> Modificar
      </button>
    {:else}
      <button
        class="btn btn-primary"
        onclick={inscribeMe}
        disabled={selectedCategories.every(c => !c)}
      >
        <SendIcon size="1.2rem" /> Inscribirme
      </button>
    {/if}
  </div>
</Modal>

<Modal bind:show={showRemoveContestUserModal}>
  <h2 class="text-xl text-center mb-4">Salir de la competencia</h2>

  <div class="flex flex-col items-center justify-center">
    <CircleAlertIcon size="3rem" />

    <h4 class="text-center">¿Desea salir de la competencia "{contest.name}"?</h4>

    <div class="flex gap-2 mt-4">
      <button class="btn" onclick={() => (showRemoveContestUserModal = false)}>Cancelar</button>
      <button class="btn btn-error" onclick={unsubscribeMe}>
        <UserMinusIcon size="1.2rem" />
        <span class="ml-1">Salir</span>
      </button>
    </div>
  </div>
</Modal>

<style lang="postcss">
  .info-list {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 1rem;
    margin: 0 auto;
    max-width: 100%;
  }

  .info-list li {
    @apply flex items-center;
  }

  tr > * {
    padding-inline: 0.5rem;
  }
</style>
