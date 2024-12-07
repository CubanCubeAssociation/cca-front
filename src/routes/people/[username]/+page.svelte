<script lang="ts">
  import { getAvatarRoute, getCategories, getUserProfile } from "@helpers/API";
  import type { CATEGORY, USER_PROFILE, USER_RECORD_RESULT } from "@interfaces";
  import {
    Avatar,
    Button,
    ButtonGroup,
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
  import * as echarts from "echarts";
  import { goto } from "$app/navigation";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { timer } from "@helpers/timer";
  import moment from "moment";
  import { getAverage, getBest, mean, stdDev, trendLSV } from "@helpers/statistics";

  interface USER_CONTEST_RESULT {
    round: number;
    place: number;
    average: number | null;
    times: (number | null)[];
  }

  interface L_USER_RECORD_RESULT {
    type: USER_RECORD_RESULT["type"];
    category: CATEGORY | undefined;
    time: USER_RECORD_RESULT["time"];
    contest: { name: string; date: string };
  }

  interface USER_RECORD {
    wr: { amount: number; results: L_USER_RECORD_RESULT[] };
    nr: { amount: number; results: L_USER_RECORD_RESULT[] };
    pr: { amount: number; results: L_USER_RECORD_RESULT[] };
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
  let timeSerie: HTMLDivElement | null = $state(null);
  let timeChart: echarts.ECharts | null = $state(null);
  let ELO = $state(0);
  let podium = $state([0, 0, 0]);
  let groupedData: Record<string, Record<string, USER_CONTEST_RESULT[]>> = $state({});
  let categories: CATEGORY[] = $state([]);
  let selectedCategory: CATEGORY = $state({ id: "", name: "", scrambler: "333" });
  let userRecords: USER_RECORD = $state({
    wr: { amount: 0, results: [] },
    nr: { amount: 0, results: [] },
    pr: { amount: 0, results: [] },
  });
  let recordIndex = $state(0);
  let userRecord: any = $state(null);

  function getContestIndex(contests: USER_PROFILE["contests"], name: string) {
    for (let i = 0, maxi = contests.length; i < maxi; i += 1) {
      if (contests[i].name === name) return i;
    }

    return -1;
  }

  function updateResults(p: USER_PROFILE) {
    const { results, records, contests } = p;

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

    const sortCmp = (a: L_USER_RECORD_RESULT, b: L_USER_RECORD_RESULT) => {
      let diff =
        getContestIndex(contests, a.contest?.name) - getContestIndex(contests, b.contest?.name);
      if (diff) return diff;

      if (!a.category || !b.category) return 0;

      if (a.category.name != b.category.name) {
        return a.category.name < b.category.name ? -1 : 1;
      }

      return a.type < b.type ? 1 : -1;
    };

    const resMap = (e: any): L_USER_RECORD_RESULT => ({
      ...e,
      category: categories.find(ct => ct.id === e.category),
      contest: contests.find(ct => ct.name === e.contest) || contests[0],
    });

    userRecords.wr.results = records.wr.results.map(resMap);
    userRecords.nr.results = records.nr.results.map(resMap);
    userRecords.pr.results = records.pr.results.map(resMap);

    userRecords.wr.results.sort(sortCmp);
    userRecords.nr.results.sort(sortCmp);
    userRecords.pr.results.sort(sortCmp);

    recordIndex = 0;
    const recs = getRecords(userRecords).filter(rc => rc.results.length);

    if (recs.length) {
      userRecord = recs[0];
    }
  }

  async function getData() {
    await getCategories()
      .then(cats => (categories = cats.results))
      .catch(err => console.log("ERROR: ", err));

    await getUserProfile($page.params.username).then(p => {
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
    timeChart?.resize();
  }

  function isPos(times: (number | null)[], i: number, pos: number) {
    let vals = times.map((s, p) => [s || Infinity, p]);
    vals.sort((a, b) => (a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]));
    return vals[pos][1] === i;
  }

  function isMo3(category: CATEGORY) {
    return ["666wca", "777wca"].indexOf(category.scrambler) > -1;
  }

  function getRecords(ur: typeof userRecords) {
    return [
      { type: "WR", name: "récord mundial", results: ur.wr.results },
      { type: "NR", name: "récord nacional", results: ur.nr.results },
      { type: "PR", name: "récord provincial", results: ur.pr.results },
    ];
  }

  $effect(() => {
    if (!(selectedCategory.name in groupedData) || !profile || !timeChart) return;

    const categoryData = groupedData[selectedCategory.name];
    const solves: (number | null)[] = profile.contests
      .reduce(
        (acc, e) => [...(categoryData[e.name] || []).map(e1 => e1.times), ...acc],
        [] as any[]
      )
      .flat(3);

    // Best marks
    let bestSerie: echarts.SeriesOption = {
      data: getBest(solves.map(s => s || Infinity)),
      type: "line",
      name: "Mejor",
      clip: false,
      coordinateSystem: "cartesian2d",
      lineStyle: {
        type: "dashed",
      },
    };

    // Trend
    let trendSerie: echarts.SeriesOption[] = (() => {
      if (solves.filter(s => s).length < 3) {
        return [
          { name: "Tendencia", data: [], type: "line" },
          { name: "trend-low", data: [], type: "line" },
          { name: "trend-high", data: [], type: "line" },
        ];
      }

      const { m, n } = trendLSV(solves.map((s, p) => [p, s || Infinity]));
      const nn = stdDev(
        solves.map(s => s || Infinity),
        mean(solves.map(s => s || Infinity))
      );

      console.log("M_N_DEV", m, n, nn);

      return [
        {
          name: "Tendencia",
          data: solves.map((_, p) => [p, m * p + n]),
          type: "line",
          showSymbol: false,
          tooltip: { show: false },
          lineStyle: { type: "dashed", color: "white" },
        },
        {
          name: "trend-low",
          data: solves.map((_, p) => [p, m * p + n - nn / 2]),
          type: "line",
          showSymbol: false,
          stack: "trend-band",
          lineStyle: { opacity: 0 },
          tooltip: { show: false },
        },
        {
          name: "trend-high",
          data: solves.map((_, p) => [p, nn]),
          type: "line",
          showSymbol: false,
          stack: "trend-band",
          areaStyle: { color: "#fff4" },
          lineStyle: { opacity: 0 },
          tooltip: { show: false },
        },
      ];
    })();

    let options: echarts.EChartsOption = {
      xAxis: {
        type: "category",
        data: solves.map((_, p) => p + 1),
      },
      yAxis: {
        type: "value",
        min: "dataMin",
        max: "dataMax",
        name: "Tiempo",
        axisLabel: {
          formatter: value => timer(value, false, true),
        },
      },
      grid: {
        right: "1%",
      },
      legend: {
        data: ["Tiempos", "Mejor", "Ao5", "Tendencia"],
        top: "6%",
      },
      dataZoom: [
        {
          type: "slider",
          xAxisIndex: [0],
        },
        {
          type: "inside",
          minSpan: 0,
          maxSpan: 100,
        },
      ],
      series: [
        {
          data: solves.map(time => time),
          type: "line",
          connectNulls: false,
          name: "Tiempos",
          smooth: solves.length < 2000,
        },
        bestSerie,
        {
          data: getAverage(
            5,
            solves.map(time => time || Infinity)
          ),
          type: "line",
          connectNulls: false,
          name: "Ao5",
          smooth: solves.length < 2000,
        },
        ...trendSerie,
      ],
      backgroundColor: "transparent",
      tooltip: {
        ...tooltipStyle,
        axisPointer: {
          type: "cross",
          label: {
            color: tooltipStyle.textStyle?.color,
            backgroundColor: tooltipStyle.backgroundColor,
            borderColor: "#ddff",
            borderWidth: 2,
            formatter({ axisDimension, value }: any) {
              return axisDimension === "x"
                ? +value.toString() + ""
                : timer(+value.toString(), true, true);
            },
          },
          animation: false,
          animationDurationUpdate: 0,
        },
        formatter: function (params: any) {
          let output = params[0].axisValueLabel + "<br/>";
          let pos = +params[0].axisValueLabel;

          output += '<table style="width: 100%;">';

          params.forEach(function (param: any) {
            const value = Array.isArray(param.data) ? param.data[1] : param.data;
            const name: string = param.seriesName;

            if ((name.startsWith("Ao") && pos < +name.slice(2)) || name.startsWith("anomaly")) {
              return;
            }

            output += `<tr>
              <td>${param.marker}</td>
              <td>${name}</td>
              <td style="text-align: right; font-weight: bold; padding-left: .5rem;">${timer(
                +value || Infinity,
                true,
                true
              )}</td>
            </tr>`;
          });

          return output + "</table>";
        },
      },
      animation: true,
      animationDuration: 500,
    };

    timeChart.setOption(options);

    timeChart.off("dataZoom");
    timeChart.off("legendselectchanged");
    timeChart.on("dataZoom", function (params: any) {
      if (!timeChart) return;

      let start = Math.round(
        ((params.batch ? params.batch[0].start : params.start) * solves.length) / 100
      );
      let end = Math.round(
        ((params.batch ? params.batch[0].start : params.start) * solves.length) / 100
      );

      timeChart.setOption({
        series: (Array.isArray(options.series) ? options.series : [options.series]).map(() => ({
          smooth: Math.abs(end - start) <= 800,
        })),
      });
    });

    timeChart.on("legendselectchanged", function (ev: any) {
      let trendName = "Tendencia";
      let hTrend: echarts.LineSeriesOption = trendSerie.filter(
        s => s.name === "trend-high"
      )[0] as any;

      if (!ev.selected[trendName]) {
        hTrend.areaStyle!.color = "transparent";
      } else {
        hTrend.areaStyle!.color = "#fff4";
      }

      timeChart?.setOption(options);
    });

    timeChart?.setOption(options);
    timeChart?.resize();
    console.log("SETOPTIONS");
  });

  onMount(() => {
    console.log(!!timeChart, !!timeSerie);

    if (!timeChart && timeSerie) {
      timeChart = echarts.init(timeSerie, "dark", { renderer: "svg" });
      timeChart.resize();
    }

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

        <ul class="podium-list">
          <li class="first">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              <Award variant="trophy" type="gold" size={awardSize} />
            </Heading>
            <span class="text-gray-800 dark:text-white">{podium[0]}</span>
          </li>
          <li class="second">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              <Award variant="trophy" type="silver" size={awardSize * 0.9} />
            </Heading>
            <span class="text-gray-800 dark:text-white">{podium[1]}</span>
          </li>
          <li class="third">
            <Heading tag="h3" class="text-center text-lg flex items-center justify-center gap-2">
              <Award variant="trophy" type="bronze" size={awardSize * 0.8} />
            </Heading>
            <span class="text-gray-800 dark:text-white">{podium[2]}</span>
          </li>
        </ul>
      </section>

      <!-- Records -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">Récords</Heading>

        {#if getRecords(userRecords).filter(rc => rc.results.length).length === 0}
          El usuario no tiene ningún récord todavía
        {:else}
          <ButtonGroup class="space-x-px mb-4">
            {#each getRecords(userRecords).filter(rc => rc.results.length) as ur, p}
              <Button
                on:click={() => {
                  recordIndex = p;
                  userRecord = ur;
                }}
                color={p === recordIndex ? "primary" : "alternative"}
                class="text-black dark:text-white"
                pill
              >
                {ur.type} ({ur.results.length})
              </Button>
              <Tooltip class="!text-gray-200 capitalize">{ur.name}</Tooltip>
            {/each}
          </ButtonGroup>

          {#if userRecord}
            <Table shadow divClass="w-full relative overflow-auto max-h-[30rem]">
              <TableHead>
                <TableHeadCell class={TABLE_HEAD_CLASS}>No.</TableHeadCell>
                <TableHeadCell class={TABLE_HEAD_CLASS}>Record</TableHeadCell>
                <TableHeadCell class={TABLE_HEAD_CLASS}>Tiempo</TableHeadCell>
                <TableHeadCell class={TABLE_HEAD_CLASS}>Competencia</TableHeadCell>
                <TableHeadCell class={TABLE_HEAD_CLASS}>Fecha</TableHeadCell>
              </TableHead>

              <TableBody>
                {#each userRecord.results as res, p}
                  <TableBodyRow
                    class={p % 2 ? "bg-gray-200 dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-700"}
                  >
                    <TableBodyCell class={TABLE_CELL_CLASS}>
                      {p + 1}
                    </TableBodyCell>
                    <TableBodyCell class={TABLE_CELL_CLASS}>
                      <div class="flex items-center">
                        <WcaCategory icon={res.category?.scrambler} size="1.5rem" />
                        {res.category?.name} (<span
                          class={res.type === "single" ? " !text-green-400" : " !text-purple-400"}
                          >{res.type === "single" ? "Single" : "Media"}</span
                        >)
                      </div>
                    </TableBodyCell>
                    <TableBodyCell
                      class={TABLE_CELL_CLASS +
                        (res.type === "single" ? " !text-green-400" : " !text-purple-400")}
                    >
                      {timer(res.time || Infinity, true, true)}
                    </TableBodyCell>
                    <TableBodyCell class={TABLE_CELL_CLASS}>
                      <a href={`/contests/` + res.contest.name} class="hover:text-primary-300"
                        >{res.contest?.name}</a
                      >
                    </TableBodyCell>
                    <TableBodyCell class={TABLE_CELL_CLASS}>
                      {moment(res.contest?.date).format("DD/MM/YYYY")}
                    </TableBodyCell>
                  </TableBodyRow>
                {/each}
              </TableBody>
            </Table>
          {/if}
        {/if}
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
        {/if}
      </section>

      <!-- Performance -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">
          Desempeño ({selectedCategory.name})
        </Heading>

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

        <div class="grid place-items-center h-[20rem] w-full" bind:this={timeSerie}></div>
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
