<script lang="ts">
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import { getContests } from "@helpers/API";
  import type { CONTEST } from "@interfaces";
  import { Button, Card, Heading, Indicator, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Tooltip } from "flowbite-svelte";
  import moment from "moment";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import PlusIcon from '@icons/Plus.svelte';
  
  const HEADER = "Competencias";
  const ADD = "Añadir competencia";

  let contests: CONTEST[] = [];

  function addContest() {
    navigate('/admin/contest/new');
  }

  onMount(() => {
    getContests().then((res) => {
      if ( !res ) return;
      contests = res.results;
    })
  });

</script>

<Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8">
  <Heading tag="h2" class="text-center mb-4">{ HEADER }</Heading>

  <div class="actions">
    <Button on:click={ addContest }>
      <PlusIcon size="1.2rem"/> { ADD }
    </Button>
  </div>

  {#if contests.length > 0 }
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
              <Link to={ '/admin/contest/' + ct.name }> {ct.name} </Link>
            </TableBodyCell>
            <TableBodyCell>{ moment( ct.date ).format('DD/MM/YYYY') }</TableBodyCell>
            <TableBodyCell>{ moment( ct.date ).format('hh:mm a') }</TableBodyCell>
            <TableBodyCell>
              <div class="w-full flex flex-wrap gap-2">
                {#each ct.categories as cat }
                  <WcaCategory icon={ cat.category.scrambler }/>
                  <Tooltip>{ cat.category.name }</Tooltip>
                {/each}
              </div>
            </TableBodyCell>
            <TableBodyCell>
              <!-- export type CONTEST_STATUS = 'pending' | 'inscription' | 'running' | 'results' | 'finished'; -->
              <div class="flex items-center gap-2">
                <Indicator color={ getIndicatorColor(ct.status) }/> { getStatus(ct.status) }
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <div class="actions">
      <Button on:click={ addContest }>
        <PlusIcon size="1.2rem"/> { ADD }
      </Button>
    </div>
  {/if}
</Card>

<style lang="postcss">
  .actions {
    @apply flex justify-start my-4;
  }
</style>