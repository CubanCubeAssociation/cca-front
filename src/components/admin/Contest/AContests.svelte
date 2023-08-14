<script lang="ts">
  import { Link, navigate } from "svelte-routing";
  import Button from "@components/material/Button.svelte";
  import PlusIcon from '@icons/Plus.svelte';
  import type { CONTEST } from "@interfaces";
  import { onMount } from "svelte";
  import { getContests } from "@helpers/API";
  import Tooltip from "@components/material/Tooltip.svelte";
  import moment from "moment";
  import { getStatus } from "@helpers/strings";

  const HEADER = "Competencias";
  const ADD = "Añadir competencia";

  let columns = [
    {
      key: 'name',
      column: "Nombre",
      show: true,
    },
    {
      key: 'place',
      column: "Lugar",
      show: true,
    },
    {
      key: 'date',
      column: "Fecha",
      show: true,
    },
    {
      key: 'categories',
      column: "Categorías",
      show: true,
    },
    {
      key: 'status',
      column: "Estado",
      show: true,
    },
  ];

  let contests: CONTEST[] = [];

  function addContest() {
    navigate('/admin/contest/new');
  }

  onMount(() => {
    getContests()
      .then((res) => {
        contests = res.results;

        console.log("CONTESTS: ", contests);

        if ( contests.length ) {
          const HOP = Object.prototype.hasOwnProperty;
          let u = contests[0];

          for (let i = 0, maxi = columns.length; i < maxi; i += 1) {
            columns[i].show = HOP.call(u, columns[i].key)
              && contests.some(c => c[ columns[i].key ]);
          }
        }
      })
      .catch(err => console.log("ERROR: ", err));
  });
</script>

<div class="card bg-white mt-20">
  <h1 class="text-3xl text-center">{ HEADER }</h1>

  <div class="actions">
    <Button class="bg-green-500" on:click={ addContest }>
      <PlusIcon size="1.2rem"/> { ADD }
    </Button>
  </div>

  {#if contests.length > 0}
    <div class="table-wrapper rounded-md overflow-x-auto shadow-md">
      <table class="table-auto stripped w-full overflow-hidden">
        <thead>
          <tr>
            {#each columns as C}
              {#if C.show }
                <th>{ C.column }</th>
              {/if}
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each contests as c}
            <tr>
              <td
                data-show={ columns[0].show }
                data-cell="Nombre"
                class="text-blue-800">
                <Link to={"/admin/contest/" + c.name } class="flex items-center gap-2">
                  { c.name }
                </Link>
              </td>
              <td data-show={ columns[1].show } data-cell="Lugar">{ c.place }</td>
              <td data-show={ columns[2].show } data-cell="Fecha">
                { moment(c.date).format('DD/MM/YYYY (HH:mm a)') }
              </td>
              <td data-show={ columns[3].show } data-cell="Categorías">
                <div class="category-container">
                  {#each c.categories as ct}
                    <Tooltip text={ ct.name } position="top">
                      <img
                        class="category-img rounded-md transition-all
                          duration-100 cursor-pointer"
                        src={ ct.icon } alt={ ct.name }>
                    </Tooltip>
                  {/each}
                </div>
              </td>
              <td data-show={ columns[4].show } data-cell="Estado">
                { getStatus(c.status) }
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="actions">
      <Button class="bg-green-500" on:click={ addContest }>
        <PlusIcon size="1.2rem"/> { ADD }
      </Button>
    </div>
  {/if}
</div>

<style lang="postcss">
  .actions {
    @apply flex justify-start text-white text-sm my-4;
  }

  td[data-show="false"] {
    display: none;
  }

  @media (max-width: 650px) {
    tr:not(:first-child) {
      border-top: 2px solid #ccc;
    }

    th {
      display: none;
    }

    td {
      display: flex;
      align-items: center;
      gap: .5rem;
    }

    td::before {
      content: attr(data-cell) ": ";
      display: flex;
    }

    td[data-cell="Nombre"]::before {
      display: none;
    }
  }
</style>