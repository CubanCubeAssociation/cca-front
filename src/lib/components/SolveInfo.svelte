<script lang="ts">
  import { sTimer } from "@helpers/timer";
  import type { ROUND, SOLVE } from "@interfaces";
  import UserField from "./UserField.svelte";
  import { getPenaltyName } from "@helpers/strings";

  interface SolveInfoProps {
    round: ROUND;
    solve: SOLVE;
  }

  let { round, solve }: SolveInfoProps = $props();
</script>

<div>
  <div class="overflow-x-auto">
    <table class="table">
      <tbody>
        <tr> <td>Tiempo</td> <td>{sTimer(solve, true)}</td></tr>
        <tr> <td>Ronda</td> <td>{round.round}</td></tr>
        <tr> <td>Usuario</td> <td><UserField user={round.contestant} /> </td></tr>
        <tr> <td>Reconstrucción</td> <td>{solve.reconstruction}</td></tr>
        <tr> <td>Penalización</td> <td>{getPenaltyName(solve.penaltyType)}</td></tr>
      </tbody>
    </table>
  </div>
</div>
