<script lang="ts">
  interface Round {
    0: string;
    1: SOLVE[];
  }
  
  import type { SOLVE } from "@interfaces";
  import { createEventDispatcher, onMount } from "svelte";
  import Modal from "./modals/Modal.svelte";
  import SolveView from "./SolveView.svelte";
  import { infinitePenalty, sTimer } from "@helpers/timer";

  export let round: Round;
  export let show = false;

  let solveModal = false;
  let solveModalData: SOLVE;
  let data: any[][] = [0, 1, 2, 3, 4].map(() => ['', '', null]);

  let dispatch = createEventDispatcher();

  function showSolve(sv: SOLVE) {
    solveModalData = sv;
    solveModal = true;
  }

  function handleClose() {
    show = false;
    dispatch('close');
  }

  onMount(() => {
    console.log("ROUND: ", round);

    round[1].forEach((s) => {
      let j = s.isExtra ? 1 : 0;
      let i = j ? -s.extra : s.solve;

      data[ i - 1 ][j] = sTimer(s, true, true);
      data[ i - 1 ][2] = s;
    });
  });

</script>

<Modal bind:show on:close={ handleClose }>
  <div class="flex gap-2 justify-center">
    <div class="table-wrapper rounded-md overflow-x-auto shadow-md">
      <table class="table-auto text-center w-full stripped overflow-hidden">
        <thead>
          <tr>
            <th>No.</th>
            <th>Tiempo</th>
            <th>Extra</th>
          </tr>
        </thead>
        <tbody>
          {#each data as d, p}
            <tr on:click={ () => d[2] && showSolve(d[2]) } class="cursor-pointer">
              <td>{ p + 1 }</td>
              <td>{ d[0] || '-' }</td>
              <td>{ d[1] || '-' }</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</Modal>

<SolveView show={ solveModal } solve={ solveModalData } on:close={ () => solveModal = false }/>