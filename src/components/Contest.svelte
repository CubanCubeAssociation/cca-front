<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  // @ts-ignore
  import { STATUS_ORDER, type CONTEST, type CONTEST_STATUS, type ROUND } from "@interfaces";
  import { getContest } from "@helpers/API";
  import { sTimer, timer } from "@helpers/timer";
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
  import { Button, ButtonGroup, Card, Heading, Indicator, Span, Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Tooltip } from "flowbite-svelte";
  import WcaCategory from "./wca/WCACategory.svelte";
  import { Link } from "svelte-routing";
  import { minRole } from "@helpers/auth";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { userStore } from "@stores/user";
    import ResultView from "./ResultView.svelte";

  export let name: string;

  const size = "1.4rem";
  let show404 = false;
  let contest: CONTEST;
  let section: number = 0;
  let roundGroup: ROUND[][] = [];

  function before(state: CONTEST_STATUS) {
    let idx = STATUS_ORDER.indexOf(contest.status);
    let idx1 = STATUS_ORDER.indexOf(state);

    return idx < idx1;
  }

  function showSection(n: number) {
    section = n;
  }

  function checkProperty(p: string) {
    return Object.prototype.hasOwnProperty.call(contest, p);
  }

  onMount(() => {
    getContest(name)
      .then((res) => {
        console.log("CONTEST: ", res);
        contest = res;
        contest.date = moment(contest.date).format("YYYY-MM-DDThh:mm");
        contest.inscriptionStart = moment(contest.inscriptionStart).format(
          "YYYY-MM-DD",
        );
        contest.inscriptionEnd = moment(contest.inscriptionEnd).format(
          "YYYY-MM-DD",
        );

        let roundInfo = getRoundsInfo(contest.rounds);

        contest.rounds = roundInfo.rounds;
        roundGroup = roundInfo.roundGroup;
      })
      .catch((e) => {
        if (e.name === "HTTPError" && e.response.status === 404) {
          show404 = true;
        }
        console.dir(e);
      });
  });
</script>

{#if show404}
  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h4" class="text-center">No se encontró la competencia: "{name}"</Heading>
  </Card>
{:else if contest}
  <Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h2" class="text-center flex justify-center gap-1">
      {contest.name}

      {#if minRole($userStore, "delegate")}
        <Link to={"/admin/contest/" + name}><PencilIcon size="1.2rem" /></Link>
      {/if}
    </Heading>

    <ButtonGroup>
      <Button
        color="blue"
        class="rounded-tl-md rounded-bl-md"
        on:click={() => showSection(0)}>Información</Button
      >

      {#if contest.status === "inscription"}
        <Button color="yellow" on:click={() => showSection(1)}
          >Registrarse</Button
        >
      {/if}

      <Button
        color="green"
        class="rounded-tr-md rounded-br-md"
        on:click={() => showSection(2)}>Competidores</Button
      >
    </ButtonGroup>

    <ul class="grid gap-4 info-list">
      <!-- Lugar -->
      <li>
        <Span class="flex items-center gap-1">
          <HomeIcon {size} /> Lugar:
        </Span>
        <Span class="p-1 border-b-2 border-b-green-500">{contest.place}</Span>
      </li>

      <!-- Fecha -->
      <li>
        <Span class="flex items-center gap-1">
          <DateIcon {size} />Fecha:
        </Span>
        <Span class="p-1 border-b-2 border-b-green-500"
          >{moment(contest.date).format("DD/MM/YYYY")}</Span
        >
      </li>

      <!-- Hora -->
      <li>
        <Span class="flex items-center gap-1">
          <ClockIcon {size} />Hora:
        </Span>
        <Span class="p-1 border-b-2 border-b-green-500"
          >{moment(contest.date).format("hh:mm a")}</Span
        >
      </li>

      {#if before("running")}
        <!-- Inscripcion (inicio) -->
        <li>
          <Span class="flex items-center gap-1">
            <DateIcon {size} />Inicio de inscripción:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500"
            >{moment(contest.inscriptionStart).format("DD/MM/YYYY")}</Span
          >
        </li>

        <!-- Inscripcion (fin) -->
        <li>
          <Span class="flex items-center gap-1">
            <DateIcon {size} />Fin de inscripción:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500"
            >{moment(contest.inscriptionEnd).format("DD/MM/YYYY")}</Span
          >
        </li>

        <!-- Costo -->
        <li>
          <Span class="flex items-center gap-1">
            <CurrencyIcon {size} />Costo de inscripción:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500"
            >{contest.inscriptionCost === 0
              ? "Gratis"
              : new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "CUP",
                }).format(contest.inscriptionCost)}</Span
          >
        </li>
      {/if}

      <li>
        <Span class="flex items-center gap-1">
          <PuzzleIcon {size} />Categorías:
        </Span>
        <Span
          class="p-1 border-b-2 border-b-green-500 flex flex-wrap gap-2 max-w-[25rem]"
        >
          {#each contest.categories as ct}
            <WcaCategory icon={ct.category.scrambler} />
            <Tooltip>{ct.category.name}</Tooltip>
          {/each}
        </Span>
      </li>

      <!-- Estado -->
      <li>
        <Span class="flex items-center gap-1">
          <StateIcon {size} />Estado:
        </Span>
        <Span class="p-1 flex gap-2 items-center">
          <Indicator color={getIndicatorColor(contest.status)} />
          {getStatus(contest.status)}
        </Span>
      </li>

      <!-- Visible -->
      {#if checkProperty("visible")}
        <li>
          <Span class="flex items-center gap-1">
            <EyeIcon {size} />Visible:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500">
            {contest.visible ? "Si" : "No"}
          </Span>
        </li>
      {/if}
    </ul>
  </Card>

  <Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h2" class="text-center">Resultados</Heading>

    <ResultView { roundGroup }/>
  </Card>
{:else}
  <Card
    class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4"
  >
    <Spinner size="20" />
  </Card>
{/if}

<style lang="postcss">
  .info-list {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 1rem;
    margin: 0 auto;
    max-width: 100%;
  }

  .info-list li {
    @apply flex gap-2;
  }
</style>
