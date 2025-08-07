<script lang="ts">
  import type { CONTEST_CATEGORY, FORMAT, ROUND } from "@interfaces";
  import WcaCategory from "./wca/WCACategory.svelte";

  import ResultTable from "./ResultTable.svelte";
  import { page } from "$app/state";
  import { weakRandomUUID } from "@helpers/strings";

  interface IResultViewProps {
    roundGroup: ROUND[][][];
    formats: FORMAT[];
    categories: CONTEST_CATEGORY[];
    allowEdit?: boolean;
    edit?: (round: ROUND) => void;
  }

  let {
    roundGroup = $bindable(),
    formats,
    categories,
    allowEdit = false,
    edit,
  }: IResultViewProps = $props();

  let activeCategory = $state("");
  let id = weakRandomUUID();
  let lastOpened = $state("");

  $effect(() => {
    activeCategory = page.url.searchParams.get("category") || "";
  });
</script>

<div class="grid gap-2">
  {#if !roundGroup.length}
    <div class="flex justify-center items-center w-full h-full">
      <p class="text-gray-500">No hay resultados disponibles</p>
    </div>
  {/if}

  {#each roundGroup as group}
    {@const round = group.flat ? group.flat()[0] : group.reduce((acc, e) => [...acc, ...e], [])[0]}

    <div class="collapse collapse-arrow bg-base-100 border" data-category={round.category.name}>
      <input
        class="[&:checked+div]:text-success w-full"
        type="radio"
        name={id}
        value={round.category.name}
        checked={activeCategory === round.category.name}
        onclick={ev => {
          if (lastOpened === round.category.name) {
            (ev.target as any).checked = false;
            lastOpened = "";
          } else {
            lastOpened = round.category.name;
          }
        }}
      />
      <div class="collapse-title font-semibold absolute flex items-center gap-2">
        <WcaCategory icon={round.category.scrambler} size="1.5rem" />
        {round.category.name}
      </div>
      <div class="collapse-content text-sm grid">
        {#each group as rounds, p}
          {#if group.length > 1}
            <h5 class="flex items-center gap-2 mb-4 pt-4 justify-center">
              Ronda {rounds[0].round}
            </h5>
          {/if}

          <ResultTable
            bind:rounds={group[p]}
            {round}
            {formats}
            {categories}
            {allowEdit}
            edit={rnd => edit?.(rnd)}
          />
        {/each}
      </div>
    </div>
  {/each}
</div>
