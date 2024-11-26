<script lang="ts">
  import { onMount } from "svelte";
  import { Paginator } from "@classes/Paginator.svelte";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import { getUsers } from "@helpers/API";
  import type { USER } from "@interfaces";
  import {
    Button,
    Card,
    Heading,
    Span,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { screen } from "@stores/screen.store";
  import UserField from "@components/UserField.svelte";

  let error = $state(false);
  let loading = $state(false);
  let pg = $state(new Paginator([], 20));
  let users = $state([] as USER[]);

  function updateData() {
    loading = true;
    error = false;
    users.length = 0;

    getUsers(pg.page, pg.limit)
      .then(res => {
        if (!res) {
          error = true;
          return;
        }

        pg.setTotal(res.totalResults);
        pg.setPage(res.page);
        users = res.results;
        error = false;
      })
      .catch(err => {
        console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => {
        loading = false;
      });
  }

  onMount(() => {
    updateData();
  });
</script>

<Card class="mx-auto mb-8 mt-4 flex w-[calc(100%-2rem)] max-w-4xl flex-col items-center gap-4">
  <Heading tag="h1" class="flex items-center justify-center gap-1 text-center text-4xl">
    Competidores
  </Heading>

  {#if loading}
    <Spinner />
  {:else if users.length > 0}
    <PaginatorComponent showNextPrev={!$screen.isMobile} update={updateData} bind:pg class="mb-4" />

    <Table hoverable shadow divClass="w-full relative overflow-x-auto">
      <TableHead>
        <TableHeadCell>#</TableHeadCell>
        <TableHeadCell>Nombre</TableHeadCell>
        <TableHeadCell>Provincia</TableHeadCell>
        <TableHeadCell>ELO</TableHeadCell>
      </TableHead>

      <TableBody>
        {#each users as user, pos}
          <TableBodyRow>
            <TableBodyCell>
              {(pg.page - 1) * pg.limit + pos + 1}
            </TableBodyCell>
            <TableBodyCell>
              <UserField {user} showAvatar link />
            </TableBodyCell>
            <TableBodyCell>{user.province}</TableBodyCell>
            <TableBodyCell>-</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>

    <PaginatorComponent showNextPrev={!$screen.isMobile} update={updateData} bind:pg class="mb-4" />
  {:else if error}
    <Span class="text-center !text-red-500">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </Span>

    <Button class="mt-8 w-min" on:click={updateData}>Recargar</Button>
  {:else}
    <Span class="text-center">No hay resultados disponibles</Span>
  {/if}
</Card>
