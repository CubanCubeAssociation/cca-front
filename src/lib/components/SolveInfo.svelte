<script lang="ts">
  import { sTimer } from "@helpers/timer";
  import { PENALTY, type ROUND, type SOLVE } from "@interfaces";
  import UserField from "./UserField.svelte";
  import { getPenaltyName } from "@helpers/strings";
  import WcaCategory from "./wca/WCACategory.svelte";

  interface SolveInfoProps {
    round: ROUND;
    solve: SOLVE;
  }

  let { round, solve }: SolveInfoProps = $props();
</script>

<div class="overflow-x-auto w-full">
  <table class="table">
    <tbody>
      <tr>
        <td>Categoría</td>
        <td>
          <div class="flex gap-2 items-center">
            <WcaCategory icon={round.category.scrambler} size="1.2rem" />
            {round.category.name}
          </div>
        </td></tr
      >
      <tr> <td>Tiempo</td> <td>{sTimer(solve, true)}</td></tr>
      <tr> <td>Ronda</td> <td>{round.round}</td></tr>
      <tr> <td>Usuario</td> <td><UserField user={round.contestant} /> </td></tr>
      {#if solve.reconstruction.trim()}
        <tr> <td>Reconstrucción</td> <td>{solve.reconstruction}</td></tr>
      {/if}
      {#if solve.penaltyType != PENALTY.NONE}
        <tr> <td>Penalización</td> <td>{getPenaltyName(solve.penaltyType)}</td></tr>
      {/if}
    </tbody>
  </table>
</div>
