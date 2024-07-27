<script lang="ts">
  import type { ROUND } from "@interfaces";
  import {
    Accordion,
    AccordionItem,
    Heading,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import WcaCategory from "./wca/WCACategory.svelte";
  import { actualTime, sTimer, timer } from "@helpers/timer";
  import Award from "./Award.svelte";
  import { userStore } from "@stores/user";
  import { minRole } from "@helpers/auth";
  import { createEventDispatcher } from "svelte";

  export let roundGroup: ROUND[][] = [];

  const dispatch = createEventDispatcher();
  const rndKeys = ["t1", "t2", "t3", "t4", "t5"] as const;

  function isPos(round: ROUND, i: number, pos: number) {
    let vals = [round.t1, round.t2, round.t3, round.t4, round.t5].map(
      (s, p) => [actualTime(s), p]
    );
    vals.sort((a, b) => (a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]));
    return vals[pos][1] === i;
  }

  function isMo3(rounds: ROUND[]) {
    return ["666wca", "777wca"].indexOf(rounds[0].category.scrambler) > -1;
  }

  function editRound(rnd: ROUND) {
    dispatch('edit', rnd);
  }
</script>

<Accordion class="w-full">
  {#each roundGroup as rounds}
    <AccordionItem paddingDefault="py-0 px-2">
      <Heading tag="h4" slot="header" class="flex items-center gap-2 my-4">
        <WcaCategory icon={rounds[0].category.scrambler} size="1.5rem" />
        {rounds[0].category.name}
      </Heading>

      <Table
        striped
        hoverable
        shadow
        divClass="w-full relative overflow-x-auto"
      >
        <TableHead>
          <TableHeadCell>No.</TableHeadCell>
          <TableHeadCell>Nombre</TableHeadCell>
          <TableHeadCell>T1</TableHeadCell>
          <TableHeadCell>T2</TableHeadCell>
          <TableHeadCell>T3</TableHeadCell>
          <TableHeadCell>T4</TableHeadCell>
          <TableHeadCell>T5</TableHeadCell>

          {#if ["666wca", "777wca"].indexOf(rounds[0].category.scrambler) > -1}
            <TableHeadCell>Mo3</TableHeadCell>
          {:else}
            <TableHeadCell>Ao5</TableHeadCell>
          {/if}
        </TableHead>

        <TableBody>
          {#each rounds as rnd, p}
            <TableBodyRow>
              <TableBodyCell>
                {#if p === 0}
                  <Award type="gold" />
                {:else if p === 1}
                  <Award type="silver" />
                {:else if p === 2}
                  <Award type="bronze" />
                {:else}
                  <span class="flex justify-center">{p + 1}</span>
                {/if}
              </TableBodyCell>

              {#if minRole($userStore, "admin")}
                <TableBodyCell on:click={() => editRound(rnd)}
                  >{rnd.contestant.name}</TableBodyCell
                >
              {:else}
                <TableBodyCell>{rnd.contestant.name}</TableBodyCell>
              {/if}

              {#each rndKeys as tp, p}
                {#if p < 3 || !isMo3(rounds)}
                  <TableBodyCell>
                    <span
                      class="flex"
                      class:best={isPos(rnd, p, 0)}
                      class:worst={isPos(rnd, p, isMo3(rounds) ? 2 : 4)}
                    >
                      {sTimer(rnd[tp], true)}
                      <!--  <Award type="NR"/> -->
                    </span>
                  </TableBodyCell>
                {:else}
                  <TableBodyCell>-</TableBodyCell>
                {/if}
              {/each}

              <TableBodyCell>
                <span class="flex">
                  {timer(rnd.average, true)}
                  <!-- <Award type="NR"/> -->
                </span>
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>
    </AccordionItem>
  {/each}
</Accordion>

<style lang="postcss">
  .best {
    @apply text-green-500;
  }

  .worst {
    @apply text-red-500;
  }
</style>
