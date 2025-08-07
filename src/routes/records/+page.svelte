<script lang="ts">
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import type { ROLE, Scrambler } from "@interfaces";
  import { timer } from "@helpers/timer";
  import { onMount } from "svelte";
  import { getResults } from "@helpers/API";
  import LinkIcon from "@icons/OpenInNew.svelte";
  import TrophyIcon from "@icons/Trophy.svelte";
  import UserField from "@components/UserField.svelte";
  import { contestNameToLink } from "@helpers/routing";

  interface ISingleRecord {
    category: {
      name: string;
      id: string;
      scrambler: Scrambler;
    };
    contestant: {
      name: string;
      username: string;
      role: ROLE;
      id: string;
    };
    contest: string;
    time: number;
  }

  interface IAverageResult {
    time: number;
    contest: string;
    contestant: {
      name: string;
      username: string;
      province: string;
      role: ROLE;
      id: string;
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
          if (!nrMap.has(sr.category.id)) return;

          const nr = nrMap.get(sr.category.id)!;
          nr.mean = sr;
        });

        PR_single.forEach(pr => {
          if (!prMap.has(pr.category.id)) {
            prMap.set(pr.category.id, new Map());
          }

          const ctMap = prMap.get(pr.category.id)!;

          pr.records.forEach(rec => {
            if (!ctMap.has(rec.contestant.province)) {
              ctMap.set(rec.contestant.province, { single: rec, mean: null });
            }
          });
        });

        PR_avg.forEach(pr => {
          if (!prMap.has(pr.category.id)) return;

          const ctMap = prMap.get(pr.category.id)!;

          pr.records.forEach(rec => {
            if (!ctMap.has(rec.contestant.province)) return;
            const pr = ctMap.get(rec.contestant.province)!;
            pr.mean = rec;
            ctMap.set(rec.contestant.province, pr);
          });
        });
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

<div class="card mx-auto mb-8 mt-4 max-w-4xl">
  <h1 class="flex items-center justify-center gap-1 text-center text-4xl">
    <TrophyIcon size="2rem" class="text-yellow-400 dark:text-yellow-300" /> Récords
  </h1>

  {#if loading}
    <span class="loading loading-spinner loading-lg mx-auto"></span>
  {:else if getSortedEntries(categoryMap, 1).length > 0}
    <!-- NR -->
    <h2
      class="mt-8 flex w-max items-center justify-center gap-1 rounded-md
      p-2 text-center text-xl !text-green-300"
    >
      Récords Nacionales
    </h2>

    <div class="overflow-x-auto w-full">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th class="px-2 py-4">Categoría</th>
            <th class="flex gap-1 px-2 py-4">
              <span class="max-sm:text-green-400">Single</span>
              <span class="sm:hidden">/</span>
              <span class="max-sm:text-purple-400 sm:hidden">Media</span>
            </th>
            <th class="px-2 py-4">Competidor</th>
            <th class="px-2 py-4 max-sm:hidden">Media</th>
            <th class="px-2 py-4 max-sm:hidden">Competidor</th>
          </tr>
        </thead>

        <tbody>
          {#each getSortedEntries(categoryMap, 1) as cats}
            {@const nr = nrMap.get(cats[0])}
            {@const nrs = nr?.single}
            {@const nra = nr?.mean}

            <tr class={nra && nra.time ? "max-sm:row-span-2" : ""}>
              <td class="px-2">
                <h3
                  class="col-span-2 flex w-fit items-center justify-center gap-1 text-center text-lg"
                >
                  <WcaCategory icon={categoryIcon.get(cats[0])} size="1.2rem" />
                  {cats[1]}
                </h3>
              </td>

              <td class="gap-4 px-2">
                <a
                  href={contestNameToLink(nrs?.contest || "", {
                    category: nrs?.category.name,
                    username: nrs?.contestant.username,
                    time: nrs?.time,
                  })}
                >
                  <span class="flex items-center justify-between gap-2 text-green-400">
                    {timer(nrs?.time || 0, true, true)}
                    <LinkIcon size="1.2rem" />
                  </span>
                </a>
                {#if nra && nra.time}
                  <a
                    href={contestNameToLink(nra.contest, {
                      category: nra?.category.name,
                      username: nra?.contestant.username,
                      time: nra?.time,
                      type: "avg",
                    })}
                    class="sm:hidden"
                  >
                    <span class="mt-2 flex items-center justify-between gap-2 text-purple-400">
                      {timer(nra.time, true, true)}
                      <LinkIcon size="1.2rem" />
                    </span>
                  </a>
                {/if}
              </td>
              <td class="px-2 max-sm:grid">
                <span class="text-sm">
                  <UserField
                    link
                    user={nrs?.contestant || { name: "", role: "user", username: "" }}
                  />
                </span>
                {#if nra && nra.time}
                  <span class="mt-2 text-sm sm:hidden">
                    <UserField
                      link
                      user={nra?.contestant || { name: "", role: "user", username: "" }}
                    />
                  </span>
                {/if}
              </td>

              {#if nra && nra.time}
                <td class="px-2 max-sm:hidden">
                  <a
                    href={contestNameToLink(nra.contest, {
                      category: nra?.category.name,
                      username: nra?.contestant.username,
                      time: nra?.time,
                      type: "avg",
                    })}
                  >
                    <span class="flex items-center justify-between gap-2 text-purple-400">
                      {timer(nra.time, true, true)}
                      <LinkIcon size="1.2rem" />
                    </span>
                  </a>
                </td>
                <td class="px-2 max-sm:hidden">
                  <UserField
                    link
                    user={nra?.contestant || { name: "", role: "user", username: "" }}
                  />
                </td>
              {:else}
                <td class="px-2 max-sm:hidden">-</td>
                <td class="px-2 max-sm:hidden">-</td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- PR -->
    <h2
      class="mt-14 flex w-max items-center justify-center gap-1 rounded-md
      p-2 text-center text-xl !text-green-300"
    >
      Récords Provinciales
    </h2>

    {#each getSortedEntries(categoryMap, 1) as cats}
      {@const pr = prMap.get(cats[0])}

      {#if pr}
        <h3 class="col-span-2 flex w-fit items-center justify-center gap-1 text-center text-lg">
          <WcaCategory icon={categoryIcon.get(cats[0])} size="1.2rem" />
          {cats[1]}
        </h3>

        <div class="overflow-x-auto w-full mb-8">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th class="px-2 py-4">Provincia</th>
                <th class="flex gap-1 px-2 py-4">
                  <span class="max-sm:text-green-400">Single</span>
                  <span class="sm:hidden">/</span>
                  <span class="max-sm:text-purple-400 sm:hidden">Media</span>
                </th>
                <th class="px-2 py-4">Competidor</th>
                <th class="px-2 py-4 max-sm:hidden">Media</th>
                <th class="px-2 py-4 max-sm:hidden">Competidor</th>
              </tr>
            </thead>

            <tbody>
              {#each pr.entries() as prRes}
                {@const prSingle = prRes[1].single}
                {@const prMean = prRes[1].mean}

                <tr>
                  <td class="px-2">{prRes[0]}</td>

                  <td class="px-2">
                    <a
                      href={contestNameToLink(prSingle?.contest || "", {
                        category: cats[1],
                        username: prSingle?.contestant.username,
                        time: prSingle?.time,
                      })}
                    >
                      <span class="flex items-center justify-between gap-2 text-green-400">
                        {timer(prSingle?.time || 0, true, true)}
                        <LinkIcon size="1.2rem" />
                      </span>
                    </a>

                    {#if prMean && prMean.time}
                      <a
                        href={contestNameToLink(prMean.contest, {
                          category: cats[1],
                          username: prMean?.contestant.username,
                          time: prMean?.time,
                          type: "avg",
                        })}
                        class="sm:hidden"
                      >
                        <span class="mt-2 flex items-center justify-between gap-2 text-purple-400">
                          {timer(prMean.time, true, true)}
                          <LinkIcon size="1.2rem" />
                        </span>
                      </a>
                    {/if}
                  </td>
                  <td class="px-2">
                    <span class="flex items-end text-sm">
                      <UserField
                        link
                        user={prSingle?.contestant || { name: "", role: "user", username: "" }}
                      />
                    </span>

                    {#if prMean && prMean.time}
                      <span class="mt-2 flex items-center justify-between gap-2 text-sm sm:hidden">
                        <UserField
                          link
                          user={prMean?.contestant || { name: "", role: "user", username: "" }}
                        />
                      </span>
                    {/if}
                  </td>

                  {#if prMean && prMean.time}
                    <td class="px-2 max-sm:hidden">
                      <a
                        href={contestNameToLink(prMean.contest, {
                          category: cats[1],
                          username: prMean?.contestant.username,
                          time: prMean?.time,
                          type: "avg",
                        })}
                      >
                        <span class="flex items-center justify-between gap-2 text-purple-400">
                          {timer(prMean.time, true, true)}
                          <LinkIcon size="1.2rem" />
                        </span>
                      </a>
                    </td>
                    <td class="px-2 max-sm:hidden">
                      <span class="text-sm">
                        <UserField
                          link
                          user={prMean?.contestant || { name: "", role: "user", username: "" }}
                        />
                      </span>
                    </td>
                  {:else}
                    <td class="px-2 max-sm:hidden">-</td>
                    <td class="px-2 max-sm:hidden">-</td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/each}
  {:else if error}
    <span class="text-center text-red-500!">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </span>

    <button class="btn btn-primary mt-8" onclick={updateCategoryMap}>Recargar</button>
  {:else}
    <span class="text-center">No hay resultados disponibles</span>
  {/if}
</div>
