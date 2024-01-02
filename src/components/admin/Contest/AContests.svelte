<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import { getContests } from "@helpers/API";
  import type { CONTEST } from "@interfaces";
  import { Card, Heading, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  import moment from "moment";

  let contests: CONTEST[] = [];

  onMount(() => {
    getContests().then((res) => {
      if ( !res ) return;
      contests = res.results;
    })
  });

</script>

<Card class="mx-auto max-w-[60rem] mt-4">
  <Heading tag="h2" class="text-center mb-4">Competencias</Heading>

  <Table striped shadow hoverable>
    <TableHead>
      <TableHeadCell>#</TableHeadCell>
      <TableHeadCell>Nombre</TableHeadCell>
      <TableHeadCell>Fecha</TableHeadCell>
      <TableHeadCell>Hora</TableHeadCell>
    </TableHead>

    <TableBody>
      {#each contests as ct, pos}
        <TableBodyRow>
          <TableBodyCell>{pos + 1}</TableBodyCell>
          <TableBodyCell>
            <Link to={ '/admin/contest/' + ct.id }> {ct.name} </Link>
          </TableBodyCell>
          <TableBodyCell>{ moment( ct.date ).format('DD/MM/YYYY') }</TableBodyCell>
          <TableBodyCell>{ moment( ct.date ).format('hh:mm a') }</TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
</Card>