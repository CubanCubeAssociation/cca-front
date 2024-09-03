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

  interface IAverageResult {
    time: number;
    contestant: {
      name: string;
      username: string;
      province: string;
    };
  }

  interface IAverageRecord {
    category: {
      id: string;
      name: string;
      scrambler: Scrambler;
    };
    records: IAverageResult[];
  }

  let categoryMap: Map<string, string> = new Map();
  let categoryIcon: Map<string, Scrambler> = new Map();
  let nrMap: Map<string, { single: ISingleRecord | null; mean: ISingleRecord | null }> = new Map();
  let prMap: Map<
    string,
    Map<string, { single: IAverageResult | null; mean: IAverageResult | null }>
  > = new Map();

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
        nrMap.clear();

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

        NR_avg.forEach(sr => {
          nrMap.set(sr.category.id, { single: null, mean: sr });
        });

        NR_single.forEach(sr => {
          if (nrMap.has(sr.category.id)) {
            const nr = nrMap.get(sr.category.id)!;
            nr.single = sr;
          } else {
            nrMap.set(sr.category.id, { single: sr, mean: null });
          }
        });

        PR_avg.forEach(pr => {
          if (!prMap.has(pr.category.id)) {
            prMap.set(pr.category.id, new Map());
          }

          const ctMap = prMap.get(pr.category.id)!;

          pr.records.forEach(rec => {
            ctMap.set(rec.contestant.province, { mean: rec, single: null });
          });
        });

        PR_single.forEach(pr => {
          if (!prMap.has(pr.category.id)) {
            prMap.set(pr.category.id, new Map());
          }

          const ctMap = prMap.get(pr.category.id)!;

          pr.records.forEach(rec => {
            if (ctMap.has(rec.contestant.province)) {
              const pr = ctMap.get(rec.contestant.province)!;
              pr.single = rec;
            } else {
              ctMap.set(rec.contestant.province, { mean: rec, single: null });
            }
          });
        });

        categoryMap = categoryMap;
        categoryIcon = categoryIcon;
        nrMap = nrMap;
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function getSortedEntries(m: Map<any, any>, pos: number) {
    return [...m.entries()].sort((a, b) => (a[pos] < b[pos] ? -1 : 1));
  }

  onMount(() => {
    updateCategoryMap();
  });
</script>

<Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
  <Heading tag="h1" class="text-center text-4xl flex justify-center gap-1 items-center">
    <TrophyIcon size="2rem" class="text-yellow-300" /> Resultados
  </Heading>

  {#if loading}
    <Spinner />
  {:else if getSortedEntries(categoryMap, 1).length > 0}
    <Heading
      tag="h2"
      class="text-center text-xl w-max flex justify-center gap-1 items-center
      !text-green-300 p-2 rounded-md mt-8"
    >
      Récords Nacionales
    </Heading>

    <Table hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell class="px-2 py-4">Categoría</TableHeadCell>
        <TableHeadCell class="px-2 py-4">Single</TableHeadCell>
        <TableHeadCell class="px-2 py-4"></TableHeadCell>
        <TableHeadCell class="px-2 py-4">Media</TableHeadCell>
        <TableHeadCell class="px-2 py-4"></TableHeadCell>
      </TableHead>

      <TableBody>
        {#each getSortedEntries(categoryMap, 1) as cats}
          {@const nr = nrMap.get(cats[0])}
          {@const nrs = nr?.single}
          {@const nra = nr?.mean}

          <TableBodyRow>
            <TableBodyCell class="px-2">
              <Heading
                tag="h3"
                class="text-center text-lg w-fit flex justify-center items-center gap-1 col-span-2"
              >
                <WcaCategory icon={categoryIcon.get(cats[0])} size="1.2rem" />
                {cats[1]}
              </Heading>
            </TableBodyCell>

            {#if nrs && nrs.time}
              <TableBodyCell class="px-2">
                <Link to={"/contests/" + nrs.contest}>
                  <span class="text-green-400 flex gap-2 items-center justify-between">
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
                  <span class="text-purple-400 flex gap-2 items-center justify-between">
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

    <Heading
      tag="h2"
      class="text-center text-xl w-max flex justify-center gap-1 items-center
      !text-green-300 p-2 rounded-md mt-14"
    >
      Récords Provinciales
    </Heading>

    {#each getSortedEntries(categoryMap, 1) as cats}
      {@const pr = prMap.get(cats[0])}

      {#if pr}
        <Heading
          tag="h3"
          class="text-center text-lg w-fit flex justify-center items-center gap-1 col-span-2"
        >
          <WcaCategory icon={categoryIcon.get(cats[0])} size="1.2rem" />
          {cats[1]}
        </Heading>

        <Table hoverable shadow divClass="w-full relative overflow-x-auto">
          <TableHead>
            <TableHeadCell class="px-2 py-4">Provincia</TableHeadCell>
            <TableHeadCell class="px-2 py-4">Single</TableHeadCell>
            <TableHeadCell class="px-2 py-4"></TableHeadCell>
            <TableHeadCell class="px-2 py-4">Media</TableHeadCell>
            <TableHeadCell class="px-2 py-4"></TableHeadCell>
          </TableHead>

          <TableBody>
            {#each pr.entries() as prRes}
              {@const prSingle = prRes[1].single}
              {@const prMean = prRes[1].mean}

              <TableBodyRow>
                <TableBodyCell class="px-2">{prRes[0]}</TableBodyCell>

                {#if prSingle && prSingle.time}
                  <TableBodyCell class="px-2">
                    <Link to={"/contests/"}>
                      <span class="text-green-400 flex gap-2 items-center justify-between">
                        {timer(prSingle.time, true, true)}
                        <LinkIcon size="1.2rem" />
                      </span>
                    </Link>
                  </TableBodyCell>
                  <TableBodyCell class="px-2">
                    <span class="text-sm">{prSingle.contestant.name}</span>
                  </TableBodyCell>
                {:else}
                  <TableBodyCell class="px-2">-</TableBodyCell>
                  <TableBodyCell class="px-2">-</TableBodyCell>
                {/if}

                {#if prMean && prMean.time}
                  <TableBodyCell class="px-2">
                    <Link to={"/contests/"}>
                      <span class="text-purple-400 flex gap-2 items-center justify-between">
                        {timer(prMean.time, true, true)}
                        <LinkIcon size="1.2rem" />
                      </span>
                    </Link>
                  </TableBodyCell>
                  <TableBodyCell class="px-2">
                    <span class="text-sm">{prMean.contestant.name}</span>
                  </TableBodyCell>
                {:else}
                  <TableBodyCell class="px-2">-</TableBodyCell>
                  <TableBodyCell class="px-2">-</TableBodyCell>
                {/if}
              </TableBodyRow>
            {/each}
          </TableBody>
        </Table>
      {/if}
    {/each}
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <Button class="mt-8 w-min" on:click={updateCategoryMap}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay resultados disponibles</Span>
  {/if}
</Card>
