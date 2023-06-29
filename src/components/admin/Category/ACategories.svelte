<script lang="ts">
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import type { CATEGORY } from '@interfaces';
  import { getCategories } from '@helpers/API';
  import Button from '@components/material/Button.svelte';
  import PlusIcon from '@icons/Plus.svelte';
  
  const HEADER = "Categorías";
  const ADD = "Añadir categoría";

  let categories: CATEGORY[] = [];

  function addCategory() {
    navigate("/admin/category/new");
  }

  onMount(() => {
    getCategories()
      .then(res => {
        categories = res.results;
      })
      .catch(err => console.log("ERROR: ", err));
  });
</script>

<div class="card bg-white mt-20">
  <h1 class="text-3xl text-center">{ HEADER }</h1>

  <div class="actions">
    <Button class="bg-green-500" on:click={ addCategory }>
      <PlusIcon size="1.2rem"/> { ADD }
    </Button>
  </div>

  <table class="table-auto w-full">
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
          <td class="text-blue-800">
            <Link to={"/admin/category/" + cat.id }>
              { cat.name }
            </Link>
          </td>
          <td>
            <img
              class="category-img mx-auto"
              src={ cat.icon } alt={ cat.name }>
          </td>
          <td>{ cat.scrambler }</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="actions">
    <Button class="bg-green-500" on:click={ addCategory }>
      <PlusIcon size="1.2rem"/> { ADD }
    </Button>
  </div>
</div>

<style lang="postcss">
  .actions {
    @apply flex justify-start text-white text-sm my-4;
  }
</style>