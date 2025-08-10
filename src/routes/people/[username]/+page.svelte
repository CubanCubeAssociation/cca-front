<script lang="ts">
  import { getCategories, getFormats, getUserProfile } from "@helpers/API";
  import type { CATEGORY, FORMAT, USER_PROFILE, USER_RECORD_RESULT } from "@interfaces";
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/state";
  import UserField from "@components/UserField.svelte";
  import { minRole } from "@helpers/auth";
  import { userStore } from "$lib/stores/user";
  import Award from "@components/Award.svelte";
  import * as echarts from "echarts";
  import { goto } from "$app/navigation";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { timer } from "@helpers/timer";
  import moment from "moment";
  import { getBest, mean, stdDev, trendLSV } from "@helpers/statistics";
  import Avatar from "@components/Avatar.svelte";
  import { contestNameToLink } from "@helpers/routing";
  import { twMerge } from "tailwind-merge";
  import {
    BadgeCheckIcon,
    ClockIcon,
    FingerprintIcon,
    HandCoinsIcon,
    MapPinIcon,
    MarsIcon,
    SigmaIcon,
    VenusIcon,
  } from "lucide-svelte";
  import LoadingLayout from "@components/LoadingLayout.svelte";

  interface USER_CONTEST_RESULT {
    round: number;
    place: number;
    average: number | null;
    times: (number | null)[];
    format: string;
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

  interface RANK_ENTRY {
    time: number;
    rank: number;
    contest: string;
  }

  interface RANK {
    category: CATEGORY;
    single: RANK_ENTRY;
    average: RANK_ENTRY;
  }

  const awardSize = 1.5;
  const tooltipStyle: echarts.TooltipComponentOption = {
    trigger: "axis",
    axisPointer: {
      type: "line",
    },
    textStyle: { color: "#a2a0a0" },
    backgroundColor: "#1c1b2a",
    confine: true,
  };

  const size = "1.1rem";
  let profile: USER_PROFILE | null = $state(null);
  let categories: CATEGORY[] = $state([]);
  let stepPercentSerie: HTMLDivElement;
  let stepPercentChart: echarts.ECharts;
  let timeSerie: HTMLDivElement | null = $state(null);
  let timeChart: echarts.ECharts | null = $state(null);
  let ELO = $state(0);
  let podium = $state([0, 0, 0]);
  let groupedData: Record<string, Record<string, USER_CONTEST_RESULT[]>> = $state({});
  let selectedCategory: CATEGORY = $state({ id: "", name: "", scrambler: "333", formats: [] });
  let userRecords: USER_RECORD = $state({
    wr: { amount: 0, results: [] },
    nr: { amount: 0, results: [] },
    pr: { amount: 0, results: [] },
  });
  let recordIndex = $state(0);
  let userRecord: any = $state(null);
  let userRanks: RANK[] = $state([]);
  let formats: FORMAT[] = $state([]);

  function getContestIndex(contests: USER_PROFILE["contests"], name: string) {
    for (let i = 0, maxi = contests.length; i < maxi; i += 1) {
      if (contests[i].name === name) return i;
    }

    return -1;
  }

  function updateResults(p: USER_PROFILE) {
    const { results, records, contests, rankSummary } = p;

    groupedData = {};

    results.forEach(result => {
      result.contests.forEach(contest => {
        const { category, round, average, times, format } = contest;

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
          format,
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

    // Rankings
    userRanks = categories
      .map(cat => {
        let sng = rankSummary.find(rs => rs.category === cat.id && rs.type === "Single");
        let single = {
          contest: sng?.contest || "",
          rank: sng?.position || 0,
          time: sng?.time || 0,
        };

        let avg = rankSummary.find(rs => rs.category === cat.id && rs.type === "Media");
        let average = {
          contest: avg?.contest || "",
          rank: avg?.position || 0,
          time: avg?.time || 0,
        };

        return { category: cat, single, average };
      })
      .filter(res => res.single.rank + res.average.rank);
  }

  function updateCharts() {
    if (!profile) return;
    if (!stepPercentChart) {
      stepPercentChart = echarts.init(stepPercentSerie, "dark", { renderer: "canvas" });
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

    ELO = summary.reduce((acc, e) => acc + e[2], 0);

    summary.reverse();

    const colors = [
      "#5470c6",
      "#91cc75",
      "#fac858",
      "#ee6666",
      "#73c0de",
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ];

    let stepOption: echarts.EChartsOption = {
      xAxis: {
        type: "value",
      },
      yAxis: {
        type: "category",
        data: summary.map(e => e[0]),
      },
      series: [
        {
          data: summary.map((e, p) => ({
            value: e[2],
            itemStyle: {
              color: colors[p % colors.length],
              barBorderRadius: [0, 4, 4, 0],
            },
          })),
          type: "bar",
        },
      ],
      grid: {
        left: "20%",
        right: "5%",
        top: "0%",
        bottom: "20%",
      },
      backgroundColor: "transparent",
      tooltip: {
        ...tooltipStyle,
        trigger: "axis",
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

  function getRecords(ur: typeof userRecords) {
    return [
      { type: "WR", name: "Récord Mundial", results: ur.wr.results },
      { type: "NR", name: "Récord Nacional", results: ur.nr.results },
      { type: "PR", name: "Récord Provincial", results: ur.pr.results },
    ];
  }

  $effect(() => {
    if (!(selectedCategory.name in groupedData) || !profile || !timeChart) return;

    const categoryData = groupedData[selectedCategory.name];
    let averageData: number[][] = [];
    let averageX = 0;
    const solves: (number | null)[] = profile.contests
      .reduce(
        (acc, e) => [
          ...(categoryData[e.name] || []).map(e1 => {
            let fm = formats.find(fm => fm.name === e1.format)?.amount || 5;
            averageData.push([averageX, e1.average || 0]);
            averageX += fm;
            return e1.times.slice(0, fm);
          }),
          ...acc,
        ],
        [] as any[]
      )
      .flat(3);

    let total = solves.length;
    averageData = averageData.map(e => [total - e[0] - 1, e[1]]);

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
      const newSolves = solves.filter(s => s);

      if (newSolves.length < 3) {
        return [
          { name: "Tendencia", data: [], type: "line" },
          { name: "trend-low", data: [], type: "line" },
          { name: "trend-high", data: [], type: "line" },
        ];
      }

      const { m, n } = trendLSV(newSolves.map((s, p) => [p, s || Infinity]));
      const nn = stdDev(
        newSolves.map(s => s || Infinity),
        mean(newSolves.map(s => s || Infinity))
      );

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
        data: ["Tiempos", "Mejor", "Media", "Tendencia"],
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
          data: averageData,
          type: "line",
          connectNulls: false,
          name: "Media",
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

          output += '<table style="width: 100%;">';

          params.forEach(function (param: any) {
            const value = Array.isArray(param.data) ? param.data[1] : param.data;
            const name: string = param.seriesName;

            output += `<tr>
              <td>${param.marker}</td>
              <td>${name === "Tiempos" ? "Tiempo" : name}</td>
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
  });

  onMount(() => {
    if (!timeChart && timeSerie) {
      timeChart = echarts.init(timeSerie, "dark", { renderer: "canvas" });
      timeChart.resize();
    }

    Promise.all([getCategories(), getUserProfile(page.params.username), getFormats()]).then(res => {
      categories = res[0].results;
      profile = res[1];
      formats = res[2];

      if (!profile) {
        goto("/people", { replaceState: true });
        return;
      }

      updateResults(profile);
      updateCharts();
    });
  });

  onDestroy(() => {
    stepPercentChart?.dispose();
  });
</script>

<svelte:window on:resize={handleResize} />

<LoadingLayout
  class="max-w-6xl"
  loading={false}
  error={false}
  altError={false}
  reloadFunction={() => {}}
>
  {#snippet content()}
    <section class="grid md:flex gap-4 w-full">
      <aside class="w-full md:max-w-[16rem] h-fit">
        <!-- Profile -->
        <section id="profile">
          <Avatar size="xl" user={profile?.user || null} class="mx-auto" />
          <h1 class="font-bold text-lg mx-auto">
            <UserField
              fullName
              class="w-fit! text-center font-bold"
              user={profile?.user || { username: "", name: "", role: "user" }}
            />
          </h1>

          <span class="text-sm flex items-center gap-1 text-yellow-200">
            <MapPinIcon {size} />
            {profile?.user.province}
          </span>
          <span class="text-sm flex items-center gap-1">
            <a
              href={`/people/${profile?.user.username || "#"}`}
              class="flex items-center gap-1 truncate text-sm font-medium text-pink-400"
            >
              <FingerprintIcon {size} />
              CCA-ID: {profile?.user.username}
            </a>
          </span>
          <span class="text-sm flex items-center gap-1">
            <SigmaIcon {size} />
            SoR: {profile?.sor}
          </span>
          <span class="text-sm flex items-center gap-1">
            {#if profile?.user.sex === "F"}
              <VenusIcon {size} />
            {:else}
              <MarsIcon {size} />
            {/if}
            Sexo: {profile?.user ? (profile?.user.sex === "F" ? "Femenino" : "Masculino") : ""}
          </span>
          <span class="text-sm flex items-center gap-1">
            <ClockIcon {size} />
            Edad: {profile?.user.age}
          </span>

          {#if minRole($userStore, "delegate")}
            <span class="text-sm flex items-center gap-1">
              <HandCoinsIcon {size} />
              Crédito: {profile?.user.credit} CUP
            </span>
            <span class="text-sm flex items-center gap-1">
              {#if profile?.user.isEmailVerified || true}
                <BadgeCheckIcon {size} class="text-green-300" />
              {/if}

              {profile?.user.email}
            </span>
          {/if}
        </section>

        <!-- ELO -->
        <section id="profile-elo">
          <h2 class="text-center mb-4 text-xl">ELO: {ELO}</h2>

          <div class="grid w-full overflow-hidden h-[15rem]" bind:this={stepPercentSerie}></div>
        </section>
      </aside>

      <aside>
        <!-- Podium -->
        <section>
          <h2 class="text-center mb-4 text-2xl">Podios</h2>

          <ul class="podium-list">
            <li class="first">
              <h3 class="text-center flex items-center justify-center gap-2">
                <Award variant="trophy" type="gold" size={awardSize} />
              </h3>
              <span class="!text-lg">{podium[0]}</span>
            </li>
            <li class="second">
              <h3 class="text-center flex items-center justify-center gap-2">
                <Award variant="trophy" type="silver" size={awardSize * 0.9} />
              </h3>
              <span class="!text-lg">{podium[1]}</span>
            </li>
            <li class="third">
              <h3 class="text-center flex items-center justify-center gap-2">
                <Award variant="trophy" type="bronze" size={awardSize * 0.8} />
              </h3>
              <span class="!text-lg">{podium[2]}</span>
            </li>
          </ul>
        </section>

        <!-- Records personales -->
        {#if userRanks.length}
          <section>
            <h2 class="text-center text-2xl">Récords personales</h2>

            <div
              class="overflow-x-auto max-h-[30rem] w-full rounded-lg border border-base-content/10"
            >
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>NR</th>
                    <th class="text-green-400">Single</th>
                    <th class="text-purple-400">Media</th>
                    <th>NR</th>
                  </tr>
                </thead>

                <tbody>
                  {#each userRanks as rank, p}
                    <tr>
                      <td>
                        <div class="flex items-center">
                          <WcaCategory icon={rank.category.scrambler} size="1.5rem" />
                          {rank.category?.name}
                        </div>
                      </td>
                      <td class={rank.single.rank === 1 ? " text-red-500!" : ""}>
                        {rank.single.rank}
                      </td>
                      <td class={"text-green-400!"}>
                        <a
                          href={contestNameToLink(rank.single.contest, {
                            category: rank.category.name,
                            time: rank.single.time,
                            username: profile?.user.username,
                          })}
                          class="hover:text-primary-300"
                        >
                          {timer(rank.single.time || Infinity, true, true)}
                        </a>
                      </td>

                      <!-- Average -->
                      <td class={"text-purple-400!"}>
                        {#if rank.average.rank}
                          <a
                            href={contestNameToLink(rank.average.contest, {
                              category: rank.category.name,
                              time: rank.average.time,
                              username: profile?.user.username,
                              type: "avg",
                            })}
                            class="hover:text-primary-300"
                          >
                            {timer(rank.average.time || Infinity, true, true)}
                          </a>
                        {:else}
                          -
                        {/if}
                      </td>
                      <td class={rank.average.rank === 1 ? " text-red-500!" : ""}>
                        {#if rank.average.rank}
                          {rank.average.rank}
                        {:else}
                          -
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </section>
        {/if}

        <!-- Records locales y nacionales -->
        {#if getRecords(userRecords).filter(rc => rc.results.length).length}
          <section>
            <h2 class="text-center mb-4 text-2xl">Récords locales y nacionales</h2>

            <div class="join mb-4 border border-primary rounded-lg">
              {#each getRecords(userRecords).filter(rc => rc.results.length) as ur, p}
                <div class="tooltip" data-tip={ur.name}>
                  <button
                    onclick={() => {
                      recordIndex = p;
                      userRecord = ur;
                    }}
                    class={twMerge(
                      "btn join-item",
                      p === recordIndex ? "btn-primary" : "btn-neutral"
                    )}
                  >
                    {ur.type} ({ur.results.length})
                  </button>
                </div>
              {/each}
            </div>

            {#if userRecord}
              <div
                class="overflow-x-auto w-full max-h-[30rem] rounded-lg border border-base-content/10"
              >
                <table class="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Record</th>
                      <th>Tiempo</th>
                      <th>Competencia</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {#each userRecord.results as res, p}
                      <tr>
                        <td>
                          {p + 1}
                        </td>
                        <td>
                          <div class="flex items-center">
                            <WcaCategory icon={res.category?.scrambler} size="1.5rem" />
                            {res.category?.name} (<span
                              class={res.type === "single"
                                ? " text-green-400!"
                                : " text-purple-400!"}
                              >{res.type === "single" ? "Single" : "Media"}</span
                            >)
                          </div>
                        </td>
                        <td
                          class={res.type === "single" ? " text-green-400!" : " text-purple-400!"}
                        >
                          <a
                            href={contestNameToLink(res.contest.name, {
                              category: res.category?.name,
                              time: res.time,
                              username: profile?.user.username,
                              type: res.type === "single" ? "single" : "avg",
                            })}
                            class="hover:text-primary-300"
                          >
                            {timer(res.time || Infinity, true, true)}
                          </a>
                        </td>
                        <td>
                          <a
                            href={contestNameToLink(res.contest.name)}
                            class="hover:text-primary-300"
                          >
                            {res.contest?.name}
                          </a>
                        </td>
                        <td>
                          {moment(res.contest?.date).format("DD/MM/YYYY")}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </section>
        {/if}

        <!-- Results -->
        <section>
          <h2 class="text-center mb-4 text-2xl">Resultados ({selectedCategory.name})</h2>

          <ul class="w-full flex flex-wrap gap-2 justify-center mb-4">
            {#each categories.filter(ct => ct.name in groupedData) as cat}
              <button onclick={() => (selectedCategory = cat)}>
                <WcaCategory
                  class={"cursor-pointer " +
                    (selectedCategory.name === cat.name ? "text-green-300" : "")}
                  icon={cat.scrambler}
                />
              </button>
            {/each}
          </ul>

          {#if selectedCategory.name === "" || !profile}
            No hay resultados que mostrar
          {:else if selectedCategory.name in groupedData}
            {@const categoryData = groupedData[selectedCategory.name]}

            <div class="overflow-x-auto w-full rounded-lg border border-base-content/10">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Competencia</th>
                    <th>Ronda</th>
                    <th>Lugar</th>
                    <th>Single</th>
                    <th>Media</th>
                    <th colspan={5}>Resultados</th>
                  </tr>
                </thead>

                <tbody>
                  {#each profile.contests.filter(cnt => cnt.name in categoryData) as cnt, p}
                    {@const contestData = categoryData[cnt.name]}

                    {#each contestData as result, rp}
                      {@const format = formats.find(fm => fm.name === result.format) || formats[0]}

                      <tr>
                        {#if rp === 0}
                          <td rowspan={contestData.length}>
                            <span class="flex justify-center">{p + 1}</span>
                          </td>
                          <td rowspan={contestData.length}>
                            <span class="flex justify-center">
                              <a href={contestNameToLink(cnt.name)} class="hover:text-primary-300"
                                >{cnt.name}</a
                              >
                            </span>
                          </td>
                        {/if}

                        <td>
                          <span class="flex justify-center">{result.round}</span>
                        </td>
                        <td>
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
                        </td>
                        <td>
                          <a
                            href={contestNameToLink(cnt.name, {
                              category: selectedCategory.name,
                              time: Math.min(...result.times.map(t => t || Infinity)) || Infinity,
                              username: profile?.user.username,
                            })}
                            class="hover:text-primary-300"
                          >
                            <span class="flex justify-center text-green-400">
                              {timer(
                                Math.min(...result.times.map(t => t || Infinity)) || Infinity,
                                true
                              )}
                            </span>
                          </a>
                        </td>
                        <td>
                          <a
                            href={contestNameToLink(cnt.name, {
                              category: selectedCategory.name,
                              time: result.average || Infinity,
                              username: profile?.user.username,
                              type: "avg",
                            })}
                            class="hover:text-primary-300"
                          >
                            <span class="flex justify-center text-purple-400">
                              {timer(result.average || Infinity, true)}
                            </span>
                          </a>
                        </td>

                        {#each result.times.slice(0, format.amount) as t, p1}
                          <td>
                            <a
                              href={contestNameToLink(cnt.name, {
                                category: selectedCategory.name,
                                time: t || Infinity,
                                username: profile?.user.username,
                              })}
                              class="hover:text-primary-300"
                            >
                              <span
                                class="flex justify-center"
                                class:best={isPos(result.times, p1, 0)}
                                class:worst={isPos(result.times, p1, format.amount - 1)}
                              >
                                {timer(t || Infinity, true)}
                              </span>
                            </a>
                          </td>
                        {/each}

                        {#each [1, 2, 3, 4, 5].slice(0, 5 - format.amount) as _}
                          <td data-number={_}></td>
                        {/each}
                      </tr>
                    {/each}
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </section>

        <!-- Performance -->
        <section>
          <h2 class="text-center mb-4 text-2xl">
            Desempeño ({selectedCategory.name})
          </h2>

          <ul class="w-full flex flex-wrap gap-2 justify-center mb-4">
            {#each categories.filter(ct => ct.name in groupedData) as cat}
              <button onclick={() => (selectedCategory = cat)}>
                <WcaCategory
                  class={"cursor-pointer " +
                    (selectedCategory.name === cat.name ? "text-green-300" : "")}
                  icon={cat.scrambler}
                />
              </button>
            {/each}
          </ul>

          <div class="grid place-items-center h-[20rem] w-full" bind:this={timeSerie}></div>
        </section>
      </aside>
    </section>
  {/snippet}
</LoadingLayout>

<style lang="postcss">
  @reference "tailwindcss";

  aside {
    @apply grid gap-4 w-full;
  }

  aside > section {
    @apply border border-gray-400 py-4 px-2 rounded-md shadow-md 
      bg-[#fff1] grid place-items-center;
  }

  #profile {
    @apply grid place-items-start gap-2 h-fit;
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
