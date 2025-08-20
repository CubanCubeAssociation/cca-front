<script lang="ts">
  import { timer } from "@helpers/timer";
  import type { TAG } from "@interfaces";
  import { twMerge } from "tailwind-merge";
  import Award from "./Award.svelte";

  interface ISolveProps {
    time: number | string | null;
    tag: TAG;
    class?: string;
    best?: boolean;
    worst?: boolean;
  }

  let { time, tag, class: _cl, best, worst }: ISolveProps = $props();
</script>

<span class={twMerge("flex justify-center indicator", _cl)} class:best class:worst>
  {timer(!time || time === "DNS" || time === "DNF" ? Infinity : +time, true)}

  {#if tag}
    <Award class="indicator-item mt-2" type={tag} />
  {/if}
</span>

<style lang="postcss">
  @reference "tailwindcss";
  @reference "../../app.css";

  .best {
    @apply text-green-400;
  }

  .worst {
    @apply text-red-500;
  }
</style>
