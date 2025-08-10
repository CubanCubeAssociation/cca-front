<script lang="ts">
  import type { Paginator } from "@classes/Paginator.svelte";
  import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
  } from "lucide-svelte";

  interface PageComponentProps {
    pg: Paginator;
    class?: string;
    showNextPrev?: boolean;
    showFirstLast?: boolean;
    update?: () => any;
  }

  let {
    class: _cl = "",
    pg = $bindable(),
    showNextPrev = true,
    showFirstLast = true,
    update = () => {},
  }: PageComponentProps = $props();

  function setPage(p: number) {
    if (p === -1) pg.nextPage();
    if (p === -2) pg.prevPage();
    if (p != -1 && p != -2) pg.setPage(p);
    update();
    pg = pg;
  }
</script>

<ul
  class={"no-grid mx-auto flex w-max justify-center gap-2 text-gray-400 " +
    (pg.pages > 1 ? "" : "hidden") +
    " " +
    _cl}
>
  {#if showFirstLast}
    <li class="paginator-item paginator-operator">
      <button disabled={pg.page === 1} onclick={() => setPage(1)}>
        <ChevronsLeftIcon size="1rem" />
      </button>
    </li>
  {/if}

  {#if showNextPrev}
    <li class="paginator-item paginator-operator">
      <button disabled={pg.page === 1} onclick={() => setPage(-2)}>
        <ChevronLeftIcon size="1rem" />
      </button>
    </li>
  {/if}

  {#each pg.labels as lb}
    <li class="paginator-item" class:selected={pg.page === lb} data-page={pg.page} data-lb={lb}>
      <button onclick={() => setPage(lb)}>{lb}</button>
    </li>
  {/each}

  {#if showNextPrev}
    <li class="paginator-item paginator-operator">
      <button disabled={pg.page === pg.pages} onclick={() => setPage(-1)}>
        <ChevronRightIcon size="1rem" />
      </button>
    </li>
  {/if}

  {#if showFirstLast}
    <li class="paginator-item paginator-operator">
      <button disabled={pg.page === pg.pages} onclick={() => setPage(Infinity)}>
        <ChevronsRightIcon size="1rem" />
      </button>
    </li>
  {/if}
</ul>

<style lang="postcss">
  @reference "../../app.css";
  @reference "tailwindcss";

  .paginator-item {
    @apply rounded-md;
  }

  .paginator-item button {
    @apply btn btn-secondary w-8 h-8 p-0;
  }

  .paginator-item.selected button {
    @apply btn-primary;
  }
</style>
