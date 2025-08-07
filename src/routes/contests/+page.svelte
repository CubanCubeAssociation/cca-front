<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { getContests } from "@helpers/API";
  import type { CONTEST_RESULT } from "@interfaces";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Paginator } from "@classes/Paginator.svelte";
  import { contestNameToLink } from "@helpers/routing";
  import { SwordsIcon } from "lucide-svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import Indicator from "@components/Indicator.svelte";

  const DEFAULT_RESULT = {
    limit: 0,
    page: 0,
    results: [],
    totalPages: 0,
    totalResults: 0,
  };

  let loading = $state(false);
  let error = $state(false);
  let pg = $state(new Paginator([], 10));
  let contestResults: CONTEST_RESULT = $state(DEFAULT_RESULT);

  function refreshContestData() {
    loading = true;
    error = false;

    getContests(pg.page)
      .then(c => {
        if (!c) {
          error = true;
          return;
        }
        contestResults = c;
        pg.setTotal(c.totalResults);
        pg = pg;
        goto(page.url.pathname + `/?page=${pg.page}`, { replaceState: true });
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    refreshContestData();
  }

  onMount(() => {
    pg.page = Math.max(1, parseInt(page.url.searchParams.get("page") || "1", 10));
    refreshContestData();
  });
</script>

<div class="card max-w-4xl mx-auto mb-8 mt-4">
  <h1 class="mb-8 flex items-center justify-center gap-1 text-center text-4xl">
    <SwordsIcon size="2rem" class="text-red-400" /> Competencias
  </h1>

  {#if loading}
    <span class="loading loading-spinner loading-lg mx-auto"></span>
  {:else if contestResults.results.length > 0}
    <PaginatorComponent {pg} update={updatePaginator} class="mb-4" />

    <div class="overflow-x-auto max-w-full">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Fecha</th>
            <th class="max-md:hidden">Hora</th>
            <th class="min-w-[10rem]">Categorías</th>
          </tr>
        </thead>

        <tbody>
          {#each contestResults.results as r, pos}
            <tr>
              <td>{(pg.page - 1) * pg.limit + pos + 1}</td>
              <td>
                <a href={contestNameToLink(r.name)} class="flex flex-wrap items-center gap-2">
                  <div class="tooltip" data-tip={getStatus(r.status)}>
                    <Indicator color={getIndicatorColor(r.status)} />
                  </div>
                  {r.name}
                </a>
              </td>
              <td>
                {moment.utc(r.date).format("DD/MM/YYYY")}
                <span class="md:hidden">{moment.utc(r.date).format("hh:mm a")}</span>
              </td>
              <td class="max-md:hidden">
                {moment.utc(r.date).format("hh:mm a")}
              </td>
              <td>
                <div class="flex w-full flex-wrap">
                  {#each r.categories as cat}
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
  {:else if error}
    <span class="text-center text-red-500!">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </span>

    <!-- <Button class="mt-8 w-min" on:click={refreshContestData}>Recargar</Button> -->
    <button class="mt-8 w-min" onclick={() => window.location.reload()}>Recargar</button>
  {:else}
    <span class="text-center">No hay competencias disponibles</span>
  {/if}
</div>
