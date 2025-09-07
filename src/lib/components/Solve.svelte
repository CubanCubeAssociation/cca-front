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
    reconstruction?: string;
    decimals?: boolean;
    suffix?: boolean;
  }

  let {
    time,
    tag,
    class: _cl,
    best,
    worst,
    reconstruction,
    decimals = true,
    suffix = false,
  }: ISolveProps = $props();
</script>

<span class={twMerge("flex relative justify-center indicator", _cl)} class:best class:worst>
  {timer(!time || time === "DNS" || time === "DNF" ? Infinity : +time, decimals, suffix)}

  {#if tag}
    <Award class="indicator-item mt-2" type={tag} />
  {/if}

  {#if reconstruction}
    <hr class="h-[.1rem] rounded-full animate-pulse bg-current border-0 w-full absolute bottom-0" />
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
