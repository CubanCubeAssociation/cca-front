<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  // @ts-ignore
  import { STATUS_ORDER, type CONTEST, type CONTEST_STATUS, type SOLVE } from "@interfaces";
  import { getContest } from "@helpers/API";
  import { actualTime, sTimer, timer } from "@helpers/timer";
  import { getAverageS, getStatsCFromContest } from "@helpers/statistics";

  // Icons
  import HomeIcon from '@icons/Home.svelte';
  import DateIcon from '@icons/Calendar.svelte';
  import ClockIcon from '@icons/Clock.svelte';
  import CurrencyIcon from '@icons/CurrencyUsd.svelte';
  import PuzzleIcon from '@icons/Puzzle.svelte';
  import StateIcon from '@icons/StateMachine.svelte';
  import EyeIcon from '@icons/Eye.svelte';
  import PencilIcon from '@icons/Pencil.svelte';
  import RoundView from "./RoundView.svelte";
  import { Button, ButtonGroup, Card, Heading, Indicator, Span, Spinner, Table, TableHead, TableHeadCell, Tooltip } from "flowbite-svelte";
  import WcaCategory from "./wca/WCACategory.svelte";
  import { Link } from "svelte-routing";
  import { minRole } from "@helpers/auth";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { userStore } from "@stores/user";

  export let name: string;

  const size = '1.4rem';
  let show404 = false;
  let contest: CONTEST;
  let section: number = 0;
  let results: any = [];
  let showRound = false;
  let roundData: { 0: string; 1: SOLVE[] } = [ '', [] ];

  
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
    getContest( name ).then(c => {
      console.log("CONTEST: ", c);
      contest = c;

      // contest.categories = [
      //   { id: "", name: '222so', scrambler: '222so' },
      //   { id: "", name: '333', scrambler: '333' },
      //   { id: "", name: '333fm', scrambler: '333fm' },
      //   { id: "", name: '333mbf', scrambler: '333mbf' },
      //   { id: "", name: '333ni', scrambler: '333ni' },
      //   { id: "", name: '333oh', scrambler: '333oh' },
      //   { id: "", name: '444bld', scrambler: '444bld' },
      //   { id: "", name: '444wca', scrambler: '444wca' },
      //   { id: "", name: '555bld', scrambler: '555bld' },
      //   { id: "", name: '555wca', scrambler: '555wca' },
      //   { id: "", name: '666wca', scrambler: '666wca' },
      //   { id: "", name: '777wca', scrambler: '777wca' },
      //   { id: "", name: 'clkwca', scrambler: 'clkwca' },
      //   { id: "", name: 'mgmp', scrambler: 'mgmp' },
      //   { id: "", name: 'pyrso', scrambler: 'pyrso' },
      //   { id: "", name: 'skbso', scrambler: 'skbso' },
      //   { id: "", name: 'sqrs', scrambler: 'sqrs' },
      // ];

      // contest.categories = [{ name: 'asdas', scrambler: '333', id: 'asdasd' }];

      results = getStatsCFromContest( c.solves );
      console.log("RESULTS: ", results);

    }).catch((e) => {
      show404 = true;
      console.log("ERROR: ", e);
    });
  });
</script>

{#if show404}
  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h4" class="text-center">No se encontró la competencia: "{ name }"</Heading>
  </Card>
{:else if contest }
  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h2" class="text-center flex justify-center gap-1">
      { contest.name }
      
      {#if minRole($userStore, 'delegate')}
        <Link to={ '/admin/contest/' + name }><PencilIcon size="1.2rem"/></Link>
      {/if}
    </Heading>

    <ButtonGroup>
      <Button color="blue" class="rounded-tl-md rounded-bl-md" on:click={ () => showSection(0) }>Información</Button>
      
      {#if contest.status === 'inscription'}
        <Button color="yellow" on:click={ () => showSection(1) }>Registrarse</Button>
      {/if}

      <Button color="green" class="rounded-tr-md rounded-br-md" on:click={ () => showSection(2) }>Competidores</Button>
    </ButtonGroup>

    <ul class="grid gap-4 info-list">
      <!-- Lugar -->
      <li>
        <Span class="flex items-center gap-1">
          <HomeIcon {size}/> Lugar:
        </Span>
        <Span class="p-1 border-b-2 border-b-green-500">{ contest.place }</Span>
      </li>

      <!-- Fecha -->
      <li>
        <Span class="flex items-center gap-1">
          <DateIcon {size}/>Fecha:
        </Span>
        <Span class="p-1 border-b-2 border-b-green-500">{
          moment(contest.date).format('DD/MM/YYYY')
        }</Span>
      </li>

      <!-- Hora -->
      <li>
        <Span class="flex items-center gap-1">
          <ClockIcon {size}/>Hora:
        </Span>
        <Span class="p-1 border-b-2 border-b-green-500">{
          moment(contest.date).format('hh:mm a')
        }</Span>
      </li>

      {#if before('running')}
        <!-- Inscripcion (inicio) -->
        <li>
          <Span class="flex items-center gap-1">
            <DateIcon {size}/>Inicio de inscripción:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500">{
            moment(contest.inscriptionStart).format('DD/MM/YYYY')
          }</Span>
        </li>
      
        <!-- Inscripcion (fin) -->
        <li>
          <Span class="flex items-center gap-1">
            <DateIcon {size}/>Fin de inscripción:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500">{
            moment(contest.inscriptionEnd).format('DD/MM/YYYY')
          }</Span>
        </li>

        <!-- Costo -->
        <li>
          <Span class="flex items-center gap-1">
            <CurrencyIcon {size}/>Costo de inscripción:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500">{
            contest.inscriptionCost === 0 ? 'Gratis' :
              new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'CUP' 
              }).format( contest.inscriptionCost )
          }</Span>
        </li>
      {/if}

      <li>
        <Span class="flex items-center gap-1">
          <PuzzleIcon {size}/>Categorías:
        </Span>
        <Span class="p-1 border-b-2 border-b-green-500 flex flex-wrap gap-2 max-w-[25rem]">
          {#each contest.categories as ct }
            <WcaCategory icon={ ct.category.scrambler }/>
            <Tooltip>{ ct.category.name }</Tooltip> 
          {/each}
        </Span>
      </li>

      <!-- Estado -->
      <li>
        <Span class="flex items-center gap-1">
          <StateIcon {size}/>Estado:
        </Span>
        <Span class="p-1 flex gap-2 items-center">
          <Indicator color={ getIndicatorColor(contest.status) }/>  { getStatus(contest.status) }
        </Span>
      </li>

      <!-- Visible -->
      {#if checkProperty('visible')}
        <li>
          <Span class="flex items-center gap-1">
            <EyeIcon {size}/>Visible:
          </Span>
          <Span class="p-1 border-b-2 border-b-green-500">
            { contest.visible ? 'Si' : 'No' }
          </Span>
        </li>
      {/if}
    </ul>
  </Card>

  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h2" class="text-center"> Resultados </Heading>

    {#each results as res}
      <h2 class="text-xl text-center">{ res[0] }</h2>

      <Table>
        <TableHead>
          <TableHeadCell>No.</TableHeadCell>
          <TableHeadCell>Nombre</TableHeadCell>
          <TableHeadCell>Ao5</TableHeadCell>
          <TableHeadCell>Mejor</TableHeadCell>
        </TableHead>
      </Table>
    {/each}
  </Card>

{:else}
  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Spinner size="20"/>
  </Card>
{/if}

<RoundView round={ roundData } bind:open={ showRound }/>

<style lang="postcss">
  .info-list li {
    @apply flex gap-2;
  }
</style>