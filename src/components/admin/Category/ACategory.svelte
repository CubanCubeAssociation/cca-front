<script lang="ts">
  import { onMount } from "svelte";
  import { ICONS } from "@constants";
  import type { CATEGORY } from "@interfaces";
  import Input from "@material/Input.svelte";
  import Tooltip from "@material/Tooltip.svelte";
  import { createCategory, getCategory, removeCategory, updateCategory } from "@helpers/API";
  import Button from "@material/Button.svelte";
  import { navigate } from "svelte-routing";

  import DeleteIcon from "@icons/Delete.svelte";
  import SaveIcon from "@icons/Send.svelte";

  export let id: string;

  let type: 'update' | 'create' = 'update';
  let category: CATEGORY = {
    icon: '',
    id: '',
    name: '',
    scrambler: ''
  };

  let dialog: HTMLDialogElement;

  function selectIcon(ic: CATEGORY) {
    category.icon = ic.icon;
  }

  function exit() {
    navigate('/admin/category');
  }

  function save() {
    if ( id ) {
      updateCategory(category)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    } else {
      createCategory(category)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    }
  }

  function closeModal() {
    dialog.close();
  }

  function deleteCategory() {
    closeModal();
    removeCategory(category)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  onMount(() => {
    type = id ? 'update' : 'create';

    id && getCategory(id)
      .then(cat => {
        category = cat;
      })
  });
</script>

<div class="card mt-20 bg-white">
  <h1 class="text-3xl text-center">
    { type === 'update' ? 'Editar' : 'Crear'} categoría
  </h1>
  
  <table class="table-auto w-full my-8 shadow-none">
    <tbody>
      <tr>
        <td>Nombre</td>
        <td>
          <Input bind:value={ category.name }/>
        </td>
      </tr>
      
      <tr>
        <td>Ícono</td>
        <td class="icon-container my-4">
          {#each ICONS as I}
            <Tooltip text={ I.name } position="top">
              <img
                class="category-img rounded-md transition-all
                  duration-100 cursor-pointer"
                class:selected={ I.icon === category.icon }
                on:click={ () => selectIcon(I) }
                src={ I.icon } alt={ I.name }>
            </Tooltip>
          {/each}
        </td>
      </tr>
      
      <tr>
        <td>Scrambler</td>
        <td>
          <Input bind:value={ category.scrambler }/>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="flex justify-center gap-2">
    {#if type === 'update' }
      <Button class="text-white bg-red-500" on:click={ () => dialog.showModal() }>
        <DeleteIcon size="1.2rem"/> Eliminar
      </Button>
    {/if}
    
    <Button class="text-white" on:click={ save }>
      <SaveIcon size="1.2rem"/> { type === 'update' ? 'Guardar' : 'Crear' }
    </Button>
  </div>
</div>

<dialog
  bind:this={ dialog }
  class="bg-white text-current shadow-md rounded-md"
  >
  <h3 class="text-lg mb-4">¿Desea eliminar esta categoría?</h3>
  <div class="flex gap-2 justify-center">
    <Button class="text-white"
      on:click={ closeModal }
    >Cancelar</Button>
    
    <Button class="text-white bg-red-500" on:click={ deleteCategory }>
      <DeleteIcon size="1.2rem"/> Eliminar
    </Button>
  </div>
</dialog>

<style class="postcss">
  .icon-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(2rem, 1fr));
    gap: .5rem;
  }

  .category-img.selected {
    @apply bg-yellow-300 shadow-md;
  }
</style>