<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  // @ts-ignore
  import { STATUS_ORDER, type CONTEST, type CONTEST_STATUS } from "@interfaces";
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
  import { Button, ButtonGroup, Card, Heading, Span, Table, TableHead, TableHeadCell, Tooltip } from "flowbite-svelte";
    import WcaCategory from "./wca/WCACategory.svelte";

  export let name: string;

  const size = '1.4rem';
  let show404 = false;
  let contest: CONTEST;
  let section: number = 0;
  let results: any = [];

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
    getContest( name ).then(c => {
      if ( !c ) return;

      contest = c;

      contest.categories = [
        { name: '222so', scrambler: '222so' },
        { name: '333', scrambler: '333' },
        { name: '333fm', scrambler: '333fm' },
        { name: '333mbf', scrambler: '333mbf' },
        { name: '333ni', scrambler: '333ni' },
        { name: '333oh', scrambler: '333oh' },
        { name: '444bld', scrambler: '444bld' },
        { name: '444wca', scrambler: '444wca' },
        { name: '555bld', scrambler: '555bld' },
        { name: '555wca', scrambler: '555wca' },
        { name: '666wca', scrambler: '666wca' },
        { name: '777wca', scrambler: '777wca' },
        { name: 'clkwca', scrambler: 'clkwca' },
        { name: 'mgmp', scrambler: 'mgmp' },
        { name: 'pyrso', scrambler: 'pyrso' },
        { name: 'skbso', scrambler: 'skbso' },
        { name: 'sqrs', scrambler: 'sqrs' },
      ];

      // contest.categories = [{ name: 'asdas', scrambler: '333', id: 'asdasd' }];

      // console.log(c.solves);

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
  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h2" class="text-center">{ contest.name }</Heading>

    <ButtonGroup>
      <Button color="blue" class="rounded-tl-md rounded-bl-md" on:click={ () => showSection(0) }>Información</Button>
      
      {#if contest.status === 'inscription'}
        <Button color="yellow" on:click={ () => showSection(1) }>Registrarse</Button>
      {/if}

      <Button color="green" class="rounded-tr-md rounded-br-md" on:click={ () => showSection(2) }>Competidores</Button>
    </ButtonGroup>

    <ul class="grid gap-4 info-list">
      <li>
        <Span class="flex items-center gap-1">
          <HomeIcon {size}/> Lugar:
        </Span>
        <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">{ contest.place }</Span>
      </li>

      <li>
        <Span class="flex items-center gap-1">
          <DateIcon {size}/>Fecha:
        </Span>
        <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">{
          moment(contest.date).format('DD/MM/YYYY')
        }</Span>
      </li>

      <li>
        <Span class="flex items-center gap-1">
          <ClockIcon {size}/>Hora:
        </Span>
        <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">{
          moment(contest.date).format('hh:mm a')
        }</Span>
      </li>

      {#if before('running')}
        <li>
          <Span class="flex items-center gap-1">
            <DateIcon {size}/>Inicio de inscripción:
          </Span>
          <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">{
            moment(contest.inscriptionStart).format('DD/MM/YYYY')
          }</Span>
        </li>
      
        <li>
          <Span class="flex items-center gap-1">
            <DateIcon {size}/>Fin de inscripción:
          </Span>
          <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">{
            moment(contest.inscriptionEnd).format('DD/MM/YYYY')
          }</Span>
        </li>

        <li>
          <Span class="flex items-center gap-1">
            <CurrencyIcon {size}/>Costo de inscripción:
          </Span>
          <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">{
            new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'CUP' 
            })
              .format( contest.inscriptionCost )
          }</Span>
        </li>
      {/if}

      <li>
        <Span class="flex items-center gap-1">
          <PuzzleIcon {size}/>Categorías:
        </Span>
        <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md flex flex-wrap gap-2 max-w-[25rem]">
          {#each contest.categories as ct }
            <WcaCategory icon={ ct.scrambler }/>
            <Tooltip>{ ct.name }</Tooltip> 
          {/each}
        </Span>
      </li>

      <li>
        <Span class="flex items-center gap-1">
          <StateIcon {size}/>Estado:
        </Span>
        <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">{ getStatus() }</Span>
      </li>

      {#if checkProperty('visible')}
        <li>
          <Span class="flex items-center gap-1">
            <EyeIcon {size}/>Visible:
          </Span>
          <Span class="border-2 border-green-600 dark:border-green-400 p-1 rounded-md">
            { contest.visible ? 'Si' : 'No' }
          </Span>
        </li>
      {/if}
    </ul>
  </Card>

  <Card class="mt-4 max-w-3xl w-[calc(100%-2rem)] mx-auto mb-8 flex flex-col items-center gap-4">
    <Heading tag="h2" class="text-center"> Resultados </Heading>

    {#each results as res}
      <Heading tag="h3" class="text-center">{ res[0] }</Heading>

      <Table>
        <TableHead>
          <TableHeadCell>No.</TableHeadCell>
          <TableHeadCell>Nombre</TableHeadCell>
          <TableHeadCell>Ao5</TableHeadCell>
          <TableHeadCell>Mejor</TableHeadCell>
        </TableHead>
        
      </Table>
      <!-- <tbody>
        {#each res[1] as users, p}
          <tr>
            <td>{ p + 1 }</td>
            <td>{ users[0] }</td>
            <td>
              {
                timer(
                  getAverageS(5, users[1])[4] || 0, true
                )
              }
            </td>
            <td>
              {
                timer(
                  users[1].map(actualTime).sort()[0], true
                )
              }
            </td>
          </tr>
          <tr>
            <td class="flex gap-2" colspan="4">
              {#each users[1] as sv}
                <div class="solve"
                  class:extra={ !sv.isExtra}
                  data-extra={ -sv.extra }
                >
                  { sTimer(sv, true) }
                </div>
              {/each}
            </td>
          </tr>
        {/each}
      </tbody> -->
    {/each}
  </Card>

{:else}
  Loading...
{/if}

<style lang="postcss">
  .info-list li {
    @apply flex gap-2;
  }

  .category {
    @apply w-8 h-8;
  }

  .solve {
    @apply w-max p-1 rounded-md border-2 border-green-500
      cursor-pointer hover:shadow-md transition-all duration-200;
  }

  .solve.extra {
    @apply border-blue-500 relative;
  }

  .solve.extra::before {
    @apply absolute -top-2 -right-2 bg-blue-800 w-5 h-5
      text-xs text-white grid place-items-center
      rounded-full;
    content: attr(data-extra);
  }
</style>