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
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import type { Scrambler } from "@interfaces";
  import { timer } from "@helpers/timer";
  import { onMount } from "svelte";
  import { getResults } from "@helpers/API";
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

  let categoryMap: Map<string, string> = $state(new Map());
  let categoryIcon: Map<string, Scrambler> = $state(new Map());
  let nrMap: Map<string, { single: ISingleRecord | null; mean: ISingleRecord | null }> = $state(
    new Map()
  );
  let prMap: Map<
    string,
    Map<string, { single: IAverageResult | null; mean: IAverageResult | null }>
  > = new Map();

  let loading = $state(false);
  let error = $state(false);

  function updateCategoryMap() {
    loading = true;
    error = false;

    getResults()
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

        NR_single.forEach(sr => {
          if (!sr.time) return;
          nrMap.set(sr.category.id, { single: sr, mean: null });
        });

        NR_avg.forEach(sr => {
          if (nrMap.has(sr.category.id)) {
            const nr = nrMap.get(sr.category.id)!;
            nr.mean = sr;
          }
          // else { // No tiene sentido tener una media sin single
          //   nrMap.set(sr.category.id, { single: null, mean: sr });
          // }
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

<Card class="mx-auto mb-8 mt-4 flex w-[calc(100%-2rem)] max-w-4xl flex-col items-center gap-4">
  <Heading tag="h1" class="flex items-center justify-center gap-1 text-center text-4xl">
    <TrophyIcon size="2rem" class="text-yellow-300" /> Resultados
  </Heading>

  {#if loading}
    <Spinner />
  {:else if getSortedEntries(categoryMap, 1).length > 0}
    <!-- NR -->
    <Heading
      tag="h2"
      class="mt-8 flex w-max items-center justify-center gap-1 rounded-md
      p-2 text-center text-xl !text-green-300"
    >
      Récords Nacionales
    </Heading>

    <Table hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell class="px-2 py-4">Categoría</TableHeadCell>
        <TableHeadCell class="flex gap-1 px-2 py-4">
          <span class="max-sm:text-green-400">Single</span>
          <span class="sm:hidden">/</span>
          <span class="max-sm:text-purple-400 sm:hidden">Media</span>
        </TableHeadCell>
        <TableHeadCell class="px-2 py-4">Competidor</TableHeadCell>
        <TableHeadCell class="px-2 py-4 max-sm:hidden">Media</TableHeadCell>
        <TableHeadCell class="px-2 py-4 max-sm:hidden">Competidor</TableHeadCell>
      </TableHead>

      <TableBody>
        {#each getSortedEntries(categoryMap, 1) as cats}
          {@const nr = nrMap.get(cats[0])}
          {@const nrs = nr?.single}
          {@const nra = nr?.mean}

          <TableBodyRow class={nra && nra.time ? "max-sm:row-span-2" : ""}>
            <TableBodyCell class="px-2">
              <Heading
                tag="h3"
                class="col-span-2 flex w-fit items-center justify-center gap-1 text-center text-lg"
              >
                <WcaCategory icon={categoryIcon.get(cats[0])} size="1.2rem" />
                {cats[1]}
              </Heading>
            </TableBodyCell>

            <TableBodyCell class="gap-4 px-2">
              <a href={"/contests/" + nrs?.contest}>
                <span class="flex items-center justify-between gap-2 text-green-400">
                  {timer(nrs?.time || 0, true, true)}
                  <LinkIcon size="1.2rem" />
                </span>
              </a>
              {#if nra && nra.time}
                <a href={"/contests/" + nra.contest} class="sm:hidden">
                  <span class="mt-2 flex items-center justify-between gap-2 text-purple-400">
                    {timer(nra.time, true, true)}
                    <LinkIcon size="1.2rem" />
                  </span>
                </a>
              {/if}
            </TableBodyCell>
            <TableBodyCell class="px-2 max-sm:grid">
              <span class="text-sm">
                {nrs?.contestant.name}
              </span>
              {#if nra && nra.time}
                <span class="mt-2 text-sm sm:hidden">{nra.contestant.name}</span>
              {/if}
            </TableBodyCell>

            {#if nra && nra.time}
              <TableBodyCell class="px-2 max-sm:hidden">
                <a href={"/contests/" + nra.contest}>
                  <span class="flex items-center justify-between gap-2 text-purple-400">
                    {timer(nra.time, true, true)}
                    <LinkIcon size="1.2rem" />
                  </span>
                </a>
              </TableBodyCell>
              <TableBodyCell class="px-2 max-sm:hidden">
                <span class="text-sm">{nra.contestant.name}</span>
              </TableBodyCell>
            {:else}
              <TableBodyCell class="px-2 max-sm:hidden">-</TableBodyCell>
              <TableBodyCell class="px-2 max-sm:hidden">-</TableBodyCell>
            {/if}
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <!-- PR -->
    <Heading
      tag="h2"
      class="mt-14 flex w-max items-center justify-center gap-1 rounded-md
      p-2 text-center text-xl !text-green-300"
    >
      Récords Provinciales
    </Heading>

    {#each getSortedEntries(categoryMap, 1) as cats}
      {@const pr = prMap.get(cats[0])}

      {#if pr}
        <Heading
          tag="h3"
          class="col-span-2 flex w-fit items-center justify-center gap-1 text-center text-lg"
        >
          <WcaCategory icon={categoryIcon.get(cats[0])} size="1.2rem" />
          {cats[1]}
        </Heading>

        <Table hoverable shadow divClass="w-full relative overflow-x-auto">
          <TableHead>
            <TableHeadCell class="px-2 py-4">Provincia</TableHeadCell>
            <TableHeadCell class="flex gap-1 px-2 py-4">
              <span class="max-sm:text-green-400">Single</span>
              <span class="sm:hidden">/</span>
              <span class="max-sm:text-purple-400 sm:hidden">Media</span>
            </TableHeadCell>
            <TableHeadCell class="px-2 py-4">Competidor</TableHeadCell>
            <TableHeadCell class="px-2 py-4 max-sm:hidden">Media</TableHeadCell>
            <TableHeadCell class="px-2 py-4 max-sm:hidden">Competidor</TableHeadCell>
          </TableHead>

          <TableBody>
            {#each pr.entries() as prRes}
              {@const prSingle = prRes[1].single}
              {@const prMean = prRes[1].mean}

              <TableBodyRow>
                <TableBodyCell class="px-2">{prRes[0]}</TableBodyCell>

                <TableBodyCell class="px-2">
                  <a href={"/contests/"}>
                    <span class="flex items-center justify-between gap-2 text-green-400">
                      {timer(prSingle?.time || 0, true, true)}
                      <LinkIcon size="1.2rem" />
                    </span>
                  </a>

                  {#if prMean && prMean.time}
                    <a href={"/contests/"} class="sm:hidden">
                      <span class="mt-2 flex items-center justify-between gap-2 text-purple-400">
                        {timer(prMean.time, true, true)}
                        <LinkIcon size="1.2rem" />
                      </span>
                    </a>
                  {/if}
                </TableBodyCell>
                <TableBodyCell class="px-2">
                  <span class="flex items-end text-sm">{prSingle?.contestant.name}</span>

                  {#if prMean && prMean.time}
                    <span class="mt-2 flex items-center justify-between gap-2 text-sm sm:hidden"
                      >{prMean.contestant.name}</span
                    >
                  {/if}
                </TableBodyCell>

                {#if prMean && prMean.time}
                  <TableBodyCell class="px-2 max-sm:hidden">
                    <a href={"/contests/"}>
                      <span class="flex items-center justify-between gap-2 text-purple-400">
                        {timer(prMean.time, true, true)}
                        <LinkIcon size="1.2rem" />
                      </span>
                    </a>
                  </TableBodyCell>
                  <TableBodyCell class="px-2 max-sm:hidden">
                    <span class="text-sm">{prMean.contestant.name}</span>
                  </TableBodyCell>
                {:else}
                  <TableBodyCell class="px-2 max-sm:hidden">-</TableBodyCell>
                  <TableBodyCell class="px-2 max-sm:hidden">-</TableBodyCell>
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
