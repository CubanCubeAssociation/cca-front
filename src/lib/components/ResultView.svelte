<script lang="ts">
  import type { ROUND } from "@interfaces";
  import { Accordion, AccordionItem, Heading } from "flowbite-svelte";
  import WcaCategory from "./wca/WCACategory.svelte";

  import ResultTable from "./ResultTable.svelte";

  interface IResultViewProps {
    roundGroup: ROUND[][][];
    allowEdit?: boolean;
    edit?: (round: ROUND) => void;
  }

  let { roundGroup, allowEdit = false, edit }: IResultViewProps = $props();
</script>

<Accordion class="w-full">
  {#each roundGroup as group}
    {@const category = group.flat
      ? group.flat()[0]
      : group.reduce((acc, e) => [...acc, ...e], [])[0]}

    <AccordionItem paddingDefault="py-0 px-0 pr-2">
      <Heading tag="h4" slot="header" class="flex items-center gap-2 my-4 pl-2">
        <WcaCategory icon={category.category.scrambler} size="1.5rem" />
        {category.category.name}
      </Heading>

      {#each group as rounds}
        {#if group.length > 1}
          <Heading tag="h5" class="flex items-center gap-2 mb-4 pt-4 justify-center">
            Ronda {rounds[0].round}
          </Heading>
        {/if}

        <ResultTable {category} {rounds} {allowEdit} edit={rnd => edit?.(rnd)} />
      {/each}
    </AccordionItem>
  {/each}
</Accordion>
