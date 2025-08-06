<script lang="ts">
  import { onMount } from "svelte";
  import { getContests, updateResults } from "@helpers/API";
  import type { CONTEST } from "@interfaces";
  import moment from "moment";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import PlusIcon from "@icons/Plus.svelte";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";
  import { page } from "$app/state";
  import { Paginator } from "@classes/Paginator.svelte";
  import { NotificationService } from "@stores/notification.service";
  import { SwordsIcon } from "lucide-svelte";
  import Indicator from "@components/Indicator.svelte";

  const notification = NotificationService.getInstance();
  const ADD = "Añadir competencia";
  const debug = false;

  let contests: CONTEST[] = $state([]);
  let pg = $state(new Paginator([], 10));
  let loading = $state(false);
  let error = $state(false);

  function addContest() {
    goto("/admin/contest/new");
  }

  function refreshContestData() {
    loading = true;
    error = false;

    getContests(pg.page)
      .then(res => {
        if (!res) {
          error = true;
          return;
        }
        contests = res.results;
        pg.setTotal(res.totalResults);
        pg = pg;
        goto(page.url.pathname + `/?page=${pg.page}`, { replaceState: true });
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    refreshContestData();
  }

  function updateResult() {
    updateResults()
      .then(res => {
        if (debug) console.log("RESULT: ", res);
        notification.addNotification({
          header: "Hecho",
          text: "Datos actualizados correctamente.",
          timeout: 2000,
        });
      })
      .catch(() =>
        notification.addNotification({
          header: "Error",
          text: "No se pudieron actualizar los datos.",
          timeout: 2000,
        })
      );
  }

  onMount(() => {
    refreshContestData();
  });
</script>

<PrivateRouteGuard>
  <div class="card mx-auto mb-8 mt-4 max-w-6xl">
    <h1 class="text-4xl mb-4 text-center flex items-center justify-center gap-2">
      <SwordsIcon size="2rem" class="text-red-600 dark:text-red-400" /> Competencias
    </h1>

    <div class="actions">
      <button class="btn btn-primary" onclick={addContest}>
        <PlusIcon size="1.2rem" />
        {ADD}
      </button>

      <button class="btn btn-accent" onclick={updateResult}>Actualizar Resultados</button>
    </div>

    {#if loading}
      <span class="loading loading-spinner loading-lg mx-auto"></span>
    {:else if contests.length > 0}
      <PaginatorComponent {pg} update={updatePaginator} class="mb-4" />

      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Categorías</th>
            </tr>
          </thead>

          <tbody>
            {#each contests as ct, pos}
              <tr>
                <td>{(pg.page - 1) * pg.limit + pos + 1}</td>
                <td>
                  <a href={"/admin/contest/" + ct.name} class="flex items-center gap-2">
                    <div class="tooltip" data-tip={getStatus(ct.status)}>
                      <Indicator color={getIndicatorColor(ct.status)} />
                    </div>
                    {ct.name}
                  </a>
                </td>
                <td>{moment.utc(ct.date).format("DD/MM/YYYY")}</td>
                <td>{moment.utc(ct.date).format("hh:mm a")}</td>
                <td>
                  <div class="flex w-full flex-wrap">
                    {#each ct.categories as cat}
                      <div class="tooltip" data-tip={cat.category.name}>
                        <WcaCategory icon={cat.category.scrambler} size="1.2rem" />
                      </div>
                    {/each}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <PaginatorComponent {pg} update={updatePaginator} class="mt-4" />

      <div class="actions">
        <button class="btn btn-primary" onclick={addContest}>
          <PlusIcon size="1.2rem" />
          {ADD}
        </button>
      </div>
    {:else if error}
      <span class="text-center text-red-500!">
        Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
      </span>

      <button class="btn btn-primary mt-8" onclick={refreshContestData}>Recargar</button>
    {:else}
      <span class="text-center">No hay competencias disponibles</span>
    {/if}
  </div>
</PrivateRouteGuard>

<style lang="postcss">
  @reference "tailwindcss";
  .actions {
    @apply my-4 flex justify-start gap-2;
  }
</style>
