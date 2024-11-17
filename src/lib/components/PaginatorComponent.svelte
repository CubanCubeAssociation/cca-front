<script lang="ts">
  import type { Paginator } from "@classes/Paginator.svelte";
  import ChevronLeftIcon from "@icons/ChevronLeft.svelte";
  import ChevronRightIcon from "@icons/ChevronRight.svelte";
  import ChevronDoubleLeftIcon from "@icons/ChevronDoubleLeft.svelte";
  import ChevronDoubleRightIcon from "@icons/ChevronDoubleRight.svelte";

  let {
    pg,
    class: _cl,
    showNextPrev = true,
    showFirstLast = true,
    update = () => {},
  }: {
    pg: Paginator;
    class: string;
    showNextPrev?: boolean;
    showFirstLast?: boolean;
    update?: () => any;
  } = $props();

  function setPage(p: number) {
    if (p === -1) pg.nextPage();
    if (p === -2) pg.prevPage();
    if (p != -1 && p != -2) pg.setPage(p);
    update();
  }
</script>

<ul
  class={"no-grid mx-auto flex w-max justify-center gap-2 text-gray-400 " +
    (pg.pages > 1 ? "" : "hidden") +
    " " +
    _cl}
>
  {#if showFirstLast}
    <li class="paginator-item">
      <button onclick={() => setPage(1)}> <ChevronDoubleLeftIcon /> </button>
    </li>
  {/if}

  {#if showNextPrev}
    <li class="paginator-item">
      <button onclick={() => setPage(-2)}> <ChevronLeftIcon /> </button>
    </li>
  {/if}

  {#each pg.labels as lb}
    <li class="paginator-item" class:selected={pg.page === lb} data-page={pg.page} data-lb={lb}>
      <button onclick={() => setPage(lb)}>{lb}</button>
    </li>
  {/each}

  {#if showNextPrev}
    <li class="paginator-item">
      <button onclick={() => setPage(-1)}> <ChevronRightIcon /> </button>
    </li>
  {/if}

  {#if showFirstLast}
    <li class="paginator-item">
      <button onclick={() => setPage(Infinity)}> <ChevronDoubleRightIcon /> </button>
    </li>
  {/if}
</ul>

<style lang="postcss">
  .paginator-item {
    @apply rounded-md;
  }

  .paginator-item button {
    @apply grid h-8 w-8 cursor-pointer select-none place-items-center rounded-md bg-violet-400 bg-opacity-30 shadow-md transition-all duration-300 hover:bg-opacity-40 hover:text-gray-300;
  }

  .paginator-item.selected button {
    @apply bg-violet-500 bg-opacity-60 text-gray-200 hover:bg-opacity-50;
  }
</style>
