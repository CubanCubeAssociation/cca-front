<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let show = false;

  let dispatch = createEventDispatcher();
  let dialog: HTMLDialogElement;

  function showDialog() {
    dialog.showModal();
    dispatch('open');
  }

  function hideDialog() {
    dialog.close();
    show = false;
    dispatch('close');
  }

  function handleShow(s: boolean) {
    if ( dialog ) {
      s && showDialog();
      !s && hideDialog();
    }
  }

  $: handleShow(show);
</script>

<dialog bind:this={ dialog }
  data-modal data-open={ show }
  class="bg-white text-current shadow-md rounded-md">
  <slot />
</dialog>