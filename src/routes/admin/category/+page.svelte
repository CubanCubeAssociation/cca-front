<script lang="ts">
  import { onMount } from "svelte";
  import type { CATEGORY } from "@interfaces";
  import { getCategories } from "@helpers/API";
  import PlusIcon from "@icons/Plus.svelte";
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
  <div class="card mt-4 max-w-lg mx-auto mb-8">
    <h1 class="text-3xl text-center">{HEADER}</h1>

    <div class="actions">
      <button class="btn btn-primary" onclick={addCategory}>
        <PlusIcon size="1.2rem" />
        {ADD}
      </button>
    </div>

    {#if categories.length > 0}
      <div class="overflow-x-auto w-full">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ícono</th>
              <th>Scrambler</th>
            </tr>
          </thead>

          <tbody>
            {#each categories as cat}
              <tr>
                <td><a href={"/admin/category/" + cat.id}>{cat.name}</a></td>
                <td><WcaCategory icon={cat.scrambler} /></td>
                <td>{cat.scrambler}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="actions">
        <button class="btn btn-primary" onclick={addCategory}>
          <PlusIcon size="1.2rem" />
          {ADD}
        </button>
      </div>
    {/if}
  </div>
</PrivateRouteGuard>

<style lang="postcss">
  @reference "tailwindcss";
  .actions {
    @apply flex justify-start my-4;
  }
</style>
