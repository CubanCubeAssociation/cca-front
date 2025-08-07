<script lang="ts">
  import { onMount } from "svelte";
  import {
    getCategories,
    getRanking,
    redirectOnUnauthorized,
    updateRanking,
    updateRankings,
  } from "@helpers/API";
  import type { CATEGORY, RANKING } from "@interfaces";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import Select from "@components/Select.svelte";
  // import { PROVINCIAS } from "@constants";
  import { timer } from "@helpers/timer";
  import { minRole } from "@helpers/auth";
  import { NotificationService } from "@stores/notification.service";
  import { userStore } from "@stores/user";
  import { screen } from "@stores/screen.store";
  import { randomUUID } from "@helpers/strings";
  import { Paginator } from "@classes/Paginator.svelte";
  import Award from "@components/Award.svelte";
  import UserField from "@components/UserField.svelte";
  import RankingIcon from "@icons/SortNumericAscending.svelte";
  import ReloadIcon from "@icons/Reload.svelte";
  import { contestNameToLink } from "@helpers/routing";
  import { twMerge } from "tailwind-merge";

  const notification = NotificationService.getInstance();
  const debug = false;

  let rankingResults: RANKING[] = $state([]);

  let loading = $state(false);
  let error = $state(false);
  let pg = $state(new Paginator([], 20));
  let categories: CATEGORY[] = $state([]);
  let category: CATEGORY | null = $state(null);
  let type: "Single" | "Media" = $state("Single");

  function refreshRankingData() {
    loading = true;
    error = false;

    getCategories()
      .then(res => {
        if (!res) return;
        categories = res.results.sort((a, b) => (a.name < b.name ? -1 : 1));
        category = categories.reduce(
          (acc, c) => (acc ? acc : c.name.startsWith("3x3") ? c : acc),
          null as CATEGORY | null
        );
        category = category || categories[0];
      })
      .then(() => getRankingInfo(category ? category.id : "", type))
      .catch(err => {
        if (debug) console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => (loading = false));
  }

  function handleUpdateCategory() {
    updateRanking(category ? category.id : "", type)
      .then(() => {
        notification.addNotification({
          key: randomUUID(),
          header: "Actualizado",
          text: "Se actualizó el ranking para " + category?.name + " " + type,
          timeout: 2000,
        });
      })
      .catch(err => {
        if (debug) console.log("ERROR: ", err);
        redirectOnUnauthorized(err);
      });
  }

  function handleUpdateRanking() {
    updateRankings()
      .then(() => {
        notification.addNotification({
          key: randomUUID(),
          header: "Actualizado",
          text: "Se actualizó el ranking general",
          timeout: 2000,
        });
      })
      .catch(err => {
        if (debug) console.log("ERROR: ", err);
        redirectOnUnauthorized(err);
      });
  }

  async function getRankingInfo(cId: string, tp: "Single" | "Media") {
    if (debug) console.log("getRankingInfo");
    if (debug) console.trace();
    loading = true;
    error = false;

    rankingResults.length = 0;

    return getRanking(cId, tp)
      .then(c => {
        if (!c) {
          error = true;
          return;
        }
        rankingResults = c;
        if (debug) console.log("RESULTS: ", rankingResults);
        pg.setData(rankingResults);
        pg.setPage(1);
      })
      .catch(err => {
        if (debug) console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => (loading = false));
  }

  onMount(() => {
    refreshRankingData();
  });
</script>

<div class="card mx-auto mb-8 mt-4 max-w-4xl">
  <h1 class="mb-2 flex items-center justify-center gap-1 text-center text-4xl">
    <RankingIcon size="2rem" class="text-green-400 dark:text-green-300" /> Ranking
  </h1>

  <div class="actions mb-2 flex flex-wrap justify-center gap-4">
    <Select
      bind:value={category}
      items={categories}
      transform={e => e}
      label={e => e.name}
      placement="right"
      hasIcon={e => e.scrambler}
      onChange={e => getRankingInfo(e.id, type)}
    />

    <Select
      bind:value={type}
      items={["Single", "Media"]}
      transform={e => e}
      label={e => e}
      placement="right"
      onChange={e => getRankingInfo(category?.id || "", e)}
    />

    <!-- <Select
      bind:value={province}
      items={[null, ...PROVINCIAS]}
      transform={e => e}
      label={e => (e ? e.nombre : "Cuba")}
      placement="right"
      placeholder="Provincia"
    /> -->

    {#if minRole($userStore, "admin")}
      <div class="dropdown dropdown-hover">
        <div tabindex="0" role="button" class="btn m-1"><ReloadIcon size="1rem" /></div>
        <ul class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
          <li><a href="?#" onclick={handleUpdateCategory}>Actualizar Categoría</a></li>
          <li><a href="?#" onclick={handleUpdateRanking}>Actualizar General</a></li>
        </ul>
      </div>
    {/if}
  </div>

  {#if loading}
    <span class="loading loading-spinner loading-lg mx-auto"></span>
  {:else if rankingResults.length > 0}
    <PaginatorComponent showNextPrev={!$screen.isMobile} bind:pg />

    <div class="overflow-x-auto w-full">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>{type === "Single" ? "Tiempo" : "Promedio"}</th>
            <th>Competencia</th>
          </tr>
        </thead>

        <tbody>
          {#each rankingResults.slice(pg.start, pg.end) as r, pos}
            <tr>
              <td>
                {#if pos === 0 && pg.page === 1}
                  <Award type="gold" />
                {:else if pos === 1 && pg.page === 1}
                  <Award type="silver" />
                {:else if pos === 2 && pg.page === 1}
                  <Award type="bronze" />
                {:else}
                  <span class="flex justify-center">{(pg.page - 1) * pg.limit + pos + 1}</span>
                {/if}
              </td>
              <td>
                <UserField user={r.contestant} link />
              </td>
              <td>
                <a
                  href={contestNameToLink(r.contest, {
                    category: category?.name,
                    time: r.time,
                    type: type === "Single" ? "single" : "avg",
                    username: r.contestant.username,
                  })}
                  target="_blank"
                >
                  <span
                    class={twMerge(
                      "flex items-center justify-between gap-2",
                      type === "Single" ? "text-green-400" : "text-purple-400"
                    )}
                  >
                    {r.time ? timer(r.time, true, true) : "DNF"}
                  </span>
                </a>
              </td>
              <td>
                <a class="text-blue-300" href={contestNameToLink(r.contest)} target="_blank">
                  {r.contest}
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <PaginatorComponent showNextPrev={!$screen.isMobile} bind:pg class="mt-4" />
  {:else if error}
    <span class="text-center text-red-500!">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </span>

    <button
      class="btn btn-primary mt-8"
      onclick={() => (category ? getRankingInfo(category.id || "", type) : refreshRankingData())}
    >
      Recargar
    </button>
  {:else}
    <span class="text-center">No hay resultados disponibles para {category?.name} {type}</span>
  {/if}
</div>
