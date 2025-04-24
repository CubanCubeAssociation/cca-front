<script lang="ts">
  import Award from "./Award.svelte";
  import { minRole } from "@helpers/auth";
  import { actualTime, sTimer, timer } from "@helpers/timer";
  import type { CONTEST_CATEGORY, FORMAT, ROUND } from "@interfaces";
  import { userStore } from "@stores/user";
  import UserField from "./UserField.svelte";

  interface IResultTableProps {
    rounds: ROUND[];
    formats: FORMAT[];
    categories: CONTEST_CATEGORY[];
    round: ROUND;
    allowEdit?: boolean;
    edit?: (round: ROUND) => void;
  }

  let { rounds, formats, categories, round, allowEdit = false, edit }: IResultTableProps = $props();

  const rndKeys = ["t1", "t2", "t3", "t4", "t5"] as const;
  let categoryInfo: CONTEST_CATEGORY = categories[0];
  let format: FORMAT = $state(formats[0]);

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
</script>

<div class="overflow-x-auto">
  <table class="table table-zebra">
    <!-- head -->
    <thead>
      <tr>
        <th class="text-center">No.</th>
        <th class="text-center">Nombre</th>

        {#each [1, 2, 3, 4, 5].slice(0, format.amount) as n}
          <th class="text-center">T{n}</th>
        {/each}

        <th class="text-center text-primary-400">{format.name}</th>
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

          {#each rndKeys.slice(0, format.amount) as tp, p}
            <td>
              <span
                class="flex justify-center"
                class:best={isPos(rnd, p, 0)}
                class:worst={isPos(rnd, p, format.amount - 1)}
              >
                {sTimer(rnd[tp], true)}
              </span>
            </td>
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
