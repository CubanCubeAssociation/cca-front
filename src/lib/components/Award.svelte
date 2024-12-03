<script lang="ts">
  import { Tooltip } from "flowbite-svelte";
  import RecordIcon from "@icons/Trophy.svelte";
  import PlaceIcon from "@icons/Medal.svelte";

  type AwardType = "neutral" | "gold" | "silver" | "bronze" | "NR" | "ANR" | "PR" | "APR";

  export let type: AwardType = "neutral";
  export let variant: "medal" | "trophy" = "medal";
  export let size = 1;
</script>

<div class="relative flex justify-center">
  {#if type === "neutral"}
    <RecordIcon
      class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
      size={0.8 * size + "rem"}
    />
  {:else if type === "gold"}
    <svelte:component
      this={variant === "medal" ? PlaceIcon : RecordIcon}
      class="transition-all duration-200 text-[#fe0] drop-shadow-[0_0_1px_#0006] dark:text-yellow-300"
      size={1.2 * size + "rem"}
    />
    <Tooltip>Primer lugar</Tooltip>
  {:else if type === "silver"}
    <svelte:component
      this={variant === "medal" ? PlaceIcon : RecordIcon}
      class="transition-all duration-200 text-white drop-shadow-[0_0_1px_#0006] dark:text-zinc-200"
      size={1.1 * size + "rem"}
    />
    <Tooltip>Segundo lugar</Tooltip>
  {:else if type === "bronze"}
    <svelte:component
      this={variant === "medal" ? PlaceIcon : RecordIcon}
      class="transition-all duration-200 text-[#dc794a] drop-shadow-[0_0_1px_#0006] dark:text-orange-400"
      size={1 * size + "rem"}
    />
    <Tooltip>Tercer lugar</Tooltip>
  {:else if type === "NR"}
    <RecordIcon
      class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
      size={0.8 * size + "rem"}
    />
    <Tooltip>Récord Nacional</Tooltip>
  {:else if type === "PR"}
    <RecordIcon
      class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
      size={0.8 * size + "rem"}
    />
    <Tooltip>Récord Provincial</Tooltip>
  {/if}
</div>
