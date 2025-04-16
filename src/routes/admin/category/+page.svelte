<script lang="ts">
  import { onMount } from "svelte";
  import type { CATEGORY } from "@interfaces";
  import { getCategories } from "@helpers/API";
  import PlusIcon from "@icons/Plus.svelte";
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
  } from "flowbite-svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";

  const HEADER = "Categorías";
  const ADD = "Añadir categoría";

  let categories: CATEGORY[] = [];

  function addCategory() {
    goto("/admin/category/new");
  }

  onMount(() => {
    getCategories()
      .then(res => {
        if (!res) {
          return;
        }
        categories = res.results.sort((a, b) => (a.name < b.name ? -1 : 1));
      })
      .catch(err => console.dir(err));
  });
</script>

<PrivateRouteGuard>
  <Card class="mt-4 max-w-lg w-[calc(100%-2rem)] mx-auto mb-8">
    <Heading class="text-3xl text-center">{HEADER}</Heading>

    <div class="actions">
      <Button on:click={addCategory}>
        <PlusIcon size="1.2rem" />
        {ADD}
      </Button>
    </div>

    {#if categories.length > 0}
      <Table striped hoverable shadow>
        <TableHead>
          <TableHeadCell>Nombre</TableHeadCell>
          <TableHeadCell>Ícono</TableHeadCell>
          <TableHeadCell>Scrambler</TableHeadCell>
        </TableHead>

        <TableBody>
          {#each categories as cat}
            <TableBodyRow>
              <TableBodyCell>
                <a href={"/admin/category/" + cat.id}>{cat.name}</a>
              </TableBodyCell>
              <TableBodyCell>
                <WcaCategory icon={cat.scrambler} />
              </TableBodyCell>
              <TableBodyCell>{cat.scrambler}</TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>

      <div class="actions">
        <Button on:click={addCategory}>
          <PlusIcon size="1.2rem" />
          {ADD}
        </Button>
      </div>
    {/if}
  </Card>
</PrivateRouteGuard>

<style lang="postcss">
  @reference "tailwindcss";
  .actions {
    @apply flex justify-start my-4;
  }
</style>
