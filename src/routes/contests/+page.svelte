<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { getContests } from "@helpers/API";
  import type { CONTEST_RESULT } from "@interfaces";
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
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import { Paginator } from "@classes/Paginator.svelte";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import SwordIcon from "@icons/Sword.svelte";

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
        goto($page.url.pathname + `/?page=${pg.page}`, { replaceState: true });
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    pg = pg;
    refreshContestData();
  }

  onMount(() => {
    pg.page = Math.max(1, parseInt($page.url.searchParams.get("page") || "1", 10));
    refreshContestData();
  });
</script>

<Card class="mx-auto mb-8 mt-4 grid w-[calc(100%-2rem)] max-w-4xl place-items-center">
  <Heading tag="h1" class="mb-8 flex items-center justify-center gap-1 text-center text-4xl">
    <SwordIcon size="2rem" class="text-red-600 dark:text-red-400" /> Competencias
  </Heading>

  {#if loading}
    <Spinner size="10" />
  {:else if contestResults.results.length > 0}
    <PaginatorComponent {pg} update={updatePaginator} class="mb-4" />

    <Table hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell>#</TableHeadCell>
        <TableHeadCell>Nombre</TableHeadCell>
        <TableHeadCell>Fecha</TableHeadCell>
        <TableHeadCell>Hora</TableHeadCell>
      </TableHead>

      <TableBody>
        {#each contestResults.results as r, pos}
          <TableBodyRow>
            <TableBodyCell>{(pg.page - 1) * pg.limit + pos + 1}</TableBodyCell>
            <TableBodyCell>
              <a href={"/contests/" + r.name} class="flex items-center gap-2">
                <Indicator color={getIndicatorColor(r.status)} />
                <Tooltip>{getStatus(r.status)}</Tooltip>
                {r.name}
              </a>
            </TableBodyCell>
            <TableBodyCell>{moment.utc(r.date).format("DD/MM/YYYY")}</TableBodyCell>
            <TableBodyCell>{moment.utc(r.date).format("hh:mm a")}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <PaginatorComponent {pg} update={updatePaginator} class="mt-4" />
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <!-- <Button class="mt-8 w-min" on:click={refreshContestData}>Recargar</Button> -->
    <Button class="mt-8 w-min" on:click={() => window.location.reload()}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay competencias disponibles</Span>
  {/if}
</Card>
