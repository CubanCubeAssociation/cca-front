<script lang="ts">
  import { PENALTY, type CONTEST, type ROUND, type SOLVE } from "@interfaces";
  import UserField from "./UserField.svelte";
  import { getPenaltyName, getTagDescription } from "@helpers/strings";
  import WcaCategory from "./wca/WCACategory.svelte";
  import moment from "moment";
  import Reconstructor from "./Reconstructor.svelte";
  import { CheckIcon, CopyIcon, ExternalLink, SaveIcon, ShareIcon } from "lucide-svelte";
  import { contestNameToLink } from "@helpers/routing";
  import { DOMAIN } from "@helpers/API";
  import Solve from "./Solve.svelte";
  import { preventDefault } from "@helpers/object";
  import { pGenerateCubeBundle } from "@helpers/cube-draw";
  import { Puzzle } from "@classes/puzzle/puzzle";
  import { options } from "@constants";
  import PuzzleImage from "./PuzzleImage.svelte";

  interface SolveInfoProps {
    round: ROUND;
    solve: SOLVE;
    contest: CONTEST;
    allowEdit: boolean;
    key: "t1" | "t2" | "t3" | "t4" | "t5" | null;
    onreconstruction?: (round: ROUND, key: any, reconstruction: string) => any;
  }

  let { round, solve, contest, key, allowEdit, onreconstruction }: SolveInfoProps = $props();

  let copied = $state(false);
  let reconstruction = $state("");
  let contestCategory = $derived(
    contest.categories.find(cct => cct.category.id === round.category.id)
  );
  let scramble = $derived(
    contestCategory?.scrambles[
      contestCategory.amount * (round.round - 1) + parseInt(key?.slice(1) || "") - 1
    ]
  );

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

  function saveReconstruction() {
    onreconstruction?.(round, key, reconstruction);
    reconstruction = "";
  }

  async function getImage(s: string) {
    let op = options.get(round.category.scrambler);

    if (!Array.isArray(op)) {
      return pGenerateCubeBundle([Puzzle.fromSequence(s, op || { type: "rubik" })]);
    }

    return [""];
  }

  $effect(() => (reconstruction = solve.reconstruction) as any);
</script>

<div class="overflow-x-auto w-full rounded-lg border border-base-content/10">
  <h3 class="[display:inherit] text-center text-lg">
    <UserField user={round.contestant} class="!contents" />
    <Solve
      time={solve.timeMillis}
      tag=""
      suffix
      class={"contents " + (solve.isAverage ? "text-purple-500" : "text-green-500")}
    />
    {#if solve.tag}
      <br />
      <span class="text-info contents">({getTagDescription(solve.tag)})</span>
    {/if}
  </h3>

  <table class="table">
    <tbody>
      <tr>
        <td>Categoría</td>
        <td>
          <div class="flex gap-2 items-center">
            <WcaCategory icon={round.category.scrambler} size="1.2rem" />
            {round.category.name}
            <span class="text-info contents">(Ronda {round.round})</span>
          </div>
        </td></tr
      >

      <tr>
        <td>Competencia</td>
        <td>
          {contest.name}
          <span class="text-info contents">({moment(contest.date).format("DD/MM/YYYY")})</span>
        </td></tr
      >

      {#if solve.penaltyType != PENALTY.NONE}
        <tr> <td>Penalización</td> <td>{getPenaltyName(solve.penaltyType)}</td></tr>
      {/if}

      {#if !solve.isAverage}
        <tr>
          <td>Mezcla</td>
          <td>{scramble}</td>
        </tr>
        <tr>
          <td colspan="2">
            {#await getImage(scramble || "") then res}
              <PuzzleImage src={res[0]} class="max-h-40" />
            {/await}
          </td>
        </tr>
      {/if}

      {#if solve.reconstruction || allowEdit}
        <tr>
          <td colspan="2">
            <span class="flex w-full justify-center">Reconstrucción</span>
            {#if allowEdit}
              <textarea
                bind:value={reconstruction}
                rows={4}
                class="textarea resize-y w-full"
                placeholder="Reconstrucción"
              ></textarea>
            {:else}
              <Reconstructor
                reconstruction={solve.reconstruction}
                scrambler={round.category.scrambler}
              />
            {/if}
          </td>
        </tr>
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
    <button class="btn btn-ghost" onclick={preventDefault(copyLink)}>
      {#if copied}
        <CheckIcon class="text-success" size="1.2rem" />
        Copiado
      {:else}
        <CopyIcon size="1.2rem" />
        Copiar Link
      {/if}
    </button>
  {/if}

  {#if solve.reconstruction}
    <button
      class="btn btn-secondary btn-soft"
      onclick={preventDefault(() => {
        let opts = options.get(round.category.scrambler) || { type: "rubik", order: 3 };
        let opt = Array.isArray(opts) ? opts[0] : opts;

        open(
          `https://cubicdb.netlify.app/reconstructions?puzzle=${opt.type}&order=${
            opt.order || -1
          }&scramble=${encodeURI((scramble || "").replace(/ /g, "_"))}&reconstruction=${encodeURI(
            solve.reconstruction.replace(/ /g, "_")
          )}`,
          "_blank"
        );
      })}
    >
      <ExternalLink size="1.2rem" /> Ver en CubicDB
    </button>
  {/if}

  {#if allowEdit}
    <button class="btn btn-primary" onclick={preventDefault(saveReconstruction)}>
      <SaveIcon size="1.2rem" />
      Guardar
    </button>
  {/if}
</div>
