<script lang="ts">
  import { onMount } from "svelte";
  import type { CATEGORY } from "@interfaces";
  import { getCategories } from "@helpers/API";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";
  import { PlusIcon } from "lucide-svelte";
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import { SITEMAP } from "@helpers/routing";

  const HEADER = "Categorías";
  const ADD = "Añadir categoría";

  let categories: CATEGORY[] = $state([]);
  let loading = $state(false);
  let error = $state(false);

  function addCategory() {
    goto(SITEMAP.admin.category + "/new");
  }

  function updateData() {
    loading = true;
    error = false;

    getCategories()
      .then(res => {
        if (!res) {
          error = true;
          return;
        }
        categories = res.results.sort((a, b) => (a.name < b.name ? -1 : 1));
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  onMount(() => {
    updateData();
  });
</script>

<PrivateRouteGuard>
  <LoadingLayout
    class="max-w-lg"
    {loading}
    {error}
    altError={categories.length <= 0}
    reloadFunction={updateData}
  >
    {#snippet title()}
      <WcaCategory icon="333" size="1.5rem" class="text-yellow-400" buttonClass="p-[.1rem]!" />
      {HEADER}
    {/snippet}

    {#snippet content()}
      <div class="actions">
        <button class="btn btn-primary" onclick={addCategory}>
          <PlusIcon size="1.2rem" />
          {ADD}
        </button>
      </div>

      <div class="overflow-x-auto w-full rounded-lg border border-base-content/10">
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
                <td><a href={SITEMAP.admin.category + "/" + cat.id}>{cat.name}</a></td>
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
    {/snippet}
  </LoadingLayout>
</PrivateRouteGuard>

<style lang="postcss">
  @reference "tailwindcss";
  .actions {
    @apply flex justify-start my-4;
  }
</style>
