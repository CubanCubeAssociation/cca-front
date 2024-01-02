<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "@material/Button.svelte";
  import DeleteIcon from "@icons/Delete.svelte";
  import Modal from "./Modal.svelte";

  type MODAL_TYPE = 'yesNo' | 'delete';

  export let show = false;
  export let type: MODAL_TYPE = 'yesNo';
  export let text = '';
  export let data: any = {};

  let dispatch = createEventDispatcher();

  function send(res: boolean) {
    dispatch("answer", { answer: res, data });
    show = false;
  }

</script>

<Modal bind:show>
  <h3 class="text-lg text-center">{ text }</h3>

  <div class="flex gap-2 justify-center mt-2">
    <Button
      on:click={ () => send(false) }
      class="bg-gray-300 hover:bg-gray-400 text-gray-800 hover:text-black">
      Cancelar
    </Button>
    
    {#if type === 'delete'}
      <Button
        on:click={ () => send(true) }
        class="text-white bg-red-500">
        <DeleteIcon size="1.2rem"/> Eliminar
      </Button>
    {:else}
      <Button
        on:click={ () => send(true) }
        class="text-white"> Aceptar </Button>
    {/if}
  </div>
</Modal>