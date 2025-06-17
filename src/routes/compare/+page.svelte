<script lang="ts">
  import SearchUser from "@components/SearchUser.svelte";
  import UserField from "@components/UserField.svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { getCategories, getFormats, getUser, getUserProfile } from "@helpers/API";
  import { metricMean, metricStdDev, metricTrendLSV } from "@helpers/statistics";
  import { timer } from "@helpers/timer";
  import type { CATEGORY, FORMAT, USER, USER_PROFILE } from "@interfaces";
  import { Button, Card } from "flowbite-svelte";
  import { ArrowDownIcon, ArrowUpIcon, TrendingUpDownIcon } from "lucide-svelte";
  import { onMount } from "svelte";

  interface CATEGORY_METRICS {
    results: {
      format: string;
      times: number[];
      contest: string;
      round: number;
    }[];
    average: number;
    dev: number;
    trend: number;
  }

  let userA: USER | null = $state(null);
  let userB: USER | null = $state(null);

  let timeSerie: HTMLDivElement | null = $state(null);
  let timeChart: echarts.ECharts | null = $state(null);
  let userProfileA: USER_PROFILE | null = $state(null);
  let userProfileB: USER_PROFILE | null = $state(null);
  let categories: CATEGORY[] = $state([]);
  let formats: FORMAT[] = $state([]);
  let error = $state(false);
  let catDataA: Record<string, CATEGORY_METRICS> = $state({});
  let catDataB: Record<string, CATEGORY_METRICS> = $state({});

  function getPlaces(p: USER_PROFILE) {
    const { records, results } = p;

    let summary = results.reduce(
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

    summary.unshift(["PR", records.pr.results.length, records.pr.points]);
    summary.unshift(["NR", records.nr.results.length, records.nr.points]);
    summary.unshift(["WR", records.wr.results.length, records.wr.points]);

    return summary;
  }

  function rnd() {
    return Math.round(Math.random() * 123);
  }

  function updateStatistics(p: USER_PROFILE, variant: "A" | "B") {
    const { results, contests } = p;
    contests.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let catData = variant === "A" ? catDataA : catDataB;
    let contestPos: Record<string, number> = contests.reduce(
      (acc, e, p) => {
        acc[e.name] = p;
        return acc;
      },
      {} as Record<string, number>
    );

    Object.entries(([k]: any) => delete catData[k]);

    results.forEach(res => {
      res.contests.forEach(cnt => {
        if (!catData[cnt.category.id]) {
          catData[cnt.category.id] = {
            results: [],
            average: 0,
            dev: 0,
            trend: 0,
          };
        }

        catData[cnt.category.id].results.push({
          format: cnt.format,
          times: cnt.times,
          contest: cnt.contestName,
          round: cnt.round,
        });
      });
    });

    Object.entries(catData).forEach(([_, metrics]) => {
      metrics.results.sort((a, b) => {
        if (contestPos[a.contest] != contestPos[b.contest]) {
          return contestPos[a.contest] - contestPos[b.contest];
        }
        return a.round - b.round;
      });

      metrics.average = metricMean(metrics.results, formats);
      metrics.dev = metricStdDev(metrics.results, formats, metrics.average);
      metrics.trend = Math.round(metricTrendLSV(metrics.results, formats).m);
    });
  }

  function getBaseData() {
    error = false;

    Promise.all([getCategories(), getFormats()])
      .then(([cats, fm]) => {
        categories = cats.results;
        formats = fm;
      })
      .catch(() => {
        error = true;
      });
  }

  function updateUserData(u: any, variant: "A" | "B") {
    variant === "A" ? (userA = u) : (userB = u);
    getUserProfile(u.username).then(p => {
      variant === "A" ? (userProfileA = p) : (userProfileB = p);
      updateStatistics(p, variant);
    });
  }

  // function updateCharts(variant: "A" | "B") {
  //   if (!userProfileA || !userProfileB) return;

  //   const solves: (number | null)[] = profile.contests
  //     .reduce(
  //       (acc, e) => [
  //         ...(categoryData[e.name] || []).map(e1 => {
  //           let fm = formats.find(fm => fm.name === e1.format)?.amount || 5;
  //           averageData.push([averageX, e1.average || 0]);
  //           averageX += fm;
  //           return e1.times.slice(0, fm);
  //         }),
  //         ...acc,
  //       ],
  //       [] as any[]
  //     )
  //     .flat(3);

  //   let options: echarts.EChartsOption = {
  //     xAxis: {
  //       type: "category",
  //       data: solves.map((_, p) => p + 1),
  //     },
  //     yAxis: {
  //       type: "value",
  //       min: "dataMin",
  //       max: "dataMax",
  //       name: "Tiempo",
  //       axisLabel: {
  //         formatter: value => timer(value, false, true),
  //       },
  //     },
  //     grid: {
  //       right: "1%",
  //     },
  //     legend: {
  //       data: ["Tiempos", "Mejor", "Media", "Tendencia"],
  //       top: "6%",
  //     },
  //     dataZoom: [
  //       {
  //         type: "slider",
  //         xAxisIndex: [0],
  //       },
  //       {
  //         type: "inside",
  //         minSpan: 0,
  //         maxSpan: 100,
  //       },
  //     ],
  //     series: [
  //       {
  //         data: solves.map(time => time),
  //         type: "line",
  //         connectNulls: false,
  //         name: "Tiempos",
  //         smooth: solves.length < 2000,
  //       },
  //       bestSerie,
  //       {
  //         data: averageData,
  //         type: "line",
  //         connectNulls: false,
  //         name: "Media",
  //         smooth: solves.length < 2000,
  //       },
  //       ...trendSerie,
  //     ],
  //     backgroundColor: "transparent",
  //     tooltip: {
  //       ...tooltipStyle,
  //       axisPointer: {
  //         type: "cross",
  //         label: {
  //           color: tooltipStyle.textStyle?.color,
  //           backgroundColor: tooltipStyle.backgroundColor,
  //           borderColor: "#ddff",
  //           borderWidth: 2,
  //           formatter({ axisDimension, value }: any) {
  //             return axisDimension === "x"
  //               ? +value.toString() + ""
  //               : timer(+value.toString(), true, true);
  //           },
  //         },
  //         animation: false,
  //         animationDurationUpdate: 0,
  //       },
  //       formatter: function (params: any) {
  //         let output = params[0].axisValueLabel + "<br/>";

  //         output += '<table style="width: 100%;">';

  //         params.forEach(function (param: any) {
  //           const value = Array.isArray(param.data) ? param.data[1] : param.data;
  //           const name: string = param.seriesName;

  //           output += `<tr>
  //             <td>${param.marker}</td>
  //             <td>${name === "Tiempos" ? "Tiempo" : name}</td>
  //             <td style="text-align: right; font-weight: bold; padding-left: .5rem;">${timer(
  //               +value || Infinity,
  //               true,
  //               true
  //             )}</td>
  //           </tr>`;
  //         });

  //         return output + "</table>";
  //       },
  //     },
  //     animation: true,
  //     animationDuration: 500,
  //   };

  //   timeChart.setOption(options);

  //   timeChart.off("dataZoom");
  //   timeChart.off("legendselectchanged");
  //   timeChart.on("dataZoom", function (params: any) {
  //     if (!timeChart) return;

  //     let start = Math.round(
  //       ((params.batch ? params.batch[0].start : params.start) * solves.length) / 100
  //     );
  //     let end = Math.round(
  //       ((params.batch ? params.batch[0].start : params.start) * solves.length) / 100
  //     );

  //     timeChart.setOption({
  //       series: (Array.isArray(options.series) ? options.series : [options.series]).map(() => ({
  //         smooth: Math.abs(end - start) <= 800,
  //       })),
  //     });
  //   });

  //   timeChart.on("legendselectchanged", function (ev: any) {
  //     let trendName = "Tendencia";
  //     let hTrend: echarts.LineSeriesOption = trendSerie.filter(
  //       s => s.name === "trend-high"
  //     )[0] as any;

  //     if (!ev.selected[trendName]) {
  //       hTrend.areaStyle!.color = "transparent";
  //     } else {
  //       hTrend.areaStyle!.color = "#fff4";
  //     }

  //     timeChart?.setOption(options);
  //   });

  //   timeChart?.setOption(options);
  //   timeChart?.resize();
  // }

  onMount(() => {
    getBaseData();
    // getUserProfile("2212VEGA01").then(p => {
    //   userProfileA = p;
    //   updateStatistics(p, "A");
    // });
    // getUserProfile("2411RODR01").then(p => {
    //   userProfileB = p;
    //   updateStatistics(p, "B");
    // });
  });
</script>

<Card class="mx-auto mb-8 mt-4 flex w-[calc(100%-2rem)] max-w-6xl flex-col items-center gap-4">
  <h1 class="text-2xl text-base-content flex items-center gap-2">
    <TrendingUpDownIcon class="text-orange-300" /> Comparar Usuarios
  </h1>

  {#if error}
    <span class="text-red-400">Hubo un error al cargar los datos</span>
    <Button class="mt-8 w-min cursor-pointer" onclick={getBaseData}>Recargar</Button>
  {:else}
    <div class="flex flex-wrap justify-center gap-2">
      <SearchUser
        placeholder="Nombre o ID 1"
        class="text-blue-400"
        user={u => updateUserData(u, "A")}
        type="dropdown"
      />

      <SearchUser
        placeholder="Nombre o ID 2"
        class="text-orange-400"
        user={u => updateUserData(u, "B")}
        type="dropdown"
      />
    </div>

    <!-- General -->
    <div class="flex flex-wrap gap-2 justify-evenly items-center w-full">
      {#if userA}
        <UserField user={userA} showAvatar link class="text-blue-400" />
      {/if}
      {#if userA && userB}
        <span class="text-xl text-base-content">VS</span>
      {/if}

      {#if userB}
        <UserField user={userB} showAvatar link class="text-orange-400" />
      {/if}
    </div>

    {#if userProfileA && userProfileB}
      {@const placesA = getPlaces(userProfileA)}
      {@const placesB = getPlaces(userProfileB)}

      <div class="flex flex-wrap gap-4 justify-center items-start">
        <!-- General -->
        <div
          class="general-results overflow-x-auto rounded-box border border-base-content/5 bg-base-100"
        >
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th>
                  {userA ? userA.name.split(" ")[0] : "Usuario 1"}
                </th>
                <th>
                  {userB ? userB.name.split(" ")[0] : "Usuario 2"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SoR</td>
                <td>{rnd()}</td>
                <td>{rnd()}</td>
              </tr>
              <tr>
                <td>ELO</td>
                <td>{placesA.reduce((acc, e) => acc + e[2], 0)}</td>
                <td>{placesB.reduce((acc, e) => acc + e[2], 0)}</td>
              </tr>
              <tr>
                <td>Récords nacionales</td>
                <td>{placesA[1][1]}</td>
                <td>{placesB[1][1]}</td>
              </tr>
              <tr>
                <td>Récords provinciales</td>
                <td>{placesA[2][1]}</td>
                <td>{placesB[2][1]}</td>
              </tr>
              <tr>
                <td>Oro</td>
                <td>{placesA[3][1]}</td>
                <td>{placesB[3][1]}</td>
              </tr>
              <tr>
                <td>Plata</td>
                <td>{placesA[4][1]}</td>
                <td>{placesB[4][1]}</td>
              </tr>
              <tr>
                <td>Bronce</td>
                <td>{placesA[5][1]}</td>
                <td>{placesB[5][1]}</td>
              </tr>
              <tr>
                <td>4to+</td>
                <td>{placesA[6][1]}</td>
                <td>{placesB[6][1]}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Categorías comunes -->
        <div
          class="category-ranking overflow-x-auto max-w-full rounded-box border border-base-content/5 bg-base-100"
        >
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th> Promedio </th>
                <th> Desviación </th>
                <th> Tendencia </th>
                <th class="text-green-500"> #Single </th>
                <th class="text-purple-500"> #Media </th>
              </tr>
            </thead>
            <tbody>
              {#each categories.filter(ct => ct.id in catDataA && ct.id in catDataB) as cat}
                {@const dataA = catDataA[cat.id]}
                {@const dataB = catDataB[cat.id]}

                <tr>
                  <td class="text-base-content">
                    <div class="flex flex-wrap gap-2 items-center">
                      <WcaCategory icon={cat.scrambler} size="1.2rem" />
                      {cat.name}
                    </div>
                  </td>
                  <td>
                    <div class="grid">
                      <span>{timer(dataA.average, true, true)}</span>
                      <span>{timer(dataB.average, true, true)}</span>
                    </div>
                  </td>
                  <td>
                    <div class="grid">
                      <span>{timer(dataA.dev, true, true)}</span>
                      <span>{timer(dataB.dev, true, true)}</span>
                    </div>
                  </td>
                  <td>
                    <div class="grid">
                      <span class="flex items-center gap-1">
                        {#if dataA.trend >= 0}
                          <ArrowUpIcon size=".8rem" />
                        {:else}
                          <ArrowDownIcon size=".8rem" />
                        {/if}
                        {timer(Math.abs(dataA.trend), true, true)}
                      </span>
                      <span class="flex items-center gap-1">
                        {#if dataB.trend >= 0}
                          <ArrowUpIcon size=".8rem" />
                        {:else}
                          <ArrowDownIcon size=".8rem" />
                        {/if}
                        {timer(Math.abs(dataB.trend), true, true)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="grid">
                      <span>
                        {userProfileA.rankSummary.find(
                          rs => rs.category === cat.id && rs.type === "Single"
                        )?.position}
                      </span>
                      <span>
                        {userProfileB.rankSummary.find(
                          rs => rs.category === cat.id && rs.type === "Single"
                        )?.position}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="grid">
                      <span>
                        {userProfileA.rankSummary.find(
                          rs => rs.category === cat.id && rs.type === "Media"
                        )?.position}
                      </span>
                      <span>
                        {userProfileB.rankSummary.find(
                          rs => rs.category === cat.id && rs.type === "Media"
                        )?.position}
                      </span>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Gráficas con el desempeño de los usuarios -->
  <div class="grid place-items-center h-[20rem] w-full" bind:this={timeSerie}></div>
</Card>

<style lang="postcss">
  @reference "../../app.css";

  .general-results td:first-child {
    @apply text-base-content font-bold;
  }

  .general-results tr > :nth-child(2) {
    @apply text-blue-400;
  }

  .general-results tr > :nth-child(3) {
    @apply text-orange-400;
  }

  .category-ranking td .grid > span:first-child {
    @apply text-blue-400;
  }

  .category-ranking td .grid > span:last-child {
    @apply text-orange-400;
  }
</style>
