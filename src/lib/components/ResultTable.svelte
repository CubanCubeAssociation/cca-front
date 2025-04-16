<script lang="ts">
  import Award from "./Award.svelte";
  import { minRole } from "@helpers/auth";
  import { actualTime, sTimer, timer } from "@helpers/timer";
  import type { ROUND } from "@interfaces";
  import { userStore } from "@stores/user";
  import UserField from "./UserField.svelte";

  interface IResultTableProps {
    allowEdit?: boolean;
    rounds: ROUND[];
    category: ROUND;
    edit?: (round: ROUND) => void;
  }

  let { allowEdit = false, rounds, category, edit }: IResultTableProps = $props();

  const rndKeys = ["t1", "t2", "t3", "t4", "t5"] as const;

  function isPos(round: ROUND, i: number, pos: number) {
    let vals = [round.t1, round.t2, round.t3, round.t4, round.t5].map((s, p) => [actualTime(s), p]);
    vals.sort((a, b) => (a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]));
    return vals[pos][1] === i;
  }

  function isMo3(rounds: ROUND[]) {
    return ["666wca", "777wca"].indexOf(rounds[0].category.scrambler) > -1;
  }

  function editRound(rnd: ROUND) {
    rnd.id = rnd.category.id + rnd.round + rnd.contestant.id;
    if (edit) {
      edit(rnd);
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="table table-zebra">
    <!-- head -->
    <thead>
      <tr>
        <th class="text-center">No.</th>
        <th class="text-center">Nombre</th>
        <th class="text-center">T1</th>
        <th class="text-center">T2</th>
        <th class="text-center">T3</th>

        {#if ["666wca", "777wca"].indexOf(category.category.scrambler) > -1}
          <th class="text-center text-primary-400">Mo3</th>
        {:else}
          <th class="text-center">T4</th>
          <th class="text-center">T5</th>
          <th class="text-center text-primary-400">Ao5</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each rounds as rnd, p}
        <tr class="bg-white/5! border-t-gray-600!">
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

          {#if minRole($userStore, "admin")}
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

          {#each rndKeys as tp, p}
            {#if p < 3 || !isMo3(rounds)}
              <td>
                <span
                  class="flex justify-center"
                  class:best={isPos(rnd, p, 0)}
                  class:worst={isPos(rnd, p, isMo3(rounds) ? 2 : 4)}
                >
                  {sTimer(rnd[tp], true)}
                </span>
              </td>
            {/if}
          {/each}

          <td>
            <span class="flex justify-center dark:text-primary-400 text-primary-600">
              {timer(rnd.average, true)}
            </span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="postcss">
  @reference "../../app.css";

  .best {
    @apply text-green-500;
  }

  .worst {
    @apply text-red-500;
  }
</style>
