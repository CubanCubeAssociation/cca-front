<script lang="ts">
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import type { USER } from "@interfaces";
  import { getUsers } from "@helpers/API";

  import Button from "@material/Button.svelte";
  import PlusIcon from '@icons/Plus.svelte';
  import UserIcon from '@icons/Account.svelte';
  import AdminIcon from '@icons/Shield.svelte';
  import DelegateIcon from '@icons/Sword.svelte';
  import Tooltip from "@components/material/Tooltip.svelte";

  const HEADER = "Usuarios";
  const ADD = "Añadir usuario";
  
  let users: USER[] = [];
  let columns = [
    {
      key: 'name',
      column: "Nombre",
      show: true,
    },
    {
      key: 'username',
      column: "Usuario",
      show: true,
    },
    {
      key: 'ci',
      column: "CI",
      show: true,
    },
    {
      key: 'email',
      column: "Email",
      show: true,
    },
    {
      key: 'province',
      column: "Provincia",
      show: true,
    },
    {
      key: 'municipality',
      column: "Municipio",
      show: true,
    },
    {
      key: 'credit',
      column: "Crédito",
      show: true,
    }
  ];

  function addUser() {
    navigate('/admin/user/new');
  }

  onMount(() => {
    getUsers()
      .then((res) => {
        users = res.results;

        if ( users.length ) {
          const HOP = Object.prototype.hasOwnProperty;
          let u = users[0];

          for (let i = 0, maxi = columns.length; i < maxi; i += 1) {
            columns[i].show = HOP.call(u, columns[i].key)
              && users.some(u => u[ columns[i].key ]);
          }
        }
      })
      .catch(err => console.log("ERROR: ", err));
  });

</script>

<div class="card bg-white mt-20">
  <h1 class="text-3xl text-center">{ HEADER }</h1>

  <div class="actions">
    <Button class="bg-green-500" on:click={ addUser }>
      <PlusIcon size="1.2rem"/> { ADD }
    </Button>
  </div>

  <!-- 
    name: string;
      avatar: string;
      role: ROLE;
    username: string;
    ci: string;
      sex: 'M' | 'F';
      age: number;
    email: string;
      isEmailVerified: boolean;
    province: string;
    municipality: string;
    credit: number;
    
    id: string;
    password: string;
  -->

  {#if users.length > 0}
    <div class="table-wrapper rounded-md overflow-x-auto">
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
          {#each users as u}

            <tr>
              <td
                data-show={ columns[0].show }
                data-cell="Nombre"
                class="text-blue-800">
                <Link to={"/admin/user/" + u.id } class="flex items-center gap-2">
                  <!-- Avatar -->
                  {#if u.avatar}
                    <img src={ u.avatar } alt={ u.name } class="avatar">
                  {:else}
                    <div class="avatar">
                      <UserIcon size="100%"/>
                    </div>
                  {/if}
  
                  <!-- Name -->
                  { u.name }
  
                  <!-- Role -->
                  {#if u.role === 'admin'}
                    <Tooltip text="Administrador" position="top">
                      <AdminIcon />
                    </Tooltip>
                    {:else if u.role === 'delegate'}
                    <Tooltip text="Delegado" position="top">
                      <DelegateIcon />
                    </Tooltip>
                  {/if}
                </Link>
              </td>
              <td data-show={ columns[1].show } data-cell="Usuario">{ u.username }</td>
              <td data-show={ columns[2].show } data-cell="CI">
                { u.ci || "-" }
  
                <div>
                  { u.sex } / { u.age } años
                </div>
              </td>
              <td data-show={ columns[3].show } data-cell="Email">{ u.email || "-" }</td>
              <td data-show={ columns[4].show } data-cell="Provincia">{ u.province || "-" }</td>
              <td data-show={ columns[5].show } data-cell="Municipio">{ u.municipality || "-" }</td>
              <td data-show={ columns[6].show } data-cell="Crédito">{ u.credit } CUP</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="actions">
      <Button class="bg-green-500" on:click={ addUser }>
        <PlusIcon size="1.2rem"/> { ADD }
      </Button>
    </div>
  {/if}
</div>

<style lang="postcss">
  .actions {
    @apply flex justify-start text-white text-sm my-4;
  }

  td[data-cell="Usuario"] {
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 15ch;
    overflow: hidden;
  }

  td[data-show="false"] {
    display: none;
  }

  @media (max-width: 650px) {
    th {
      display: none;
    }

    td {
      display: flex;
      align-items: center;
      gap: .5rem;
    }

    td[data-cell="Usuario"] {
      max-width: 35ch;
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