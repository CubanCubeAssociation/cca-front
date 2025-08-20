<script lang="ts">
  import Award from "./Award.svelte";
  import { minRole } from "@helpers/auth";
  import { actualTime, sTimer, timer } from "@helpers/timer";
  import {
    PENALTY,
    type CONTEST,
    type CONTEST_CATEGORY,
    type FORMAT,
    type ROUND,
  } from "@interfaces";
  import { userStore } from "@stores/user";
  import UserField from "./UserField.svelte";
  import { page } from "$app/state";
  import SolveInfo from "./SolveInfo.svelte";
  import { createEmptyRound, createEmptySolve, preventDefault } from "@helpers/object";
  import Modal from "./Modal.svelte";
  import { onMount } from "svelte";
  import { weakRandomUUID } from "@helpers/strings";
  import { isFinite } from "@helpers/math";
  import Solve from "./Solve.svelte";

  interface IResultTableProps {
    rounds: ROUND[];
    formats: FORMAT[];
    categories: CONTEST_CATEGORY[];
    round: ROUND;
    contest: CONTEST;
    allowEdit?: boolean;
    edit?: (round: ROUND) => void;
  }

  let {
    rounds = $bindable(),
    formats,
    categories,
    round,
    contest,
    allowEdit = false,
    edit,
  }: IResultTableProps = $props();

  const rndKeys = ["t1", "t2", "t3", "t4", "t5"] as const;
  const RESULT_TABLE_ID = "s" + weakRandomUUID().replace(/-/g, "");
  let categoryInfo: CONTEST_CATEGORY = categories[0];
  let format: FORMAT = $state(formats[0]);
  let selectedRound = $state(createEmptyRound());
  let selectedSolve = $state(createEmptySolve());
  let showSolveInfoModal = $state(false);

  function isPos(round: ROUND, i: number, pos: number) {
    let vals = [round.t1, round.t2, round.t3, round.t4, round.t5]
      .slice(0, format.amount)
      .map((s, p) => [actualTime(s), p]);
    vals.sort((a, b) => (a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]));
    return vals[pos][1] === i;
  }

  function editRound(rnd: ROUND) {
    rnd.id = rnd.category.id + rnd.round + rnd.contestant.id;
    if (edit) {
      edit(rnd);
    }
  }

  $effect(() => {
    categoryInfo = categories.find(ct => ct.category.id === round.category.id) || categories[0];
    format = formats.find(f => f.name === categoryInfo?.format) || formats[0];
  });

  onMount(() => {
    let urlTime = "";
    let urlUsername = "";
    let urlCategory = "";
    let urlType = "single";

    page.url.searchParams.forEach((value, key) => {
      if (key === "time") {
        urlTime = value;
      } else if (key === "username") {
        urlUsername = value;
      } else if (key === "category") {
        urlCategory = value;
      } else if (key === "type") {
        urlType = value === "avg" ? "avg" : "single";
      }
    });

    let elem = document.querySelector(
      `#${RESULT_TABLE_ID} td[data-user="${urlUsername}"][data-time="${urlTime}"][data-category="${urlCategory}"][data-type="${urlType}"]`
    ) as HTMLTableCellElement | null;

    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        console.log("ELEM: ", elem);
        elem.classList.add("highlighted");
        setTimeout(() => elem.classList.remove("highlighted"), 2000);
      }, 700);
    }
  });
</script>

<div
  id={RESULT_TABLE_ID}
  class="overflow-x-auto result-table max-w-full rounded-lg border border-base-content/10"
>
  <table class="table table-zebra">
    <!-- head -->
    <thead>
      <tr>
        <th class="text-center">No.</th>
        <th class="text-center">Nombre</th>

        {#each [1, 2, 3, 4, 5].slice(0, format.amount) as n}
          <th class="text-center">T{n}</th>
        {/each}

        <th class="text-center">{format.name}</th>
      </tr>
    </thead>
    <tbody>
      {#each rounds as rnd, p}
        <tr>
          <td>
            {#if p === 0}
              <Award type="gold" />
            {:else if p === 1}
              <Award type="silver" />
            {:else if p === 2}
              <Award type="bronze" />
            {:else}
              <span class="flex justify-center">{p + 1}</span>
            {/if}
          </td>

          {#if minRole($userStore, "admin") && allowEdit}
            <td>
              <UserField
                class={allowEdit ? "cursor-pointer hover:text-yellow-300" : ""}
                user={rnd.contestant}
                onclick={ev => {
                  ev.stopPropagation();
                  editRound(rnd);
                }}
              />
            </td>
          {:else}
            <td>
              <UserField user={rnd.contestant} link />
            </td>
          {/if}

          {#each rndKeys.slice(0, format.amount) as tp, p}
            <td
              data-user={rnd.contestant.username}
              data-time={rnd[tp].timeMillis}
              data-category={round.category.name}
              data-type="single"
            >
              <button
                class="flex justify-center text-base-content cursor-help"
                onclick={preventDefault(() => {
                  selectedRound = rnd;
                  selectedSolve = rnd[tp];
                  showSolveInfoModal = true;
                })}
              >
                <Solve
                  time={rnd[tp].timeMillis}
                  tag={rnd[tp].tag}
                  best={isPos(rnd, p, 0)}
                  worst={isPos(rnd, p, format.amount - 1)}
                />
              </button>
            </td>
          {/each}

          <td
            data-user={rnd.contestant.username}
            data-time={rnd.average}
            data-category={round.category.name}
            data-type="avg"
          >
            <button
              class="flex justify-center text-base-content cursor-help"
              class:best={isPos(rnd, p, 0)}
              class:worst={isPos(rnd, p, format.amount - 1)}
              onclick={preventDefault(() => {
                selectedRound = rnd;
                selectedSolve = createEmptySolve();
                selectedSolve.time = isFinite(rnd.average) ? rnd.average / 10 + "" : "DNF";
                selectedSolve.timeMillis = isFinite(rnd.average) ? rnd.average + "" : "DNF";
                selectedSolve.penaltyType = isFinite(rnd.average) ? PENALTY.NONE : PENALTY.DNF;
                selectedSolve.isAverage = true;
                showSolveInfoModal = true;
              })}
            >
              {timer(rnd.average, true)}
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<Modal bind:show={showSolveInfoModal}>
  <SolveInfo round={selectedRound} solve={selectedSolve} {contest} />
</Modal>

<style lang="postcss">
  @reference "../../app.css";

  .best {
    @apply text-green-400;
  }

  .worst {
    @apply text-red-400;
  }

  .result-table span,
  .result-table button {
    @apply transition-all duration-200;
  }

  .result-table :global(.highlighted span),
  .result-table :global(.highlighted button) {
    @apply outline outline-primary bg-black/50 py-2 px-2 -mx-2 -my-2 rounded-lg grid place-items-center;
  }
</style>
