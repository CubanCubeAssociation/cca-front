<script lang="ts">
  import {
    Button,
    Card,
    Heading,
    Span,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import WcaCategory from "./wca/WCACategory.svelte";
  import type { Scrambler } from "@interfaces";
  import { timer } from "@helpers/timer";
  import { onMount } from "svelte";
  import { updateResults } from "@helpers/API";
  import { Link } from "svelte-routing";
  import LinkIcon from "@icons/OpenInNew.svelte";
  import TrophyIcon from "@icons/Trophy.svelte";

  interface ISingleRecord {
    category: {
      name: string;
      id: string;
      scrambler: Scrambler;
    };
    contestant: {
      name: string;
      username: string;
    };
    contest: string;
    time: number;
  }

  interface IAverageRecord {
    category: {
      id: string;
      name: string;
      scrambler: Scrambler;
    };
    records: {
      time: number;
      contestant: {
        name: string;
        username: string;
        province: string;
      };
    }[];
  }

  let categoryMap: Map<string, string> = new Map();
  let categoryIcon: Map<string, Scrambler> = new Map();
  let nrSingleMap: Map<string, ISingleRecord> = new Map();
  let nrAvgMap: Map<string, ISingleRecord> = new Map();
  let prSingleMap: Map<string, IAverageRecord> = new Map();
  let prAvgMap: Map<string, IAverageRecord> = new Map();

  let loading = false;
  let error = false;

  function updateCategoryMap() {
    loading = true;
    error = false;

    updateResults()
      .then((res: any) => {
        if (!res) {
          error = true;
          return;
        }

        const { data } = res;

        categoryMap.clear();
        categoryIcon.clear();
        nrSingleMap.clear();
        nrAvgMap.clear();
        prSingleMap.clear();
        prAvgMap.clear();

        let NR_avg: ISingleRecord[] = data[0];
        let PR_avg: IAverageRecord[] = data[1];
        let NR_single: ISingleRecord[] = data[2];
        let PR_single: IAverageRecord[] = data[3];

        [NR_avg, PR_avg, NR_single, PR_single].forEach(list =>
          list.forEach(({ category }) => {
            categoryMap.set(category.id, category.name);
            categoryIcon.set(category.id, category.scrambler);
          })
        );

        NR_avg.forEach(sr => nrAvgMap.set(sr.category.id, sr));
        NR_single.forEach(sr => nrSingleMap.set(sr.category.id, sr));

        categoryMap = categoryMap;
        categoryIcon = categoryIcon;
        nrSingleMap = nrSingleMap;
        nrAvgMap = nrAvgMap;
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function getCategories(_: any) {
    return [...categoryMap.entries()].sort((a, b) => (a[1] < b[1] ? -1 : 1));
  }

  onMount(() => {
    updateCategoryMap();
  });
</script>

<Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
  <Heading tag="h1" class="text-center text-4xl flex justify-center gap-1 items-center">
    Resultados <TrophyIcon size="2rem" class="text-yellow-300" />
  </Heading>

  {#if loading}
    <Spinner />
  {:else if getCategories(categoryMap).length > 0}
    <Table hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell class="px-2 py-4">Categoría</TableHeadCell>
        <TableHeadCell class="px-2 py-4">Single</TableHeadCell>
        <TableHeadCell class="px-2 py-4"></TableHeadCell>
        <TableHeadCell class="px-2 py-4">Media</TableHeadCell>
        <TableHeadCell class="px-2 py-4"></TableHeadCell>
      </TableHead>

      <TableBody>
        {#each getCategories(categoryMap) as cats}
          {@const nrs = nrSingleMap.get(cats[0])}
          {@const nra = nrAvgMap.get(cats[0])}
          <TableBodyRow>
            <TableBodyCell class="px-2">
              <Heading
                tag="h2"
                class="text-center text-lg w-fit flex justify-center items-center gap-1 col-span-2"
              >
                <WcaCategory icon={categoryIcon.get(cats[0])} size="1.2rem" />
                {cats[1]}
              </Heading>
            </TableBodyCell>

            {#if nrs && nrs.time}
              <TableBodyCell class="px-2">
                <Link to={"/contests/" + nrs.contest}>
                  <span class="text-green-400 flex gap-2 items-center">
                    {timer(nrs.time, true, true)}
                    <LinkIcon size="1.2rem" />
                  </span>
                </Link>
              </TableBodyCell>
              <TableBodyCell class="px-2">
                <span class="text-sm">{nrs.contestant.name}</span>
              </TableBodyCell>
            {:else}
              <TableBodyCell class="px-2">-</TableBodyCell>
              <TableBodyCell class="px-2">-</TableBodyCell>
            {/if}

            {#if nra && nra.time}
              <TableBodyCell class="px-2">
                <Link to={"/contests/" + nra.contest}>
                  <span class="text-purple-400 flex gap-2 items-center">
                    {timer(nra.time, true, true)}
                    <LinkIcon size="1.2rem" />
                  </span>
                </Link>
              </TableBodyCell>
              <TableBodyCell class="px-2">
                <span class="text-sm">{nra.contestant.name}</span>
              </TableBodyCell>
            {:else}
              <TableBodyCell class="px-2">-</TableBodyCell>
              <TableBodyCell class="px-2">-</TableBodyCell>
            {/if}
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <Button class="mt-8 w-min" on:click={updateCategoryMap}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay resultados disponibles</Span>
  {/if}
</Card>
