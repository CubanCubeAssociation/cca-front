<script lang="ts">
  import { onMount } from "svelte";
  import type { USER } from "@interfaces";
  import { getUsers } from "@helpers/API";

  import PlusIcon from "@icons/Plus.svelte";
  import AdminIcon from "@icons/ShieldAccount.svelte";
  import DelegateIcon from "@icons/Shield.svelte";

  import {
    Button,
    Card,
    Heading,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Avatar,
    Span,
    Spinner,
  } from "flowbite-svelte";
  import { Paginator } from "@classes/Paginator.svelte";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import SearchUser from "$lib/components/SearchUser.svelte";
  import { goto } from "$app/navigation";

  const HEADER = "Usuarios";
  const ADD = "Añadir usuario";

  let loading = false;
  let error = false;
  let users: USER[] = [];
  let columns = [
    {
      key: "name",
      column: "Nombre",
      show: true,
    },
    {
      key: "username",
      column: "Usuario",
      show: true,
    },
    {
      key: "ci",
      column: "CI",
      show: true,
    },
    {
      key: "email",
      column: "Email",
      show: true,
    },
    {
      key: "province",
      column: "Provincia",
      show: true,
    },
    {
      key: "municipality",
      column: "Municipio",
      show: true,
    },
    {
      key: "credit",
      column: "Crédito",
      show: true,
    },
  ];
  let pg = new Paginator([], 10);

  function addUser() {
    goto("/admin/user/new");
  }

  function updateUsers() {
    loading = true;
    error = false;

    getUsers(pg.page)
      .then(res => {
        if (!res) {
          error = true;
          return;
        }

        users = res.results;

        pg.setTotal(res.totalResults);
        pg = pg;

        if (users.length) {
          const HOP = Object.prototype.hasOwnProperty;
          let u = users[0];

          for (let i = 0, maxi = columns.length; i < maxi; i += 1) {
            columns[i].show = HOP.call(u, columns[i].key) && users.some(u => u[columns[i].key]);
          }
        }
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    pg = pg;
    updateUsers();
  }

  function handleSearch(user: USER | USER[]) {
    if (Array.isArray(user)) return;
    window.open(`/admin/user/${user.id}`, "_blank");
  }

  onMount(updateUsers);
</script>

<Card class="mx-auto mb-8 mt-4 grid w-[calc(100%-2rem)] max-w-4xl place-items-center">
  <Heading class="text-center text-3xl">{HEADER}</Heading>

  <div class="actions gap-2">
    <Button on:click={addUser}>
      <PlusIcon size="1.2rem" />
      {ADD}
    </Button>

    <Button>Buscar</Button>
    <SearchUser multiple={false} user={handleSearch} type="dropdown" />
  </div>

  {#if loading}
    <Spinner size="10" class="mx-auto" />
  {:else if users.length > 0}
    <PaginatorComponent {pg} update={updatePaginator} class="mb-4" />
    <Table striped hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell>#</TableHeadCell>
        {#each columns as C}
          {#if C.show}
            <TableHeadCell>{C.column}</TableHeadCell>
          {/if}
        {/each}
      </TableHead>

      <TableBody>
        {#each users as u, pos}
          <TableBodyRow>
            <TableBodyCell>{(pg.page - 1) * pg.limit + pos + 1}</TableBodyCell>

            {#if columns[0].show}
              <TableBodyCell>
                <a href={"/admin/user/" + u.id} class="flex items-center gap-2">
                  <Avatar alt={u.name} src={u.avatar} />
                  {u.name}

                  {#if u.role === "admin"}
                    <AdminIcon size="1.1rem" class="text-primary-500 dark:text-primary-400" />
                  {:else if u.role === "delegate"}
                    <DelegateIcon class="text-green-500 dark:text-green-400" />
                  {/if}
                </a>
              </TableBodyCell>
            {/if}

            {#if columns[1].show}
              <TableBodyCell>{u.username}</TableBodyCell>
            {/if}

            {#if columns[2].show}
              <TableBodyCell>
                {u.ci || "-"}
                <div>{u.sex} / {u.age} años</div>
              </TableBodyCell>
            {/if}

            {#if columns[3].show}
              <TableBodyCell>{u.email || "-"}</TableBodyCell>
            {/if}
            {#if columns[4].show}
              <TableBodyCell>{u.province || "-"}</TableBodyCell>
            {/if}
            {#if columns[5].show}
              <TableBodyCell>{u.municipality || "-"}</TableBodyCell>
            {/if}
            {#if columns[6].show}
              <TableBodyCell>{u.credit} CUP</TableBodyCell>
            {/if}
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <PaginatorComponent {pg} update={updatePaginator} class="mt-4" />

    <div class="actions">
      <Button on:click={addUser}>
        <PlusIcon size="1.2rem" />
        {ADD}
      </Button>
    </div>
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <Button class="mt-8 w-min" on:click={updateUsers}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay usuarios todavía</Span>
  {/if}
</Card>

<style lang="postcss">
  .actions {
    @apply my-4 flex justify-start;
  }
</style>
