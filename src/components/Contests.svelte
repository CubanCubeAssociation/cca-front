<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { Link, navigate } from "svelte-routing";
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
  } from "flowbite-svelte";

  let contestResults: CONTEST_RESULT = {
    limit: 0,
    page: 0,
    results: [],
    totalPages: 0,
    totalResults: 0,
  };

  let loading = false;
  let error = false;

  function refreshContestData() {
    loading = true;
    error = false;

    getContests()
      .then(c => {
        if (!c) {
          error = true;
          return;
        }
        contestResults = c;
      })
      .catch(_ => (error = true))
      .finally(() => {
        loading = false;
      });
  }

  onMount(() => {
    refreshContestData();
  });
</script>

<Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 grid place-items-center">
  {#if loading}
    <Spinner size="10" />
  {:else if contestResults.results.length > 0}
    <Heading tag="h2" class="text-center mb-4">Competencias</Heading>

    <Table striped shadow hoverable>
      <TableHead>
        <TableHeadCell>#</TableHeadCell>
        <TableHeadCell>Nombre</TableHeadCell>
        <TableHeadCell>Fecha</TableHeadCell>
        <TableHeadCell>Hora</TableHeadCell>
      </TableHead>

      <TableBody>
        {#each contestResults.results as r, pos}
          <TableBodyRow>
            <TableBodyCell>{pos + 1}</TableBodyCell>
            <TableBodyCell>
              <Link to={"/contests/" + r.name}>{r.name}</Link>
            </TableBodyCell>
            <TableBodyCell>{moment.utc(r.date).format("DD/MM/YYYY")}</TableBodyCell>
            <TableBodyCell>{moment.utc(r.date).format("hh:mm a")}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <Button class="mt-8" on:click={refreshContestData}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay competencias disponibles</Span>
  {/if}
</Card>
