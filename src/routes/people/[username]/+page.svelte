<script lang="ts">
  import { getAvatarRoute, getCategories, getUserProfile } from "@helpers/API";
  import type { CATEGORY, USER_PROFILE } from "@interfaces";
  import {
    Avatar,
    Button,
    Card,
    Heading,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tooltip,
  } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/stores";
  import UserField from "@components/UserField.svelte";
  import { minRole } from "@helpers/auth";
  import { userStore } from "$lib/stores/user";
  import LocationIcon from "@icons/MapMarkerOutline.svelte";
  import VerifiedIcon from "@icons/CheckDecagramOutline.svelte";
  import Award from "@components/Award.svelte";
  import UnderConstruction from "@components/UnderConstruction.svelte";
  import * as echarts from "echarts";
  import { goto } from "$app/navigation";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { timer } from "@helpers/timer";

  interface USER_CONTEST_RESULT {
    round: number;
    place: number;
    average: number | null;
    times: (number | null)[];
  }

  const awardSize = 2;
  const tooltipStyle: echarts.TooltipComponentOption = {
    trigger: "axis",
    axisPointer: {
      type: "line",
    },
    textStyle: { color: "#a2a0a0" },
    backgroundColor: "#1c1b2a",
    confine: true,
  };

  const TABLE_HEAD_CLASS = "px-2 text-center";
  const TABLE_CELL_CLASS =
    "px-2 text-center [&:not(:first-child)]:border-l [&:not(:first-child)]:border-l-gray-600";

  // let loading = $state(false);
  // let error = $state(false);

  let profile: USER_PROFILE | null = $state(null);
  let stepPercentSerie: HTMLDivElement;
  let stepPercentChart: echarts.ECharts;
  let ELO = $state(0);
  let podium = $state([0, 0, 0]);
  let groupedData: Record<string, Record<string, USER_CONTEST_RESULT[]>> = $state({});
  let categories: CATEGORY[] = $state([]);
  let selectedCategory: CATEGORY = $state({ id: "", name: "", scrambler: "333" });

  function updateResults(p: USER_PROFILE) {
    const { results } = p;

    groupedData = {};

    results.forEach(result => {
      result.contests.forEach(contest => {
        const { category, round, average, times } = contest;

        if (!groupedData[category.name]) {
          groupedData[category.name] = {};
        }

        if (!groupedData[category.name][contest.contestName]) {
          groupedData[category.name][contest.contestName] = [];
        }

        groupedData[category.name][contest.contestName].push({
          round,
          place: result.place,
          average,
          times,
        });
      });
    });

    for (let category in groupedData) {
      for (let contest in groupedData[category]) {
        if (!Array.isArray(groupedData[category][contest])) continue;
        groupedData[category][contest].sort((a: any, b: any) => a.round - b.round);
      }
    }

    selectedCategory = categories.find(ct => ct.name in groupedData) || selectedCategory;
  }

  function getData() {
    getCategories()
      .then(cats => (categories = cats.results))
      .catch(err => console.log("ERROR: ", err));

    getUserProfile($page.params.username).then(p => {
      if (!p) {
        goto("/people", { replaceState: true });
        return;
      }

      profile = p;
      updateResults(p);
      updateCharts();
    });
  }

  function updateCharts() {
    if (!profile) return;
    if (!stepPercentChart) {
      stepPercentChart = echarts.init(stepPercentSerie, "dark", { renderer: "svg" });
    }

    const { results, records } = profile;

    let summary: any[][] = results.reduce(
      (acc: any[][], e) => {
        acc[Math.min(3, e.place - 1)][1] += e.amount;
        acc[Math.min(3, e.place - 1)][2] += e.points;

        return acc;
      },
      [
        ["1ro", 0, 0],
        ["2do", 0, 0],
        ["3ro", 0, 0],
        ["4to+", 0, 0],
      ]
    );

    podium = summary.slice(0, 3).map(e => e[1]);

    summary.unshift(["PR", records.pr.results.length, records.pr.points]);
    summary.unshift(["NR", records.nr.results.length, records.nr.points]);
    summary.unshift(["WR", records.wr.results.length, records.wr.points]);

    summary = summary.filter(e => e[1]);

    // ELO = Math.round(summary.reduce((acc, e) => acc + e[2], 0) * getEloDecay(totalContests));
    ELO = summary.reduce((acc, e) => acc + e[2], 0);

    let stepOption: echarts.EChartsOption = {
      series: [
        {
          name: "Logro",
          data: summary.map(e => ({
            value: e[2],
            name: e[0],
          })),
          type: "pie",
          radius: ["40%", "70%"],
          itemStyle: { borderRadius: 10, borderWidth: 3, borderColor: "#fff1" },
          top: "0%",
          bottom: "5%",
        },
      ],
      backgroundColor: "transparent",
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        valueFormatter(v, e) {
          return `${v} (${summary[e][1]} ${summary[e][1] === 1 ? "vez" : "veces"})`;
        },
      },
    };

    stepPercentChart.setOption(stepOption);
  }

  function handleResize() {
    stepPercentChart?.resize();
  }

  function isPos(times: (number | null)[], i: number, pos: number) {
    let vals = times.map((s, p) => [s || Infinity, p]);
    vals.sort((a, b) => (a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]));
    return vals[pos][1] === i;
  }

  function isMo3(category: CATEGORY) {
    return ["666wca", "777wca"].indexOf(category.scrambler) > -1;
  }

  onMount(() => {
    getData();
  });

  onDestroy(() => {
    stepPercentChart?.dispose();
  });
</script>

<svelte:window on:resize={handleResize} />

<Card class="mx-auto mb-8 mt-4 flex w-[calc(100%-2rem)] max-w-6xl flex-col items-center gap-4">
  <section class="grid md:flex gap-4 w-full">
    <aside class="w-full md:max-w-[16rem] h-fit">
      <!-- Profile -->
      <section id="profile">
        <Avatar
          size="lg"
          src={getAvatarRoute(profile?.user.username || "")}
          border
          class={"p-0 " +
            (profile?.user.role === "root"
              ? "!ring-purple-500 dark:!ring-purple-400"
              : profile?.user.role === "admin"
                ? "!ring-primary-500 dark:!ring-primary-400"
                : profile?.user.role === "delegate"
                  ? "!ring-green-500 dark:!ring-green-400"
                  : "")}
        />
        <h1 class="font-bold text-lg">
          <UserField
            class="!w-fit text-center text-black dark:text-white"
            user={profile?.user || { username: "", name: "", role: "user" }}
          />
        </h1>
        <span class="text-sm flex items-center gap-1">
          <LocationIcon size="1.1rem" class="text-yellow-200" />
          {profile?.user.province}
        </span>
        <span class="text-sm flex items-center gap-1">
          <a
            href={`/people/${profile?.user.username || "#"}`}
            class="block truncate text-sm font-medium text-pink-400"
          >
            CCA ID: {profile?.user.username}
          </a>
        </span>
        <span class="text-sm flex items-center gap-1">
          Sexo: {profile?.user ? (profile?.user.sex === "M" ? "Masculino" : "Femenino") : ""}
        </span>
        <span class="text-sm flex items-center gap-1">Edad: {profile?.user.age}</span>

        {#if minRole($userStore, "delegate")}
          <span class="text-sm flex items-center gap-1">Crédito: {profile?.user.credit} CUP</span>
          <span class="text-sm flex items-center gap-1">
            {profile?.user.email}

            {#if profile?.user.isEmailVerified || true}
              <VerifiedIcon class="text-green-300" />
            {/if}
          </span>
        {/if}
      </section>

      <!-- ELO -->
      <section id="profile-elo">
        <Heading tag="h2" class="text-center mb-4 text-2xl">ELO: {ELO}</Heading>

        <div class="grid w-full h-[10rem]" bind:this={stepPercentSerie}></div>
      </section>
    </aside>

    <aside>
      <!-- Podium -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">Podios</Heading>
        <!-- <UnderConstruction /> -->

        <ul class="podium-list">
          <li class="first">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              <Award variant="trophy" type="gold" size={awardSize} />
            </Heading>
            <span>{podium[0]}</span>
          </li>
          <li class="second">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              <Award variant="trophy" type="silver" size={awardSize * 0.9} />
            </Heading>
            <span>{podium[1]}</span>
          </li>
          <li class="third">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              <Award variant="trophy" type="bronze" size={awardSize * 0.8} />
            </Heading>
            <span>{podium[2]}</span>
          </li>
        </ul>
      </section>

      <!-- Records -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">Récords</Heading>
        <!-- <UnderConstruction /> -->

        <ul class="podium-list">
          <li class="first">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              WR: {profile?.records.wr.results.length}
            </Heading>
            <Tooltip class="!text-gray-200">Récord Mundial</Tooltip>
          </li>
          <li class="second">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              NR: {profile?.records.nr.results.length}
            </Heading>
            <Tooltip class="!text-gray-200">Récord Nacional</Tooltip>
          </li>
          <li class="third">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              PR: {profile?.records.pr.results.length}
            </Heading>
            <Tooltip class="!text-gray-200">Récord Provincial</Tooltip>
          </li>
        </ul>
      </section>

      <!-- Results -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl"
          >Resultados ({selectedCategory.name})</Heading
        >

        <ul class="w-full flex flex-wrap gap-2 justify-center mb-4">
          {#each categories.filter(ct => ct.name in groupedData) as cat}
            <Button color="alternative" class="!p-0" on:click={() => (selectedCategory = cat)}>
              <WcaCategory
                class={"cursor-pointer " +
                  (selectedCategory.name === cat.name ? "text-green-300" : "")}
                icon={cat.scrambler}
              />
            </Button>
          {/each}
        </ul>

        {#if selectedCategory.name === "" || !profile}
          No hay resultados que mostrar
        {:else}
          <Table shadow divClass="w-full relative overflow-x-auto">
            <TableHead>
              <TableHeadCell class={TABLE_HEAD_CLASS}>No.</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS}>Competencia</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS}>Ronda</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS}>Lugar</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS}>Single</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS}>Media</TableHeadCell>
              <TableHeadCell class={TABLE_HEAD_CLASS} colspan={isMo3(selectedCategory) ? 3 : 5}>
                Resultados
              </TableHeadCell>
            </TableHead>

            <TableBody>
              {#if selectedCategory.name in groupedData}
                {@const categoryData = groupedData[selectedCategory.name]}

                {#each profile.contests.filter(cnt => cnt.name in categoryData) as cnt, p}
                  {@const contestData = categoryData[cnt.name]}

                  {#each contestData as result, rp}
                    <TableBodyRow
                      class={"!border-t-gray-600 " +
                        (p % 2 ? "bg-gray-200 dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-700")}
                    >
                      {#if rp === 0}
                        <TableBodyCell class={TABLE_CELL_CLASS} rowspan={contestData.length}>
                          <span class="flex justify-center">{p + 1}</span>
                        </TableBodyCell>
                        <TableBodyCell class={TABLE_CELL_CLASS} rowspan={contestData.length}>
                          <span class="flex justify-center">
                            <a href={`/contests/` + cnt.name} class="hover:text-primary-300"
                              >{cnt.name}</a
                            >
                          </span>
                        </TableBodyCell>
                      {/if}

                      <TableBodyCell
                        class={TABLE_CELL_CLASS + (p ? " border-l border-l-gray-600" : "")}
                      >
                        <span class="flex justify-center">Ronda {result.round}</span>
                      </TableBodyCell>
                      <TableBodyCell class={TABLE_CELL_CLASS}>
                        <span class="flex justify-center">
                          {#if result.place === 1}
                            <Award type="gold" />
                          {:else if result.place === 2}
                            <Award type="silver" />
                          {:else if result.place === 3}
                            <Award type="bronze" />
                          {/if}

                          {result.place}
                        </span>
                      </TableBodyCell>
                      <TableBodyCell class={TABLE_CELL_CLASS}>
                        <span class="flex justify-center text-green-400">
                          {timer(
                            Math.min(...result.times.map(t => t || Infinity)) || Infinity,
                            true
                          )}
                        </span>
                      </TableBodyCell>
                      <TableBodyCell class={TABLE_CELL_CLASS}>
                        <span class="flex justify-center text-purple-400">
                          {timer(result.average || Infinity, true)}
                        </span>
                      </TableBodyCell>

                      {#each result.times as t, p1}
                        <TableBodyCell class={TABLE_CELL_CLASS}>
                          <span
                            class="flex justify-center"
                            class:best={isPos(result.times, p1, 0)}
                            class:worst={isPos(result.times, p1, isMo3(selectedCategory) ? 2 : 4)}
                            >{timer(t || Infinity, true)}</span
                          >
                        </TableBodyCell>
                      {/each}
                    </TableBodyRow>
                  {/each}
                {/each}
              {/if}
            </TableBody>
          </Table>

          <ul class="w-full flex flex-wrap gap-2 justify-center mt-8">
            {#each categories.filter(ct => ct.name in groupedData) as cat}
              <Button color="alternative" class="!p-0" on:click={() => (selectedCategory = cat)}>
                <WcaCategory
                  class={"cursor-pointer " +
                    (selectedCategory.name === cat.name ? "text-green-300" : "")}
                  icon={cat.scrambler}
                />
              </Button>
            {/each}
          </ul>
        {/if}
      </section>

      <!-- Development -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">Desempeño</Heading>
        <UnderConstruction />
      </section>
    </aside>
  </section>
</Card>

<style lang="postcss">
  aside {
    @apply grid gap-4 w-full;
  }

  aside > section {
    @apply border border-gray-400 dark:border-gray-700 py-4 px-2 rounded-md shadow-md 
      bg-[#fff1] grid place-items-center;
  }

  #profile {
    @apply grid place-items-center gap-2 h-fit;
  }

  .podium-list {
    @apply flex justify-center w-full;
  }

  .podium-list li {
    @apply p-2 grid place-items-center w-full max-w-28;
  }

  .podium-list li.second {
    @apply border-l border-l-gray-400;
  }

  .podium-list li.third {
    @apply border-l border-l-gray-400;
  }

  .podium-list li span {
    @apply text-3xl;
  }

  #profile-elo {
    @apply h-fit;
  }

  :global(#profile-elo text) {
    stroke: transparent;
    fill: white;
    filter: drop-shadow(-1px 1px 0.2px #0003);
  }

  .best {
    @apply text-green-400;
  }

  .worst {
    @apply text-red-500;
  }
</style>
