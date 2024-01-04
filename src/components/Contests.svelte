<script lang="ts">
  import { onMount } from "svelte";
  import moment from 'moment';
  import { Link, navigate } from 'svelte-routing';
  import { getContests } from "@helpers/API";
  import type { CONTEST_RESULT } from "@interfaces";
  import { Table, TableHead, TableHeadCell, Heading, Card, TableBody, TableBodyCell, TableBodyRow, Span } from "flowbite-svelte";

  let contestResults: CONTEST_RESULT = {
    limit: 0,
    page: 0,
    results: [],
    totalPages: 0,
    totalResults: 0
  };

  onMount(() => {
    getContests().then(c => {
      if ( !c ) return;

      contestResults = c;
      // contestResults.results = [
      //   ...contestResults.results,
      //   ...contestResults.results,
      //   ...contestResults.results,
      // ]
    });
  });
</script>

<Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8">
  {#if contestResults.results.length > 0 }
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
              <Link to={ '/contests/' + r.name }> {r.name} </Link>
            </TableBodyCell>
            <TableBodyCell>{ moment( r.date ).format('DD/MM/YYYY') }</TableBodyCell>
            <TableBodyCell>{ moment( r.date ).format('hh:mm a') }</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {:else}
    <Span class="text-center">No hay competencias disponibles</Span>
  {/if}
</Card>