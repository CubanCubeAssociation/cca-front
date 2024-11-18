<script lang="ts">
  import { onMount } from "svelte";
  import { getContests, updateResults } from "@helpers/API";
  import type { CONTEST } from "@interfaces";
  import {
    Button,
    Card,
    Heading,
    Indicator,
    Span,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tooltip,
  } from "flowbite-svelte";
  import moment from "moment";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import PlusIcon from "@icons/Plus.svelte";
  import { Paginator } from "@classes/Paginator.svelte";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";
  import { page } from "$app/stores";

  const HEADER = "Competencias";
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
        goto($page.url.pathname + `/?page=${pg.page}`, { replaceState: true });
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    pg = pg;
    refreshContestData();
  }

  function updateResult() {
    updateResults()
      .then(res => {
        if (debug) console.log("RESULT: ", res);
      })
      .catch(err => console.log("ERROR: ", err));
  }

  onMount(() => {
    refreshContestData();
  });
</script>

<PrivateRouteGuard>
  <Card class="mx-auto mb-8 mt-4 grid w-[calc(100%-2rem)] max-w-6xl place-items-center">
    <Heading tag="h2" class="mb-4 text-center">{HEADER}</Heading>

    <div class="actions">
      <Button on:click={addContest}>
        <PlusIcon size="1.2rem" />
        {ADD}
      </Button>

      <Button color="purple" on:click={updateResult}>Actualizar Resultados</Button>
    </div>

    {#if loading}
      <Spinner size="10" class="mx-auto" />
    {:else if contests.length > 0}
      <PaginatorComponent {pg} update={updatePaginator} class="mb-4" />
      <Table hoverable shadow divClass="w-full relative overflow-x-auto">
        <TableHead>
          <TableHeadCell>#</TableHeadCell>
          <TableHeadCell>Nombre</TableHeadCell>
          <TableHeadCell>Fecha</TableHeadCell>
          <TableHeadCell>Hora</TableHeadCell>
          <TableHeadCell>Categorías</TableHeadCell>
        </TableHead>

        <TableBody>
          {#each contests as ct, pos}
            <TableBodyRow>
              <TableBodyCell>{(pg.page - 1) * pg.limit + pos + 1}</TableBodyCell>
              <TableBodyCell>
                <a href={"/admin/contest/" + ct.name} class="flex items-center gap-2">
                  <Indicator color={getIndicatorColor(ct.status)} />
                  <Tooltip>{getStatus(ct.status)}</Tooltip>
                  {ct.name}
                </a>
              </TableBodyCell>
              <TableBodyCell>{moment.utc(ct.date).format("DD/MM/YYYY")}</TableBodyCell>
              <TableBodyCell>{moment.utc(ct.date).format("hh:mm a")}</TableBodyCell>
              <TableBodyCell>
                <div class="flex w-full flex-wrap">
                  {#each ct.categories as cat}
                    <WcaCategory icon={cat.category.scrambler} size="1.2rem" />
                    <Tooltip>{cat.category.name}</Tooltip>
                  {/each}
                </div>
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>

      <PaginatorComponent {pg} update={updatePaginator} class="mt-4" />

      <div class="actions">
        <Button on:click={addContest}>
          <PlusIcon size="1.2rem" />
          {ADD}
        </Button>
      </div>
    {:else if error}
      <Span class="text-center !text-red-500">
        Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
      </Span>

      <Button class="mt-8 w-min" on:click={refreshContestData}>Recargar</Button>
    {:else}
      <Span class="text-center">No hay competencias disponibles</Span>
    {/if}
  </Card>
</PrivateRouteGuard>

<style lang="postcss">
  .actions {
    @apply my-4 flex justify-start gap-2;
  }
</style>
