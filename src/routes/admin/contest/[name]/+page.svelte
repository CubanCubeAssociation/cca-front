<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import {
    type CATEGORY,
    type CONTEST,
    type USER,
    type CONTESTANT,
    type ROUND,
    type SOLVE,
    STATUS_ORDER,
    type CONTEST_CATEGORY,
    type FORMAT,
  } from "@interfaces";

  import {
    createContest,
    getCategories,
    getContest,
    getFormats,
    redirectOnUnauthorized,
    removeContest,
    updateContest,
  } from "@helpers/API";

  import { getIndicatorColor, getStatus, randomUUID } from "@helpers/strings";
  import {
    clone,
    createEmptyContest,
    createEmptyFormat,
    createEmptyRound,
    fromModel,
    preventDefault,
    uniqueArray,
  } from "@helpers/object";
  import SearchUser from "$lib/components/SearchUser.svelte";
  import { getRoundsInfo } from "@helpers/statistics";
  import Select from "@components/Select.svelte";
  import { NotificationService } from "@stores/notification.service";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";

  import {
    BeanIcon,
    CalendarIcon,
    CircleAlertIcon,
    DollarSignIcon,
    EditIcon,
    HardDriveIcon,
    ListOrderedIcon,
    MapPinIcon,
    PlusIcon,
    SendIcon,
    TrashIcon,
    UserIcon,
    UsersIcon,
  } from "lucide-svelte";
  import Indicator from "@components/Indicator.svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import UserField from "@components/UserField.svelte";
  import Modal from "@components/Modal.svelte";
  import { sTimer } from "@helpers/timer";
  import { page } from "$app/state";
  import ResultView from "@components/ResultView.svelte";
  import { twMerge } from "tailwind-merge";
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import { SITEMAP } from "@helpers/routing";

  let name = $state("");
  const notification = NotificationService.getInstance();
  const debug = false;

  let contest: CONTEST = $state(createEmptyContest());

  let round: ROUND = $state(createEmptyRound());

  let categories: CATEGORY[] = $state([]);
  let formats: FORMAT[] = $state(getFormats());

  let editDialog = $state(false);
  let addDialog = $state(false);
  let addResult = $state(false);
  let deleteUserDialog = $state(false);
  let deleteContestDialog = $state(false);
  let deleteRoundDialog = $state(false);
  let deleteUserData: CONTESTANT | null = $state(null);
  let selectedUser: CONTESTANT | null = $state(null);
  let roundGroup: ROUND[][][] = $state([]);
  let checked: boolean[] = $state([]);
  let bundleAction = $state("Agregar categoría");
  let bundleCategory: CONTEST_CATEGORY | null = $state(null);
  let format: FORMAT = $state(createEmptyFormat());
  let loading = $state(false);
  let error = $state(false);

  function exit() {
    goto(SITEMAP.admin.contest);
  }

  function save() {
    let cnt = fromModel(contest, "CONTEST");

    if (name != "new") {
      updateContest(cnt, contest.id)
        .then(() => {
          notification.addNotification({
            key: randomUUID(),
            header: "Guardado",
            text: "Se guardó la competencia.",
            timeout: 2000,
          });
        })
        .catch(err => {
          if (debug) console.log("ERROR: ", err);
          notification.addNotification({
            key: randomUUID(),
            header: "Error",
            text: "Hubo un error al guardar la competencia.",
            timeout: 2000,
          });
        });
    } else {
      createContest(cnt)
        .then((c: CONTEST) => {
          goto(SITEMAP.admin.contest + "/" + c.name);
        })
        .catch(err => {
          if (debug) console.log("ERROR: ", err);
        });
    }
  }

  function toggleSelect(ct: CATEGORY) {
    let cats = contest.categories;

    if (cats.some(c => c.category.id === ct.id)) {
      contest.categories = cats.filter(c => c.category.id != ct.id);
    } else {
      contest.categories = [
        ...cats,
        {
          category: ct,
          rounds: 1,
          format: formats.find(fm => fm.name === ct.formats[0])?.name || formats[0].name || "Ao5",
        },
      ];

      console.log(formats, formats.find(fm => fm.name === ct.formats[0]) || formats[0]);
    }
  }

  function toggleSelectUser(ct: CATEGORY) {
    if (!selectedUser) return;

    let cats = selectedUser.categories;

    if (cats.some(c => c.id === ct.id)) {
      selectedUser.categories = cats.filter(c => c.id != ct.id);
    } else {
      selectedUser.categories = [...cats, ct];
    }
  }

  function handleUsers(ev: USER | USER[]) {
    if (!Array.isArray(ev)) return;

    let current = contest.contestants;
    let newUsers: CONTESTANT[] = ev.map(user => ({
      user,
      categories: [],
      paid: false,
      paidAmount: contest.inscriptionCost,
    }));

    contest.contestants = uniqueArray([...current, ...newUsers], e => e.user.id);
  }

  function deleteContestant(c: CONTESTANT) {
    deleteUserDialog = true;
    deleteUserData = c;
  }

  function handleDeleteUser() {
    deleteUserDialog = false;

    contest.contestants = contest.contestants.filter(ct => {
      return ct.user.id != deleteUserData?.user.id;
    });
  }

  function handleDeleteContest() {
    deleteUserDialog = false;
    deleteContestDialog = false;

    removeContest(contest)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  function handleDeleteRound() {
    contest.rounds = contest.rounds.filter(rnd => rnd.id != round.id);
    updateRoundInfo(contest.rounds, contest.categories);
    addResult = false;
    deleteRoundDialog = false;
  }

  function editUser(u: CONTESTANT) {
    selectedUser = {
      user: { ...u.user },
      categories: u.categories.map(ct => ({ ...ct })),
      paid: u.paid,
      paidAmount: u.paidAmount,
    };

    editDialog = true;
  }

  function handleEditUser() {
    if (!selectedUser) return;

    let user = contest.contestants.find(
      c => c.user.username === selectedUser!.user.username
    ) as CONTESTANT;
    user.categories = selectedUser.categories;
    contest = contest;
    editDialog = false;
  }

  function handleEditRound(rnd: ROUND) {
    round = rnd;
    let cat = contest.categories.find(ct => ct.category.id === rnd.category.id);
    if (!cat) {
      console.log("CAT = false");
      return;
    }
    format = formats.find(f => f.name === cat.format) || formats[0];
    addResult = true;
  }

  function getRoundLimits(rounds: number) {
    return [Infinity, ...[6, 12, 24, 48].slice(0, rounds - 1).reverse()];
  }

  function prepareResult() {
    if (contest.categories.length === 0) {
      if (debug) console.log("Add some categories");
      return;
    }

    let isCategory = contest.contestants.some(ct => ct.categories.length);

    if (!isCategory) {
      if (debug) console.log("Add category to some user");
      return;
    }

    let { categories } = contest;

    for (let j = 0, maxj = categories.length; j < maxj; j += 1) {
      let cat = categories[j].category.id;

      for (let r = 1, maxr = categories[j].rounds; r <= maxr; r += 1) {
        let contestants = getContestants(cat, r);

        if (contestants.length === 0) continue;
        round = createEmptyRound();
        addResult = true;
        return;
      }
    }
  }

  function getInputColor(s: SOLVE) {
    let t = s.time;

    if (t === "" || /^([1-9]\d*|DNF|DNS)$/.test(t)) {
      // s.penaltyType = t === "DNS" ? PENALTY.DNS : t === "DNF" ? PENALTY.DNF : PENALTY.NONE;
      return "";
    }

    return "border-error";
  }

  function getRounds(ct: CATEGORY) {
    let cct = contest.categories.find(c => c.category.id === ct.id);
    return new Array(cct ? cct.rounds : 5).fill(0).map((_, p) => p + 1);
  }

  function getContestants(catId: string, roundNum: number): CONTESTANT[] {
    const limit = getRoundLimits(
      contest.categories.filter(ct => ct.category.id === catId)[0].rounds
    )[roundNum - 1];

    if (roundNum === 1) {
      return contest.contestants.filter(
        c =>
          c.categories.some(ct => ct.id === catId) &&
          !roundGroup.some(r =>
            r.some(rnd =>
              rnd.some(
                rres =>
                  rres.category.id === catId &&
                  rres.round === roundNum &&
                  c.user.id === rres.contestant.id
              )
            )
          )
      );
    }

    const flatRounds = roundGroup.flat(5);
    const currentRound = flatRounds.filter(
      rnd => rnd.category.id === catId && rnd.round === roundNum
    );
    const podium = flatRounds
      .filter(rnd => rnd.category.id === catId && rnd.round === roundNum - 1)
      .slice(0, limit)
      .filter(rnd => currentRound.every(round => round.contestant.id != rnd.contestant.id));

    return podium.map(p => contest.contestants.find(cnt => cnt.user.id === p.contestant.id)!);
  }

  function updateRoundInfo(rnds: ROUND[], categories: CONTEST_CATEGORY[]) {
    let roundInfo = getRoundsInfo(rnds, categories, formats);
    contest.rounds = roundInfo.rounds;
    roundGroup = roundInfo.roundGroup;
  }

  function saveResult() {
    let rnds: ROUND[] = [];

    if (round.id) {
      rnds = contest.rounds.map(rnd => (rnd.id === round.id ? round : rnd));
    } else {
      rnds = [...contest.rounds, clone(round)];
    }

    updateRoundInfo(rnds, contest.categories);
    addResult = false;
  }

  function validateRound(rnd: ROUND) {
    let len = ["666wca", "777wca"].indexOf(rnd.category.scrambler) > -1 ? 3 : 5;
    return [rnd.t1, rnd.t2, rnd.t3, rnd.t4, rnd.t5]
      .slice(0, len)
      .every(t => t.time && getInputColor(t) === "");
  }

  function getContestData() {
    loading = true;
    error = false;

    getCategories()
      .then(res => {
        categories = res.results.sort((a, b) => (a.name < b.name ? -1 : 1));

        if (name != "new") {
          return getContest(name).then(cnt => {
            if (!cnt) return;
            contest = cnt;
            if (debug) console.log("CONTEST: ", cnt);
            contest.date = moment.utc(contest.date).format("YYYY-MM-DDThh:mm");
            contest.inscriptionStart = moment(contest.inscriptionStart).format("YYYY-MM-DD");
            contest.inscriptionEnd = moment(contest.inscriptionEnd).format("YYYY-MM-DD");
            checked = contest.contestants.map(() => false);

            updateRoundInfo(contest.rounds, contest.categories);
          });
        }
      })
      .catch(err => {
        redirectOnUnauthorized(err);
        error = true;
      })
      .finally(() => {
        loading = false;
      });
  }

  onMount(() => {
    name = page.params.name.replaceAll("-", " ");
    getContestData();
  });
</script>

<svelte:head>
  <title>{contest.name} - CCA</title>
  <title>
    {name === "new"
      ? (contest.name.trim() ? contest.name + " - " : "") + "Crear competencia"
      : contest.name + " - Editar competencia"}
  </title>
</svelte:head>

<PrivateRouteGuard>
  <LoadingLayout {loading} {error} altError={false} reloadFunction={getContestData}>
    {#snippet title()}
      {name === "new" ? "Crear competencia" : `Editar "${name}"`}
    {/snippet}

    {#snippet content()}
      <form class="mt-8 w-full" onsubmit={preventDefault(save)}>
        <div class="tabs tabs-border">
          <!-- Datos -->
          <label class="tab gap-2 text-accent">
            <input type="radio" name="contesttab" checked />
            <HardDriveIcon size="1.2rem" /> Datos
          </label>
          <div class="tab-content border-base-300 bg-base-100 md:p-10">
            <div class="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
              <!-- Nombre -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Competencia</legend>
                <label class="input">
                  <UserIcon />
                  <input
                    bind:value={contest.name}
                    type="text"
                    class="grow"
                    placeholder="Nombre"
                    required
                  />
                </label>
              </fieldset>

              <!-- Lugar -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Lugar</legend>

                <label class="input">
                  <MapPinIcon />
                  <input
                    bind:value={contest.place}
                    type="text"
                    class="grow"
                    placeholder="Lugar"
                    required
                  />
                </label>
              </fieldset>

              <!-- Fecha -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Fecha y hora</legend>

                <label class="input">
                  <CalendarIcon />
                  <input bind:value={contest.date} type="datetime-local" class="grow" required />
                </label>
              </fieldset>

              <!-- Inicio de inscripcion -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Inicio de inscripción</legend>

                <label class="input">
                  <CalendarIcon />
                  <input bind:value={contest.inscriptionStart} type="date" class="grow" required />
                </label>
              </fieldset>

              <!-- Fin de inscripcion -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Fin de inscripción</legend>

                <label class="input">
                  <CalendarIcon />
                  <input bind:value={contest.inscriptionEnd} type="date" class="grow" required />
                </label>
              </fieldset>

              <!-- Costo de inscripcion -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Costo de inscripción</legend>

                <label class="input">
                  <DollarSignIcon />
                  <input bind:value={contest.inscriptionCost} type="number" class="grow" required />
                </label>
              </fieldset>

              <!-- Seed -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Semilla</legend>

                <label class="input input-warning">
                  <BeanIcon />
                  <input bind:value={contest.seed} type="text" class="grow" />
                </label>
              </fieldset>

              <!-- Generator -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Generador</legend>

                <label class="input input-warning">
                  <BeanIcon />
                  <input
                    bind:value={contest.gen}
                    type="number"
                    min={0}
                    max={5000}
                    class="grow"
                    required
                  />
                </label>
              </fieldset>

              <!-- Estado -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Estado </legend>

                <Select
                  items={STATUS_ORDER}
                  bind:value={contest.status}
                  transform={e => e}
                  label={e => getStatus(e)}
                  hasIcon={e => getIndicatorColor(e)}
                  iconComponent={Indicator}
                  iconKey="color"
                  iconSize={null}
                  class="w-full rounded-sm py-5 cursor-pointer"
                />
              </fieldset>

              <!-- Categorias -->
              <fieldset class="fieldset md:col-span-2">
                <legend class="fieldset-legend">Categorías </legend>

                <div class="w-full flex flex-wrap gap-2">
                  {#each categories as ct}
                    <button
                      onclick={preventDefault(() => toggleSelect(ct))}
                      class="tooltip"
                      data-tip={ct.name}
                    >
                      <WcaCategory
                        icon={ct.scrambler}
                        class="cursor-pointer"
                        size="1.5rem"
                        selected={!!contest.categories.find(cat => cat.category.id === ct.id)}
                      />
                    </button>
                  {/each}
                </div>
              </fieldset>

              <!-- Visible -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Visible</legend>

                <input bind:checked={contest.visible} type="checkbox" class="toggle bg-[unset]" />
              </fieldset>

              {#if contest.categories.length > 0}
                <hr class="col-span-full border border-base-content opacity-20" />

                <!-- Configuración de categorías -->
                <div class="col-span-full grid place-items-center">
                  <h2 class="mb-2 text-xl">Configuración de categorías</h2>

                  <div class="w-full flex flex-wrap gap-4 justify-center">
                    {#each contest.categories as ct}
                      {@const cnts = contest.contestants.filter(cnt =>
                        cnt.categories.find(ct1 => ct1.id === ct.category.id)
                      ).length}
                      {@const ctFormats = formats.filter(f => ct.category.formats.includes(f.name))}

                      <div class="grid place-items-center border rounded-md p-2 grid-cols-2 gap-2">
                        <div>
                          <WcaCategory icon={ct.category.scrambler} size="2rem" />
                          <span class="flex justify-center">{ct.category.name}</span>
                        </div>

                        <div class="grid">
                          <label class="text-sm" for="">Rondas</label>
                          <Select
                            bind:value={ct.rounds}
                            items={[1, 2, 3, 4].slice(
                              0,
                              cnts <= 7 ? 1 : cnts <= 15 ? 2 : cnts < 99 ? 3 : 4
                            )}
                            transform={e => e}
                            placement="right"
                          />
                          <Select
                            bind:value={ct.format}
                            items={ctFormats}
                            transform={e => e.name}
                            label={e => e.name}
                            placement="right"
                            onChange={() => updateRoundInfo(contest.rounds, contest.categories)}
                          />
                        </div>
                        <div class="flex items-center justify-between border gap-2 rounded-md">
                          <button
                            class="p-1"
                            type="button"
                            onclick={preventDefault(() => (ct.rounds = Math.max(1, ct.rounds - 1)))}
                            >-</button
                          >
                          <span>{ct.rounds}</span>
                          <button
                            class="p-1"
                            type="button"
                            onclick={preventDefault(() => (ct.rounds = Math.min(5, ct.rounds + 1)))}
                            >+</button
                          >
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Competidores -->
          <label class="tab gap-2 text-accent">
            <input type="radio" name="contesttab" />
            <UsersIcon size="1.2rem" /> Competidores
          </label>
          <div class="tab-content border-base-300 bg-base-100 md:p-10">
            <div class="w-full mb-4 flex items-center gap-2">
              <button class="btn btn-primary" onclick={preventDefault(() => (addDialog = true))}>
                <PlusIcon /> Añadir competidor
              </button>

              {#if checked.some(e => e)}
                <Select
                  bind:value={bundleAction}
                  items={["Agregar categoría", "Remover categoría"]}
                  transform={e => e}
                />
                <Select
                  bind:value={bundleCategory}
                  items={contest.categories}
                  transform={e => e}
                  label={e => e.category.name}
                />
                <button
                  class="btn btn-secondary"
                  disabled={!bundleAction || !bundleCategory}
                  onclick={preventDefault(() => {
                    let users = contest.contestants.filter((_, p) => checked[p]);

                    if (bundleAction.startsWith("Agregar")) {
                      users.forEach(user => {
                        user.categories = [
                          ...user.categories.filter(cat => cat.id != bundleCategory!.category.id),
                          bundleCategory!.category,
                        ];
                      });
                    } else {
                      users.forEach(user => {
                        user.categories = user.categories.filter(
                          cat => cat.id != bundleCategory!.category.id
                        );
                      });
                    }

                    contest = contest;
                  })}
                >
                  Aplicar
                </button>
              {/if}
            </div>

            {#if contest.contestants.length}
              <div
                class="overflow-x-auto max-w-full result-table rounded-lg border border-base-content/10"
              >
                <table class="table table-zebra">
                  <!-- head -->
                  <thead>
                    <tr>
                      <th class="text-center">No.</th>
                      <th class="text-center">Nombre</th>
                      <th class="text-center">Usuario</th>
                      <th class="text-center min-w-[7rem]">Categorías</th>
                      <th class="text-center">Pagó</th>
                      <th class="text-center">Inscripción</th>
                      <th class="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each contest.contestants as c, p (c.user.username)}
                      <tr>
                        <td>
                          <input
                            bind:checked={checked[p]}
                            type="checkbox"
                            class="checkbox bg-transparent"
                            onchange={() => (checked = checked)}
                          />
                        </td>
                        <td>
                          <UserField user={c.user} />
                        </td>
                        <td>{c.user.username}</td>
                        <td>
                          <div class="w-full flex flex-wrap gap-2">
                            {#each c.categories as ct}
                              <div class="tooltip" data-tip={ct.name}>
                                <WcaCategory size="1.5rem" icon={ct.scrambler} />
                              </div>
                            {/each}
                          </div>
                        </td>
                        <td>
                          <input
                            bind:checked={c.paid}
                            type="checkbox"
                            class="toggle bg-transparent"
                          />
                        </td>
                        <td>
                          <input type="number" class="w-[4rem] input" bind:value={c.paidAmount} />
                        </td>
                        <td>
                          <div class="tooltip" data-tip="Editar categorías">
                            <button
                              class="btn p-2 btn-ghost"
                              onclick={preventDefault(() => editUser(c))}
                            >
                              <EditIcon size="1.2rem" />
                            </button>
                          </div>
                          <div class="tooltip" data-tip="Eliminar">
                            <button
                              class="btn p-2 btn-ghost hover:bg-error hover:text-error-content"
                              onclick={preventDefault(() => deleteContestant(c))}
                            >
                              <TrashIcon size="1.2rem" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>

              <div class="w-full mt-4">
                <button class="btn btn-primary" onclick={preventDefault(() => (addDialog = true))}>
                  <PlusIcon /> Añadir competidor
                </button>
              </div>
            {/if}
          </div>

          <!-- Resultados -->
          {#if name != "new"}
            <label class="tab gap-2 text-accent">
              <input type="radio" name="contesttab" />
              <ListOrderedIcon size="1.2rem" /> Resultados
            </label>
            <div class="tab-content border-base-300 bg-base-100 md:p-10">
              <div class="w-full mb-4">
                <button class="btn btn-primary" onclick={preventDefault(prepareResult)}>
                  <PlusIcon /> Agregar resultado
                </button>
              </div>

              {#if roundGroup.length > 0}
                <ResultView
                  bind:roundGroup
                  {formats}
                  {contest}
                  categories={contest.categories}
                  edit={handleEditRound}
                  allowEdit
                />

                <div class="w-full mt-4">
                  <button class="btn btn-primary" onclick={preventDefault(prepareResult)}>
                    <PlusIcon /> Agregar resultado
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <div class="col-span-full flex justify-center gap-2 py-4">
          {#if name != "new"}
            <button
              class="btn btn-error"
              onclick={preventDefault(() => (deleteContestDialog = true))}
            >
              <TrashIcon size="1.2rem" />
              <span class="ml-1">Eliminar</span>
            </button>
          {/if}

          <button type="submit" class="btn btn-primary">
            <SendIcon size="1rem" />
            <span class="ml-1">{name === "new" ? "Crear" : "Guardar"}</span>
          </button>
        </div>
      </form>
    {/snippet}
  </LoadingLayout>
</PrivateRouteGuard>

<!-- ADD DIALOG -->
<SearchUser multiple={true} user={handleUsers} bind:show={addDialog} />

<!-- EDIT USER DIALOG -->
<Modal bind:show={editDialog}>
  <h2 class="text-xl text-center mb-4">Categorías de {selectedUser?.user?.name}</h2>

  <div class="w-full flex flex-wrap items-center justify-center gap-2 my-4">
    {#each contest.categories as ct}
      <button
        onclick={() => toggleSelectUser(ct.category)}
        class="tooltip"
        data-tip={ct.category.name}
      >
        <WcaCategory
          class="cursor-pointer"
          icon={ct.category.scrambler}
          selected={!!selectedUser?.categories?.find(cat => cat.id === ct.category.id)}
        />
      </button>
    {/each}
  </div>

  <div class="flex mx-auto justify-center gap-4">
    <button class="btn" onclick={() => (editDialog = false)}>Cancelar</button>
    <button class="btn btn-primary" onclick={handleEditUser}>Aceptar</button>
  </div>
</Modal>

<!-- ADD RESULT -->
<Modal bind:show={addResult}>
  <h2 class="text-center text-xl mb-4">Agregar resultado</h2>
  <div class="flex items-center justify-center gap-2 my-2">
    {#if round.id}
      <button class="btn gap-1 h-9 py-1 px-2" disabled>
        {round.category.name}
      </button>
      <button class="btn gap-1 h-9 py-1 px-2" disabled>
        {round.round}
      </button>
      <button class="btn gap-1 h-9 py-1 px-2" disabled>
        {round.contestant.name}
      </button>
    {:else}
      <Select
        bind:value={round.category}
        items={contest.categories}
        hasIcon={ct => ct.category.scrambler}
        transform={ct => ct.category}
        label={ct => ct.category.name}
        onChange={() => (round.round = 1)}
      />

      <Select
        bind:value={round.round}
        items={getRounds(round.category)}
        transform={e => e}
        label={r => `Ronda ${r}`}
      />

      {#if getContestants(round.category.id, round.round).length > 0}
        <Select
          bind:value={round.contestant}
          items={getContestants(round.category.id, round.round)}
          transform={cnt => cnt.user}
          label={cnt => cnt.user.name}
        />
      {/if}
    {/if}
  </div>

  <div class="overflow-x-auto max-w-full rounded-lg border border-base-content/10">
    <table class="table table-zebra">
      <thead>
        <tr>
          {#each [1, 2, 3, 4, 5].slice(0, format.amount) as n}
            <th class="text-center">T{n}</th>
          {/each}
        </tr>
      </thead>

      <tbody>
        <tr>
          {#each [round.t1, round.t2, round.t3, round.t4, round.t5].slice(0, format.amount) as s}
            <td>
              <div class="grid place-items-center gap-2">
                <input
                  type="text"
                  bind:value={s.time}
                  class={twMerge("input w-[4rem]", getInputColor(s))}
                />
                {sTimer(s, true, true)}
              </div>
            </td>
          {/each}
        </tr>
      </tbody>
    </table>
  </div>

  <div class="flex mx-auto justify-center gap-4">
    {#if round.id}
      <button class="btn btn-error" onclick={() => (deleteRoundDialog = true)}> Eliminar </button>
    {/if}

    <button class="btn" onclick={() => (addResult = false)}>Cancelar</button>
    <button class="btn btn-primary" disabled={!validateRound(round)} onclick={saveResult}>
      Aceptar
    </button>
  </div>
</Modal>

<!-- DELETE CONTESTANT -->
<Modal bind:show={deleteUserDialog}>
  <h2 class="text-xl text-center mb-4">Eliminar competidor</h2>
  <h4 class="text-center mt-1 mb-4">¿Desea eliminar a {deleteUserData?.user.name}?</h4>

  <div class="flex mx-auto justify-center gap-4">
    <button class="btn" onclick={() => (deleteUserDialog = false)}>Cancelar</button>
    <button class="btn btn-error" onclick={handleDeleteUser}>
      <TrashIcon size="1.2rem" />
      <span class="ml-1">Eliminar</span>
    </button>
  </div>
</Modal>

<!-- DELETE CONTEST -->
<Modal bind:show={deleteContestDialog}>
  <h2 class="text-center text-xl mb-4">Eliminar competencia</h2>

  <div class="flex flex-col items-center justify-center">
    <CircleAlertIcon class="mx-auto mt-2 mb-4 text-gray-400 w-12 h-12" />

    <h4 class="text-center mb-4">¿Desea eliminar la competencia "{contest.name}"?</h4>

    <div class="flex gap-2 mt-4">
      <button class="btn" onclick={() => (deleteContestDialog = false)}>Cancelar</button>
      <button class="btn btn-error" onclick={handleDeleteContest}>
        <TrashIcon size="1.2rem" />
        <span class="ml-1">Eliminar</span>
      </button>
    </div>
  </div>
</Modal>

<!-- DELETE ROUND -->
<Modal bind:show={deleteRoundDialog}>
  <h2 class="text-center text-xl mb-4">Eliminar ronda</h2>
  <h4 class="text-center mb-4">¿Desea eliminar la ronda?</h4>

  <div class="flex mx-auto justify-center gap-4">
    <button class="btn" onclick={() => (deleteRoundDialog = false)}>Cancelar</button>
    <button class="btn btn-error" onclick={handleDeleteRound}>
      <TrashIcon size="1.2rem" />
      <span class="ml-1">Eliminar</span>
    </button>
  </div>
</Modal>

<style>
  tr > * {
    padding-inline: 0.5rem;
  }
</style>
