<script lang="ts">
  import { onMount } from "svelte";
  import { getCategories, getRanking, updateRanking, updateRankings } from "@helpers/API";
  import type { CATEGORY, PROVINCE, RANKING } from "@interfaces";
  import {
    Table,
    TableHead,
    TableHeadCell,
    Heading,
    Card,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    Span,
    Spinner,
    Button,
    Indicator,
    Tooltip,
  } from "flowbite-svelte";
  import PaginatorComponent from "./PaginatorComponent.svelte";
  import { Paginator } from "@classes/Paginator";
  import Select from "./Select.svelte";
  // import { PROVINCIAS } from "@constants";
  import { timer } from "@helpers/timer";
  import { minRole } from "@helpers/auth";
  import { NotificationService } from "@stores/notification.service";
  import { userStore } from "@stores/user";
  import { screen } from "@stores/screen.store";
  import { randomUUID } from "@helpers/strings";
  import { Link } from "svelte-routing";
  import LinkIcon from "@icons/OpenInNew.svelte";
  import Award from "./Award.svelte";

  const notification = NotificationService.getInstance();
  const debug = false;

  let rankingResults: RANKING[] = [];

  let loading = false;
  let error = false;
  let pg = new Paginator([], 20);
  let categories: CATEGORY[] = [];
  let category: CATEGORY | null = null;
  let type: "Single" | "Media" = "Single";
  // let province: PROVINCE | null = null;

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
        debug && console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    pg = pg;
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
      .catch(err => debug && debug && console.log("ERROR: ", err));
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
      .catch(err => console.log("ERROR: ", err));
  }

  async function getRankingInfo(cId: string, tp: "Single" | "Media") {
    debug && console.log("getRankingInfo");
    console.trace();
    loading = true;
    error = false;

    return getRanking(cId, tp)
      .then(c => {
        if (!c) {
          error = true;
          return;
        }
        rankingResults = c;
        debug && console.log("RESULTS: ", rankingResults);
        pg.setData(rankingResults);
        pg = pg;
      })
      .catch(err => {
        debug && console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => (loading = false));
  }

  onMount(() => {
    refreshRankingData();
  });
</script>

<Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 grid place-items-center">
  <Heading tag="h1" class="text-center text-4xl flex justify-center gap-1 mb-4">Ranking</Heading>

  <div class="actions flex flex-wrap gap-4 justify-center mb-8">
    <Select
      bind:value={category}
      items={categories}
      transform={e => e}
      label={e => e.name}
      placement="right"
      hasIcon={e => e.scrambler}
      onChange={e => getRankingInfo(e, type)}
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
      <Button color="green" class="py-1" on:click={handleUpdateCategory}>
        Actualizar Categoría
      </Button>
      <Button color="purple" class="py-1" on:click={handleUpdateRanking}>Actualizar General</Button>
    {/if}
  </div>

  {#if rankingResults.length > 0}
    <PaginatorComponent
      showNextPrev={!$screen.isMobile}
      {pg}
      on:update={updatePaginator}
      class="mb-4"
    />
  {/if}

  {#if loading}
    <Spinner size="10" />
  {:else if rankingResults.length > 0}
    <Table hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell>#</TableHeadCell>
        <TableHeadCell>Nombre</TableHeadCell>
        <TableHeadCell>{type === "Single" ? "Tiempo" : "Promedio"}</TableHeadCell>
        <TableHeadCell>Competencia</TableHeadCell>
      </TableHead>

      <TableBody>
        {#each rankingResults.slice(pg.start, pg.end) as r, pos}
          <TableBodyRow>
            <TableBodyCell>
              {#if pos === 0 && pg.page === 1}
                <Award type="gold" />
              {:else if pos === 1 && pg.page === 1}
                <Award type="silver" />
              {:else if pos === 2 && pg.page === 1}
                <Award type="bronze" />
              {:else}
                <span class="flex justify-center">{(pg.page - 1) * pg.limit + pos + 1}</span>
              {/if}
            </TableBodyCell>
            <TableBodyCell>{r.contestant.name}</TableBodyCell>
            <TableBodyCell>
              <span class={type === "Single" ? "text-green-400" : "text-purple-400"}>
                {r.time ? timer(r.time, true, true) : "DNF"}
              </span>
            </TableBodyCell>
            <TableBodyCell>
              <Link to={"/contests/" + r.contest} target="_blank">
                <span class="text-blue-300 flex gap-2 items-center justify-between">
                  {r.contest}
                  <LinkIcon size="1.2rem" />
                </span>
              </Link>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <PaginatorComponent {pg} on:update={updatePaginator} class="mt-4" />
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <Button class="mt-8 w-min" on:click={refreshRankingData}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay resultados disponibles para {category?.name} {type}</Span>
  {/if}
</Card>
