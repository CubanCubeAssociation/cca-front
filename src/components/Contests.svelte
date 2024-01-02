<script lang="ts">
  import { onMount } from "svelte";
  import moment from 'moment';
  import { Link, navigate } from 'svelte-routing';
  import { getContests } from "@helpers/API";
  import type { CONTEST_RESULT } from "@interfaces";
  import { Table, TableHead, TableHeadCell, Heading, Card, TableBody, TableBodyCell, TableBodyRow } from "flowbite-svelte";

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
      contestResults.results = [
        ...contestResults.results,
        ...contestResults.results,
        ...contestResults.results,
      ]
    });
  });
</script>

<Heading class="text-center text-3xl mt-4">Competencias</Heading>

<Card class="mx-auto max-w-[60rem] mt-4">
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
</Card>

<!-- <div class="card">  -->

  <!-- <table class="table-auto text-center w-full mt-4">
    <thead class="border-b border-black">
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Fecha</th>
        <th>Hora</th>
      </tr>
    </thead>
    <tbody>
      {#each contestResults.results as r, pos}
        <tr class="hover:bg-gray-200 cursor-pointer transition-all duration-100"
          on:click={ () => navigate('/contests/' + r.name) }
        >
          <td class="text-black">{pos + 1}</td>
          <td class="text-blue-600">{r.name}</td>
          <td class="text-orange-600">
            { moment( r.date ).format('DD/MM/YYYY') }
          </td>
          <td class="text-green-600">
            { moment( r.date ).format('hh:mm a') }
          </td>
        </tr>
      {/each}
    </tbody>
  </table> -->
<!-- </div> -->