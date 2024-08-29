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

  export let roundGroup: ROUND[][][] = [];
  export let allowEdit = false;

  const dispatch = createEventDispatcher();
  const rndKeys = ["t1", "t2", "t3", "t4", "t5"] as const;
  const TABLE_HEAD_CLASS = "px-2 text-center";
  const TABLE_CELL_CLASS =
    "px-2 text-center [&:not(:first-child)]:border-l [&:not(:first-child)]:border-l-gray-700";

  function isPos(round: ROUND, i: number, pos: number) {
    let vals = [round.t1, round.t2, round.t3, round.t4, round.t5].map((s, p) => [actualTime(s), p]);
    vals.sort((a, b) => (a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]));
    return vals[pos][1] === i;
  }

  function isMo3(rounds: ROUND[]) {
    return ["666wca", "777wca"].indexOf(rounds[0].category.scrambler) > -1;
  }

  function editRound(rnd: ROUND) {
    rnd.id = rnd.category.id + rnd.round + rnd.contestant.id;
    dispatch("edit", rnd);
  }
</script>

<Accordion class="w-full">
  {#each roundGroup as group}
    {@const category = group.reduce((acc, e) => [...acc, ...e], [])[0]}

    <AccordionItem paddingDefault="py-0 px-0 pr-2">
      <Heading tag="h4" slot="header" class="flex items-center gap-2 my-4">
        <WcaCategory icon={category.category.scrambler} size="1.5rem" />
        {category.category.name}
      </Heading>

      {#each group as rounds}
        <Heading tag="h5" slot="header" class="flex items-center gap-2 my-4 justify-center">
          Ronda {rounds[0].round}
        </Heading>

        <Table hoverable shadow divClass="w-full relative overflow-x-auto">
          <TableHead>
            <TableHeadCell class={TABLE_HEAD_CLASS}>No.</TableHeadCell>
            <TableHeadCell class={TABLE_HEAD_CLASS}>Nombre</TableHeadCell>
            <TableHeadCell class={TABLE_HEAD_CLASS}>T1</TableHeadCell>
            <TableHeadCell class={TABLE_HEAD_CLASS}>T2</TableHeadCell>
            <TableHeadCell class={TABLE_HEAD_CLASS}>T3</TableHeadCell>

            {#if ["666wca", "777wca"].indexOf(category.category.scrambler) > -1}
              <TableHeadCell class={TABLE_HEAD_CLASS}>Mo3</TableHeadCell>
            {:else}
              <TableHeadCell class={TABLE_HEAD_CLASS}>T4</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS}>T5</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS + " dark:text-primary-400"}>Ao5</TableHeadCell>
            {/if}
          </TableHead>

          <TableBody>
            {#each rounds as rnd, p}
              <TableBodyRow>
                <TableBodyCell class={TABLE_CELL_CLASS}>
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
                  <TableBodyCell
                    class={TABLE_CELL_CLASS + (allowEdit ? " cursor-pointer" : "")}
                    on:click={() => editRound(rnd)}>{rnd.contestant.name}</TableBodyCell
                  >
                {:else}
                  <TableBodyCell class={TABLE_CELL_CLASS}>{rnd.contestant.name}</TableBodyCell>
                {/if}

                {#each rndKeys as tp, p}
                  {#if p < 3 || !isMo3(rounds)}
                    <TableBodyCell class={TABLE_CELL_CLASS}>
                      <span
                        class="flex justify-center"
                        class:best={isPos(rnd, p, 0)}
                        class:worst={isPos(rnd, p, isMo3(rounds) ? 2 : 4)}
                      >
                        {sTimer(rnd[tp], true)}
                        <!--  <Award type="NR"/> -->
                      </span>
                    </TableBodyCell>
                  {/if}
                {/each}

                <TableBodyCell class={TABLE_CELL_CLASS}>
                  <span class="flex justify-center dark:text-primary-400 text-primary-600">
                    {timer(rnd.average, true)}
                    <!-- <Award type="NR"/> -->
                  </span>
                </TableBodyCell>
              </TableBodyRow>
            {/each}
          </TableBody>
        </Table>
      {/each}
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
