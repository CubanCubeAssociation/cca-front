<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { STATUS_ORDER, type CONTEST, type CONTEST_STATUS, type ROUND } from "@interfaces";
  import { getContest } from "@helpers/API";
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
  import {
    Card,
    Heading,
    Indicator,
    Span,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tooltip,
  } from "flowbite-svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { minRole } from "@helpers/auth";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { userStore } from "@stores/user";
  import ResultView from "@components/ResultView.svelte";
  import { page } from "$app/stores";

  let name: string = "";

  const size = "1.4rem";
  const spanClass = "flex items-center gap-1 !text-green-200";
  const TD_CLASS = "px-2 py-2 whitespace-nowrap font-medium ";

  let show404 = false;
  let contest: CONTEST;
  // let section: number = 0;
  let roundGroup: ROUND[][][] = [];

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
    let name = $page.params.name;

    getContest(name)
      .then(res => {
        contest = res;
        contest.date = moment.utc(contest.date).format("YYYY-MM-DDThh:mm");
        contest.inscriptionStart = moment(contest.inscriptionStart).format("YYYY-MM-DD");
        contest.inscriptionEnd = moment(contest.inscriptionEnd).format("YYYY-MM-DD");

        // console.log("CONTEST: ", res);

        let roundInfo = getRoundsInfo(contest.rounds);

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

{#if show404}
  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h4" class="text-center">No se encontró la competencia: "{name}"</Heading>
  </Card>
{:else if contest}
  <Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h1" class="text-center text-4xl flex justify-center gap-1">
      {contest.name}

      {#if minRole($userStore, "delegate")}
        <a href={"/admin/contest/" + contest.name}><PencilIcon size="1.2rem" /></a>
      {/if}
    </Heading>

    <!-- <ButtonGroup>
      <Button color="blue" class="rounded-tl-md rounded-bl-md" on:click={() => showSection(0)}>
        Información
      </Button>

      {#if contest.status === "inscription"}
        <Button color="yellow" on:click={() => showSection(1)}>Registrarse</Button>
      {/if}

      <Button color="green" class="rounded-tr-md rounded-br-md" on:click={() => showSection(2)}>
        Competidores
      </Button>
    </ButtonGroup> -->

    <ul class="grid gap-4 info-list">
      <!-- Lugar -->
      <li>
        <Span class={spanClass}>
          <HomeIcon {size} /> Lugar:
        </Span>
        <Span>{contest.place}</Span>
      </li>

      <!-- Fecha -->
      <li>
        <Span class={spanClass}>
          <DateIcon {size} />Fecha:
        </Span>
        <Span>{moment(contest.date).format("DD/MM/YYYY")}</Span>
      </li>

      <!-- Hora -->
      <li>
        <Span class={spanClass}>
          <ClockIcon {size} />Hora:
        </Span>
        <Span>{moment(contest.date).format("hh:mm a")}</Span>
      </li>

      {#if before("running")}
        <!-- Inscripcion (inicio) -->
        <li>
          <Span class={spanClass}>
            <DateIcon {size} />Inicio de inscripción:
          </Span>
          <Span>{moment(contest.inscriptionStart).format("DD/MM/YYYY")}</Span>
        </li>

        <!-- Inscripcion (fin) -->
        <li>
          <Span class={spanClass}>
            <DateIcon {size} />Fin de inscripción:
          </Span>
          <Span>{moment(contest.inscriptionEnd).format("DD/MM/YYYY")}</Span>
        </li>

        <!-- Costo -->
        <li>
          <Span class={spanClass}>
            <CurrencyIcon {size} />Costo de inscripción:
          </Span>
          <Span>
            {contest.inscriptionCost === 0
              ? "Gratis"
              : new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "CUP",
                }).format(contest.inscriptionCost)}
          </Span>
        </li>
      {/if}

      <li>
        <Span class={spanClass}>
          <PuzzleIcon {size} />Categorías:
        </Span>
        <Span class="flex flex-wrap gap-2 max-w-[25rem]">
          {#each contest.categories as ct}
            <WcaCategory icon={ct.category.scrambler} />
            <Tooltip>{ct.category.name}</Tooltip>
          {/each}
        </Span>
      </li>

      <!-- Estado -->
      <li>
        <Span class={spanClass}>
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
          <Span class={spanClass}>
            <EyeIcon {size} />Visible:
          </Span>
          <Span>{contest.visible ? "Si" : "No"}</Span>
        </li>
      {/if}
    </ul>
  </Card>

  <Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h2" class="text-center text-4xl flex justify-center gap-1">Competidores</Heading>

    <Table hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell padding="px-2 py-3">#</TableHeadCell>
        <TableHeadCell padding="px-2 py-3">Nombre</TableHeadCell>
        <TableHeadCell padding="px-2 py-3">Categorías</TableHeadCell>
      </TableHead>

      <TableBody>
        {#each contest.contestants as c, p (c.user.username)}
          <TableBodyRow>
            <TableBodyCell tdClass={TD_CLASS}>{p + 1}</TableBodyCell>
            <TableBodyCell tdClass={TD_CLASS}>{c.user.name}</TableBodyCell>
            <TableBodyCell tdClass={TD_CLASS}>
              <div class="w-full flex flex-wrap gap-2">
                {#each c.categories as ct}
                  <WcaCategory icon={ct.scrambler} size="1.5rem" />
                  <Tooltip>{ct.name}</Tooltip>
                {/each}
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </Card>

  {#if contest.status !== "pending" && contest.status !== "inscription"}
    <Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
      <Heading tag="h2" class="text-center text-4xl flex justify-center gap-1">Resultados</Heading>

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

      <ResultView {roundGroup} />
    </Card>
  {/if}
{:else}
  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Spinner size="10" />
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
    @apply flex gap-2 items-center;
  }
</style>
