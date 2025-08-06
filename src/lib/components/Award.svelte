<script lang="ts">
  import RecordIcon from "@icons/Trophy.svelte";
  import PlaceIcon from "@icons/Medal.svelte";

  type AwardType = "neutral" | "gold" | "silver" | "bronze" | "NR" | "ANR" | "PR" | "APR";

  interface AwardProps {
    type?: AwardType;
    variant?: "medal" | "trophy";
    size?: number;
  }

  let { type = "neutral", variant = "medal", size = 1 }: AwardProps = $props();
</script>

<div class="relative flex justify-center">
  {#if type === "neutral"}
    <RecordIcon
      class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
      size={0.8 * size + "rem"}
    />
  {:else if type === "gold"}
    {@const Icon = variant === "medal" ? PlaceIcon : RecordIcon}
    <div class="tooltip" data-tip="Primer lugar">
      <Icon
        class="transition-all duration-200 text-[#fe0] drop-shadow-[0_0_1px_#0006] dark:text-yellow-300"
        size={1.2 * size + "rem"}
      />
    </div>
  {:else if type === "silver"}
    {@const Icon = variant === "medal" ? PlaceIcon : RecordIcon}
    <div class="tooltip" data-tip="Segundo lugar">
      <Icon
        class="transition-all duration-200 text-white drop-shadow-[0_0_1px_#0006] dark:text-zinc-200"
        size={1.1 * size + "rem"}
      />
    </div>
  {:else if type === "bronze"}
    {@const Icon = variant === "medal" ? PlaceIcon : RecordIcon}
    <div class="tooltip" data-tip="Tercer lugar">
      <Icon
        class="transition-all duration-200 text-[#dc794a] drop-shadow-[0_0_1px_#0006] dark:text-orange-400"
        size={1 * size + "rem"}
      />
    </div>
  {:else if type === "NR"}
    <div class="tooltip" data-tip="Récord Nacional">
      <RecordIcon
        class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
        size={0.8 * size + "rem"}
      />
    </div>
  {:else if type === "PR"}
    <div class="tooltip" data-tip="Récord Provincial">
      <RecordIcon
        class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
        size={0.8 * size + "rem"}
      />
    </div>
  {/if}
</div>
