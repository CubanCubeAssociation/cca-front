<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { Link } from "svelte-routing";
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
  import PaginatorComponent from "./PaginatorComponent.svelte";
  import { Paginator } from "@classes/Paginator";
  import { getIndicatorColor, getStatus } from "@helpers/strings";

  let contestResults: CONTEST_RESULT = {
    limit: 0,
    page: 0,
    results: [],
    totalPages: 0,
    totalResults: 0,
  };

  let loading = false;
  let error = false;
  let pg = new Paginator([], 10);

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
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    pg = pg;
    refreshContestData();
  }

  onMount(() => {
    refreshContestData();
  });
</script>

<Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 grid place-items-center">
  <Heading tag="h1" class="text-center text-4xl flex justify-center gap-1 mb-8">
    Competencias
  </Heading>

  {#if contestResults.results.length > 0}
    <PaginatorComponent {pg} on:update={updatePaginator} class="mb-4" />
  {/if}

  {#if loading}
    <Spinner size="10" />
  {:else if contestResults.results.length > 0}
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
              <Link to={"/contests/" + r.name} class="flex items-center gap-2">
                <Indicator color={getIndicatorColor(r.status)} />
                <Tooltip>{getStatus(r.status)}</Tooltip>
                {r.name}
              </Link>
            </TableBodyCell>
            <TableBodyCell>{moment.utc(r.date).format("DD/MM/YYYY")}</TableBodyCell>
            <TableBodyCell>{moment.utc(r.date).format("hh:mm a")}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <PaginatorComponent {pg} on:update={updatePaginator} class="mt-4" />
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <Button class="mt-8 w-min" on:click={refreshContestData}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay competencias disponibles</Span>
  {/if}
</Card>
