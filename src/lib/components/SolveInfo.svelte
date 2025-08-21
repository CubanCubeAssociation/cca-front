<script lang="ts">
  import { sTimer } from "@helpers/timer";
  import { PENALTY, type CONTEST, type ROUND, type SOLVE } from "@interfaces";
  import UserField from "./UserField.svelte";
  import { getPenaltyName, getTagDescription } from "@helpers/strings";
  import WcaCategory from "./wca/WCACategory.svelte";
  import moment from "moment";
  import Reconstructor from "./Reconstructor.svelte";
  import { CheckIcon, CopyIcon, ShareIcon } from "lucide-svelte";
  import { contestNameToLink } from "@helpers/routing";
  import { DOMAIN } from "@helpers/API";
  import Solve from "./Solve.svelte";

  interface SolveInfoProps {
    round: ROUND;
    solve: SOLVE;
    contest: CONTEST;
  }

  let { round, solve, contest }: SolveInfoProps = $props();

  let copied = $state(false);

  function copyLink() {
    if (copied == true) return;

    navigator.clipboard
      .writeText(
        DOMAIN +
          contestNameToLink(contest.name, {
            category: round.category.name,
            time: solve.timeMillis,
            username: round.contestant.username,
            type: solve.isAverage ? "avg" : "single",
          })
      )
      .then(() => {
        copied = true;
        setTimeout(() => (copied = false), 2000);
      });
  }
</script>

<div class="overflow-x-auto w-full rounded-lg border border-base-content/10">
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
      <tr>
        <td>{solve.isAverage ? "Promedio" : "Tiempo"}</td>
        <td>
          <div class="flex items-center gap-2">
            <Solve time={solve.timeMillis} tag="" />
            {#if solve.tag}
              ({getTagDescription(solve.tag)})
            {/if}
          </div>
        </td></tr
      >
      <tr> <td>Ronda</td> <td>{round.round}</td></tr>
      <tr> <td>Usuario</td> <td><UserField user={round.contestant} /> </td></tr>
      <tr>
        <td>Competencia</td>
        <td>
          {contest.name}
        </td></tr
      >
      <tr> <td>Fecha</td> <td>{moment(contest.date).format("DD/MM/YYYY")}</td></tr>
      {#if solve.reconstruction}
        <tr>
          <td>Reconstrucción</td>
          <td>
            <Reconstructor
              reconstruction={solve.reconstruction}
              scrambler={round.category.scrambler}
            />
          </td>
        </tr>
      {/if}
      {#if solve.penaltyType != PENALTY.NONE}
        <tr> <td>Penalización</td> <td>{getPenaltyName(solve.penaltyType)}</td></tr>
      {/if}
    </tbody>
  </table>
</div>

<div class="flex items-center justify-center mt-2 gap-2">
  {#if navigator.canShare && navigator.canShare()}
    <button class="btn btn-primary">
      <ShareIcon size="1.2rem" />
      Compartir
    </button>
  {/if}

  {#if navigator.clipboard}
    <button class="btn btn-ghost" onclick={copyLink}>
      {#if copied}
        <CheckIcon class="text-success" size="1.2rem" />
        Copiado
      {:else}
        <CopyIcon size="1.2rem" />
        Copiar Link
      {/if}
    </button>
  {/if}
</div>
