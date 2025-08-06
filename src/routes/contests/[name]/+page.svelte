<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import {
    STATUS_ORDER,
    type CONTEST,
    type CONTEST_STATUS,
    type FORMAT,
    type ROUND,
  } from "@interfaces";
  import { getContest, getFormats } from "@helpers/API";
  import { getRoundsInfo } from "@helpers/statistics";

  // Icons
  import HomeIcon from "@icons/Home.svelte";
  import DateIcon from "@icons/Calendar.svelte";
  import ClockIcon from "@icons/Clock.svelte";
  import CurrencyIcon from "@icons/CurrencyUsd.svelte";
  import PuzzleIcon from "@icons/Puzzle.svelte";
  import StateIcon from "@icons/StateMachine.svelte";
  import EyeIcon from "@icons/Eye.svelte";
  import PencilIcon from "@icons/Pencil.svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { minRole } from "@helpers/auth";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { userStore } from "@stores/user";
  import ResultView from "@components/ResultView.svelte";
  import { page } from "$app/state";
  import UserField from "@components/UserField.svelte";
  import { contestNameToLink, contestParamName } from "@helpers/routing";
  import Indicator from "@components/Indicator.svelte";

  let name: string = "";

  const size = "1.4rem";
  const spanClass = "flex items-center gap-1 text-green-200!";
  const TD_CLASS = "px-2 py-2 whitespace-nowrap font-medium ";

  let show404 = false;
  let contest: CONTEST;
  // let section: number = 0;
  let roundGroup: ROUND[][][] = [];
  let formats: FORMAT[] = [];

  function before(state: CONTEST_STATUS) {
    let idx = STATUS_ORDER.indexOf(contest.status);
    let idx1 = STATUS_ORDER.indexOf(state);

    return idx < idx1;
  }

  // function showSection(n: number) {
  //   section = n;
  // }

  function checkProperty(p: string) {
    return Object.prototype.hasOwnProperty.call(contest, p);
  }

  onMount(() => {
    let name = contestParamName(page.params.name);

    Promise.all([getFormats(), getContest(name)])
      .then(res => {
        formats = res[0];
        contest = res[1];
        contest.date = moment.utc(contest.date).format("YYYY-MM-DDThh:mm");
        contest.inscriptionStart = moment(contest.inscriptionStart).format("YYYY-MM-DD");
        contest.inscriptionEnd = moment(contest.inscriptionEnd).format("YYYY-MM-DD");

        // console.log("CONTEST: ", res);

        let roundInfo = getRoundsInfo(contest.rounds, contest.categories, formats);

        contest.rounds = roundInfo.rounds;
        roundGroup = roundInfo.roundGroup;
      })
      .catch(e => {
        if (e.name === "HTTPError" && e.response.status === 404) {
          show404 = true;
        }
        console.dir(e);
      });
  });
</script>

<svelte:head>
  <title>Competencias - {contest?.name}</title>
</svelte:head>

{#if show404}
  <div class="card mt-4 max-w-3xl">
    <h4 class="text-center">No se encontró la competencia: "{name}"</h4>
  </div>
{:else if contest}
  <div class="card mt-4 max-w-4xl mx-auto mb-8">
    <h1 class="text-center text-4xl flex justify-center gap-1">
      {contest.name}

      {#if minRole($userStore, "delegate")}
        <a href={contestNameToLink(contest.name, {}, true)}><PencilIcon size="1.2rem" /></a>
      {/if}
    </h1>

    <ul class="grid gap-4 info-list">
      <!-- Lugar -->
      <li>
        <span class={spanClass}>
          <HomeIcon {size} /> Lugar:
        </span>
        <span>{contest.place}</span>
      </li>

      <!-- Fecha -->
      <li>
        <span class={spanClass}>
          <DateIcon {size} />Fecha:
        </span>
        <span>{moment(contest.date).format("DD/MM/YYYY")}</span>
      </li>

      <!-- Hora -->
      <li>
        <span class={spanClass}>
          <ClockIcon {size} />Hora:
        </span>
        <span>{moment(contest.date).format("hh:mm a")}</span>
      </li>

      {#if before("running")}
        <!-- Inscripcion (inicio) -->
        <li>
          <span class={spanClass}>
            <DateIcon {size} />Inicio de inscripción:
          </span>
          <span>{moment(contest.inscriptionStart).format("DD/MM/YYYY")}</span>
        </li>

        <!-- Inscripcion (fin) -->
        <li>
          <span class={spanClass}>
            <DateIcon {size} />Fin de inscripción:
          </span>
          <span>{moment(contest.inscriptionEnd).format("DD/MM/YYYY")}</span>
        </li>

        <!-- Costo -->
        <li>
          <span class={spanClass}>
            <CurrencyIcon {size} />Costo de inscripción:
          </span>
          <span>
            {contest.inscriptionCost === 0
              ? "Gratis"
              : new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "CUP",
                }).format(contest.inscriptionCost)}
          </span>
        </li>
      {/if}

      <li>
        <span class={spanClass}>
          <PuzzleIcon {size} />Categorías:
        </span>
        <span class="flex flex-wrap gap-2 max-w-[25rem]">
          {#each contest.categories as ct}
            <div class="tooltip" data-tip={ct.category.name}>
              <WcaCategory icon={ct.category.scrambler} size="1.5rem" />
            </div>
          {/each}
        </span>
      </li>

      <!-- Estado -->
      <li>
        <span class={spanClass}>
          <StateIcon {size} />Estado:
        </span>
        <span class="p-1 flex gap-2 items-center">
          <Indicator color={getIndicatorColor(contest.status)} />
          {getStatus(contest.status)}
        </span>
      </li>

      <!-- Visible -->
      {#if checkProperty("visible")}
        <li>
          <span class={spanClass}>
            <EyeIcon {size} />Visible:
          </span>
          <span>{contest.visible ? "Si" : "No"}</span>
        </li>
      {/if}
    </ul>
  </div>

  {#if contest.contestants.length > 0}
    <div class="card max-w-4xl mx-auto mb-8">
      <h2 class="text-center text-4xl flex justify-center gap-1">Competidores</h2>

      <div class="overflow-x-auto w-full">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Categorías</th>
            </tr>
          </thead>

          <tbody>
            {#each contest.contestants as c, p (c.user.username)}
              <tr>
                <td>{p + 1}</td>
                <td><UserField user={c.user} link /></td>
                <td>
                  <div class="w-full flex flex-wrap gap-2">
                    {#each c.categories as ct}
                      <div class="tooltip" data-tip={ct.name}>
                        <WcaCategory icon={ct.scrambler} size="1.5rem" />
                      </div>
                    {/each}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  {#if contest.status !== "pending" && contest.status !== "inscription"}
    <div class="card mt-4 max-w-6xl mx-auto mb-8">
      <h2 class="text-center text-4xl flex justify-center gap-1">Resultados</h2>

      {#if contest.status === "running" || contest.status === "results"}
        <p class="max-w-2xl text-sm">
          {#if contest.status === "running"}
            Se están añadiendo los resultados de la competencia. A medida que se vayan añadiendo,
            aparecerán debajo (no se actualiza en tiempo real, debes recargar la página para obtener
            las últimas actualizaciones).
          {:else if contest.status === "results"}
            Se están revisando detalladamente todos los resultados de la competencia antes de
            publicarlos de manera oficial.
          {/if}
        </p>
      {/if}

      <ResultView {roundGroup} {formats} categories={contest.categories} />
    </div>
  {/if}
{:else}
  <div class="card mt-4 max-w-3xl mx-auto mb-8">
    <span class="loading loading-spinner loading-lg mx-auto"></span>
  </div>
{/if}

<style lang="postcss">
  .info-list {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 1rem;
    margin: 0 auto;
    max-width: 100%;
  }

  .info-list li {
    @apply flex items-center;
  }
</style>
