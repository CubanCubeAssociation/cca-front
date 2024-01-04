<script lang="ts">
  import type { SOLVE } from "@interfaces";
  // import Modal from "./modals/Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import { sTimer } from "@helpers/timer";
  import { Modal } from "flowbite-svelte";

  export let open = false;
  export let solve: SOLVE;

  let dispatch = createEventDispatcher();

  function handleClose() {
    open = false;
    dispatch('close');
  }
</script>

<Modal bind:open on:close={ handleClose }>
  <div class="table-wrapper rounded-md overflow-x-auto shadow-md">
    <table class="table-auto text-center w-full stripped overflow-hidden">
      <tbody>
        <tr> <td>Categoría</td> <td>{ solve?.category?.name || '' }</td> </tr>
        <tr> <td>Competidor</td> <td>{ solve?.user?.name || '' }</td> </tr>
        <tr> <td>Scrambler</td> <td>{ solve?.scrambler?.name || '' }</td> </tr>
        <tr> <td>Juez</td> <td>{ solve?.judge?.name || '' }</td> </tr>
        <tr> <td>Ronda</td> <td>{ solve?.round || '' }</td> </tr>
        <tr> <td>Número</td> <td>{ solve?.solve || '' }</td> </tr>
        <tr> <td>Tiempo</td> <td>{ sTimer(solve, true, true) }</td> </tr>
        <tr> <td>Extra</td> <td>{ solve?.isExtra ? `Sí (${solve?.extra})` : 'No' }</td> </tr>
        <tr> <td>Reconstrucción</td> <td>{ solve?.reconstruction || '' }</td> </tr>
      </tbody>
    </table>
  </div>

  <!-- reconstruction: string;
  penaltyType: PENALTY;
  penaltyDetails: string; -->
</Modal>