<script lang="ts">
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
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
  import { Paginator } from "@classes/Paginator";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";

  const HEADER = "Competencias";
  const ADD = "Añadir competencia";

  let contests: CONTEST[] = [];
  let pg = new Paginator([], 10);
  let loading = false;
  let error = false;

  function addContest() {
    navigate("/admin/contest/new");
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
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    pg = pg;
    refreshContestData();
  }

  function getResult() {
    updateResults()
      .then(res => {
        console.log("RESULT: ", res);
      })
      .catch(err => console.log("ERROR: ", err));
  }

  onMount(() => {
    refreshContestData();
  });
</script>

<Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8">
  <Heading tag="h2" class="text-center mb-4">{HEADER}</Heading>

  <div class="actions">
    <Button on:click={addContest}>
      <PlusIcon size="1.2rem" />
      {ADD}
    </Button>

    <Button color="purple" on:click={getResult}>Resultados</Button>
  </div>

  {#if contests.length > 0}
    <PaginatorComponent {pg} on:update={updatePaginator} class="mb-4" />
  {/if}

  {#if loading}
    <Spinner size="10" class="mx-auto" />
  {:else if contests.length > 0}
    <Table striped shadow hoverable>
      <TableHead>
        <TableHeadCell>#</TableHeadCell>
        <TableHeadCell>Nombre</TableHeadCell>
        <TableHeadCell>Fecha</TableHeadCell>
        <TableHeadCell>Hora</TableHeadCell>
        <TableHeadCell>Categorías</TableHeadCell>
        <TableHeadCell>Estado</TableHeadCell>
      </TableHead>

      <TableBody>
        {#each contests as ct, pos}
          <TableBodyRow>
            <TableBodyCell>{pos + 1}</TableBodyCell>
            <TableBodyCell>
              <Link to={"/admin/contest/" + ct.name}>{ct.name}</Link>
            </TableBodyCell>
            <TableBodyCell>{moment.utc(ct.date).format("DD/MM/YYYY")}</TableBodyCell>
            <TableBodyCell>{moment.utc(ct.date).format("hh:mm a")}</TableBodyCell>
            <TableBodyCell>
              <div class="w-full flex flex-wrap gap-2">
                {#each ct.categories as cat}
                  <WcaCategory icon={cat.category.scrambler} />
                  <Tooltip>{cat.category.name}</Tooltip>
                {/each}
              </div>
            </TableBodyCell>
            <TableBodyCell>
              <!-- export type CONTEST_STATUS = 'pending' | 'inscription' | 'running' | 'results' | 'finished'; -->
              <div class="flex items-center gap-2">
                <Indicator color={getIndicatorColor(ct.status)} />
                {getStatus(ct.status)}
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <PaginatorComponent {pg} on:update={updatePaginator} class="mt-4" />

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

<style lang="postcss">
  .actions {
    @apply flex justify-start my-4;
  }
</style>
