<script lang="ts">
  import { onMount } from "svelte";
  import { ICONS } from "@constants";
  import type { CATEGORY } from "@interfaces";
  import { createCategory, getCategory, removeCategory, updateCategory } from "@helpers/API";
  import { navigate } from "svelte-routing";
  import DeleteIcon from "@icons/Delete.svelte";
  import SaveIcon from "@icons/Send.svelte";
  import ExclamationIcon from '@icons/Exclamation.svelte';
  import { Button, Card, Heading, Input, Label, Modal, Tooltip } from "flowbite-svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";

  export let id: string;

  let type: 'update' | 'create' = 'update';
  let category: CATEGORY = {
    id: '',
    name: '',
    scrambler: '333'
  };

  let showModal = false;

  function selectIcon(ic: CATEGORY) {
    category.scrambler = ic.scrambler;
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

  function deleteCategory() {
    removeCategory(category)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  onMount(() => {
    type = id ? 'update' : 'create';

    id && getCategory(id)
      .then(cat => {
        if ( !cat ) return;
        category = cat;
      })
  });
</script>

<Card class="mt-4 w-[min(100%,40rem)] mx-auto">
  <Heading class="text-3xl text-center">{ type === 'update' ? 'Editar' : 'Crear'} categoría</Heading>

  <form class="mt-8 grid gap-2" on:submit|preventDefault={ save }>
    <div>
      <Label for="name" class="mb-2">Nombre</Label>
      <Input bind:value={ category.name } type="text" id="name" placeholder="Nombre..." required />
    </div>

    <div>
      <Label>Ícono</Label>

      {#each ICONS as I}
        <button on:click={ () => selectIcon(I) } id={"ICON-" + I.scrambler} type="button">
          <WcaCategory icon={ I.scrambler } selected={ I.scrambler === category.scrambler }/>
        </button>
        <Tooltip triggeredBy={ "#ICON-" + I.scrambler }>{ I.name }</Tooltip>
      {/each}
    </div>

    <div>
      <Label>Scrambler</Label>
      <Input bind:value={ category.scrambler }/>
    </div>

    <div class="col-span-full flex flex-wrap gap-2 justify-center">
      {#if type === 'update' }
        <Button color="red" on:click={ () => showModal = true }>
          <DeleteIcon size="1.2rem"/> Eliminar
        </Button>
      {/if}
      
      <Button class="text-white" type="submit">
        <SaveIcon size="1.2rem"/> { type === 'update' ? 'Guardar' : 'Crear' }
      </Button>
    </div>
  </form>
</Card>

<Modal bind:open={ showModal } autoclose outsideclose size="xs">
  <div class="flex flex-col items-center justify-center">
    <div class="icon-circle border-[.3rem] border-gray-400 dark:border-gray-200 w-[4rem] h-[4rem] rounded-full grid">
      <ExclamationIcon class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
    </div>
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 mt-2">¿Desea eliminar esta categoría?</h3>
    <div class="flex gap-2">
      <Button on:click={ deleteCategory } color="red"><DeleteIcon size="1.2rem"/> Eliminar</Button>
      <Button color="alternative">Cancelar</Button>
    </div>
  </div>
</Modal>