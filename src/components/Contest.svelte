<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  // @ts-ignore
  import { STATUS_ORDER, type CONTEST, type CONTEST_STATUS, type SOLVE } from "@interfaces";
  import { getContest } from "@helpers/API";
  import { actualTime, timer } from "@helpers/timer";
  import { contestAo5, getStatsCFromContest } from "@helpers/statistics";
  import Tooltip from "@material/Tooltip.svelte";
  
  // Icons
  import HomeIcon from '@icons/Home.svelte';
  import DateIcon from '@icons/Calendar.svelte';
  import ClockIcon from '@icons/Clock.svelte';
  import CurrencyIcon from '@icons/CurrencyUsd.svelte';
  import PuzzleIcon from '@icons/Puzzle.svelte';
  import StateIcon from '@icons/StateMachine.svelte';
  import EyeIcon from '@icons/Eye.svelte';
  import RoundView from "./RoundView.svelte";

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

  function getStatus(): string {
    let s = contest.status;

    switch(s) {
      case 'pending': return 'Pendiente';
      case 'inscription': return 'Inscripción';
      case 'running': return 'En curso';
      case 'results': return 'Resultados';
      case 'finished': return 'Terminada';
      default:
        break;
    }

    return 'Pendiente';
  }

  function checkProperty(p: string) {
    return Object.prototype.hasOwnProperty.call(contest, p);
  }

  onMount(() => {
    getContest(name).then(c => {
      contest = c;

      // contest.categories = [
      //   { icon: '/WCA/222so.svg', name: '222so', scrambler: '222so' },
      //   { icon: '/WCA/333.svg', name: '333', scrambler: '333' },
      //   { icon: '/WCA/333fm.svg', name: '333fm', scrambler: '333fm' },
      //   { icon: '/WCA/333mbf.svg', name: '333mbf', scrambler: '333mbf' },
      //   { icon: '/WCA/333ni.svg', name: '333ni', scrambler: '333ni' },
      //   { icon: '/WCA/333oh.svg', name: '333oh', scrambler: '333oh' },
      //   { icon: '/WCA/444bld.svg', name: '444bld', scrambler: '444bld' },
      //   { icon: '/WCA/444wca.svg', name: '444wca', scrambler: '444wca' },
      //   { icon: '/WCA/555bld.svg', name: '555bld', scrambler: '555bld' },
      //   { icon: '/WCA/555wca.svg', name: '555wca', scrambler: '555wca' },
      //   { icon: '/WCA/666wca.svg', name: '666wca', scrambler: '666wca' },
      //   { icon: '/WCA/777wca.svg', name: '777wca', scrambler: '777wca' },
      //   { icon: '/WCA/clkwca.svg', name: 'clkwca', scrambler: 'clkwca' },
      //   { icon: '/WCA/mgmp.svg', name: 'mgmp', scrambler: 'mgmp' },
      //   { icon: '/WCA/pyrso.svg', name: 'pyrso', scrambler: 'pyrso' },
      //   { icon: '/WCA/skbso.svg', name: 'skbso', scrambler: 'skbso' },
      //   { icon: '/WCA/sqrs.svg', name: 'sqrs', scrambler: 'sqrs' },
      // ]

      results = getStatsCFromContest( c.solves );
      console.log("RESULTS: ", results);

    }).catch((e) => {
      show404 = true;
      console.log("ERROR: ", e);
    });
  });
</script>

{#if show404}
  ERROR
{:else if contest}
  <div class="card bg-white mt-20 hidden">
    <h1 class="text-2xl text-center">{ contest.name }</h1>
    
    <ul class="action-container">
      <li class="action bg-green-600">
        <button on:click={ () => showSection(0) }>Información</button>
      </li>

      {#if contest.status === 'inscription'}
        <li class="action bg-blue-600">
          <button on:click={ () => showSection(1) }>Registrarse</button>
        </li>
      {/if}
      <li class="action bg-pink-600">
        <button on:click={ () => showSection(2) }>Competidores</button>
      </li>
    </ul>

    <ul class="grid gap-4 info-list">
      <!-- Lugar -->
      <li>
        <span class="info-header"> <HomeIcon {size}/> Lugar: </span>
        <span class="info-content">{ contest.place }</span>
      </li>

      <!-- Fecha -->
      <li>
        <span class="info-header"> <DateIcon {size}/>Fecha: </span>
        <span class="info-content">{ moment(contest.date).format('DD/MM/YYYY') }</span>
      </li>

      <!-- Hora -->
      <li>
        <span class="info-header"> <ClockIcon {size}/>Hora: </span>
        <span class="info-content">{ moment(contest.date).format('hh:mm a') }</span>
      </li>

      {#if before('running')}
        <!-- Inscripcion (inicio) -->
        <li>
          <span class="info-header"> <DateIcon {size}/>Inicio de inscripción: </span>
          <span class="info-content">{ moment(contest.inscriptionStart).format('DD/MM/YYYY') }</span>
        </li>
      
        <!-- Inscripcion (fin) -->
        <li>
          <span class="info-header"> <DateIcon {size}/>Fin de inscripción: </span>
          <span class="info-content">{ moment(contest.inscriptionEnd).format('DD/MM/YYYY') }</span>
        </li>

        <!-- Costo -->
        <li>
          <span class="info-header"> <CurrencyIcon {size}/>Costo de inscripción: </span>
          <span class="info-content">{
            new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'CUP' 
            })
              .format( contest.inscriptionCost )
          }</span>
        </li>
      {/if}

      <!-- Categorias -->
      <li class="flex-col w-full">
        <span class="info-header"> <PuzzleIcon {size}/>Categorías: </span>
        <span class="info-content category-container">
          {#each contest.categories as ct }
            <Tooltip position="top" text={ ct.name }>
              <img class="category" src="{ ct.icon }" alt="{ ct.name }">
            </Tooltip>
          {/each}
        </span>
      </li>

      <!-- Estado -->
      <li>
        <span class="info-header"> <StateIcon {size}/>Estado: </span>
        <span class="info-content">{ getStatus() }</span>
      </li>

      <!-- Visible -->
      {#if checkProperty('visible')}
        <li>
          <span class="info-header"> <EyeIcon {size}/>Visible: </span>
          <span class="info-content"> { contest.visible ? 'Si' : 'No' } </span>
        </li>
      {/if}
    </ul>
  </div>

  <div class="card bg-white mt-5 mb-20">
    <h1 class="text-2xl text-center">Resultados</h1>

    {#each results as category}
      <h2 class="text-xl text-center">{ category[0] }</h2>

      {#each category[1] as rounds}
        <h3 class="text-xl text-center">Ronda { rounds[0] }</h3>
        
        <div class="table-wrapper rounded-md overflow-x-auto shadow-md">
          <table class="table-auto text-center w-full stripped overflow-hidden">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre</th>
                <th>Ao5</th>
                <th>Mejor</th>
                <th>Peor</th>
              </tr>
            </thead>
            <tbody>
              {#each rounds[1] as users, p}
                <tr on:click={ () => { showRound = !!(roundData = users); } }>
                  <td>{ p + 1 }</td>
                  <td>{ users[0] }</td>
                  <td> { timer( contestAo5(users[1]) ) } </td>
                  <td> { timer( users[1].map(actualTime).sort()[0], true ) } </td>
                  <td> { timer( users[1].map(actualTime).sort().reverse()[0], true ) } </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/each}
    {/each}
  </div>

{:else}
  Loading...
{/if}

<RoundView round={ roundData } show={ showRound } on:close={ () => showRound = false }/>

<style lang="postcss">
  .action-container {
    @apply flex justify-evenly overflow-hidden rounded-md
      shadow-md my-4 w-max mx-auto;
  }

  .action {
    @apply text-white px-2 py-1;
  }

  .info-list li {
    @apply flex gap-2;
  }

  .info-header {
    @apply flex items-center gap-1;
  }

  .info-content {
    @apply border-2 border-green-400 p-1 rounded-md;
  }

  .category-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
    gap: .5rem;
  }

  .category {
    @apply w-8 h-8;
  }
</style>