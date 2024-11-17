<script lang="ts">
  import type { Scrambler } from "@interfaces";
  import I222 from "./I222.svelte";
  import I333 from "./I333.svelte";
  import I333fm from "./I333fm.svelte";
  import I333mbf from "./I333mbf.svelte";
  import I333ni from "./I333ni.svelte";
  import I333oh from "./I333oh.svelte";
  import I444bld from "./I444bld.svelte";
  import I444wca from "./I444wca.svelte";
  import I555bld from "./I555bld.svelte";
  import I555wca from "./I555wca.svelte";
  import I666wca from "./I666wca.svelte";
  import I777wca from "./I777wca.svelte";
  import Iclkwca from "./Iclkwca.svelte";
  import Imgmp from "./Imgmp.svelte";
  import Ipyrso from "./Ipyrso.svelte";
  import Iskbso from "./Iskbso.svelte";
  import Isqrs from "./Isqrs.svelte";

  export let icon: Scrambler | "" = "333";
  export let size = "2rem";
  export let selected = false;
  export let width = size;
  export let height = size;
  export let color = "currentColor";
  export let ariaLabel = "";
  export let ariaHidden = false;
  export let title = "";
  export let desc = "";
  export let buttonClass = "";
  export let noFallback = false;

  let cl = "";
  export { cl as class };

  let iconMap = {
    "222so": I222,
    "333": I333,
    "333fm": I333fm,
    "333ni": I333mbf,
    "333mbf": I333ni,
    "333oh": I333oh,
    "444bld": I444bld,
    "444wca": I444wca,
    "555wca": I555wca,
    "555bld": I555bld,
    "666wca": I666wca,
    "777wca": I777wca,
    clkwca: Iclkwca,
    mgmp: Imgmp,
    pyrso: Ipyrso,
    skbso: Iskbso,
    sqrs: Isqrs,
  } as any;
</script>

<div class={"container " + buttonClass} class:selected>
  {#if icon in iconMap}
    <svelte:component
      this={iconMap[icon]}
      {size}
      {width}
      {height}
      {color}
      {ariaLabel}
      {ariaHidden}
      {title}
      {desc}
      class={cl}
    />
  {:else if !noFallback}
    <I333 {size} {width} {height} {color} {ariaLabel} {ariaHidden} {title} {desc} class={cl} />
  {/if}
</div>

<style lang="postcss">
  .container {
    @apply rounded-md p-1 grid place-items-center w-fit cursor-default;
  }

  .selected {
    @apply bg-primary-800 text-white;
  }
</style>
