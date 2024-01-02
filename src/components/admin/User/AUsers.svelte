<script lang="ts">
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import type { USER } from "@interfaces";
  import { getUsers } from "@helpers/API";

  // import Button from "@material/Button.svelte";
  import PlusIcon from '@icons/Plus.svelte';
  import UserIcon from '@icons/Account.svelte';
  import AdminIcon from '@icons/Shield.svelte';
  import DelegateIcon from '@icons/Sword.svelte';
  import { Button, Card, Heading, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, A } from "flowbite-svelte";
  // import Tooltip from "@components/material/Tooltip.svelte";

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
        if ( !res ) return;
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

<Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8">
  <Heading class="text-3xl text-center">{ HEADER }</Heading>

  <div class="actions">
    <Button on:click={ addUser }>
      <PlusIcon size="1.2rem"/> { ADD }
    </Button>
  </div>

  {#if users.length > 0}
    <Table striped hoverable noborder={false} shadow>
        <TableHead>
          {#each columns as C}
            {#if C.show }
              <TableHeadCell>{ C.column }</TableHeadCell>
            {/if}
          {/each}
        </TableHead>

        <TableBody>
          {#each users as u}
            <TableBodyRow>
              {#if columns[0].show}
                <TableBodyCell>
                  <Link to={"/admin/user/" + u.id} class="flex gap-2 items-center">
                    {#if u.avatar}
                      <img src={ u.avatar } alt={ u.name } class="avatar">
                    {:else}
                      <div class="avatar">
                        <UserIcon size="100%"/>
                      </div>
                    {/if}

                    { u.name }
                  </Link>
                </TableBodyCell>
              {/if}

              {#if columns[1].show}
                <TableBodyCell> { u.username } </TableBodyCell>
              {/if}

              {#if columns[2].show}
                <TableBodyCell>
                  { u.ci || "-" }
                  <div> { u.sex } / { u.age } años </div>
                </TableBodyCell>
              {/if}

               {#if columns[3].show} <TableBodyCell>{ u.email || "-" }</TableBodyCell> {/if}
               {#if columns[4].show} <TableBodyCell>{ u.province || "-" }</TableBodyCell> {/if}
               {#if columns[5].show} <TableBodyCell>{ u.municipality || "-" }</TableBodyCell> {/if}
               {#if columns[6].show} <TableBodyCell>{ u.credit } CUP</TableBodyCell> {/if}
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>

    <div class="actions">
      <Button on:click={ addUser }>
        <PlusIcon size="1.2rem"/> { ADD }
      </Button>
    </div>
  {/if}
</Card>

<style lang="postcss">
  .actions {
    @apply flex justify-start my-4;
  }
</style>