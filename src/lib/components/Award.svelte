<script lang="ts">
  import { AwardIcon, TrophyIcon } from "lucide-svelte";
  import { twMerge } from "tailwind-merge";

  type AwardType =
    | "neutral"
    | "gold"
    | "silver"
    | "bronze"
    | "NR"
    | "ANR"
    | "PR"
    | "APR"
    | "PB"
    | "";

  interface AwardProps {
    type?: AwardType | (string & {});
    variant?: "medal" | "trophy";
    size?: number;
    class?: string;
  }

  let { type = "neutral", variant = "medal", size = 1, class: _cl }: AwardProps = $props();
</script>

<div class={twMerge(_cl, "relative flex justify-center")}>
  {#if type === "neutral"}
    <TrophyIcon
      class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
      size={0.8 * size + "rem"}
    />
  {:else if type === "gold"}
    {@const Icon = variant === "medal" ? AwardIcon : TrophyIcon}
    <div class="tooltip tooltip-right" data-tip="Primer lugar">
      <Icon
        class="transition-all duration-200 text-[#fe0] drop-shadow-[0_0_1px_#0006]"
        size={1.2 * size + "rem"}
      />
    </div>
  {:else if type === "silver"}
    {@const Icon = variant === "medal" ? AwardIcon : TrophyIcon}
    <div class="tooltip tooltip-right" data-tip="Segundo lugar">
      <Icon
        class="transition-all duration-200 text-white drop-shadow-[0_0_1px_#0006]"
        size={1.1 * size + "rem"}
      />
    </div>
  {:else if type === "bronze"}
    {@const Icon = variant === "medal" ? AwardIcon : TrophyIcon}
    <div class="tooltip tooltip-right" data-tip="Tercer lugar">
      <Icon
        class="transition-all duration-200 text-[#dc794a] drop-shadow-[0_0_1px_#0006]"
        size={1 * size + "rem"}
      />
    </div>
  {:else if type === "NR"}
    <div class="tooltip tooltip-right" data-tip="Récord Nacional">
      <TrophyIcon
        class="transition-all duration-200 text-purple-400 absolute -top-1 -right-1 translate-x-full"
        size={0.8 * size + "rem"}
      />
    </div>
  {:else if type === "PR"}
    <div class="tooltip tooltip-right" data-tip="Récord Provincial">
      <TrophyIcon
        class="transition-all duration-200 text-green-400 absolute -top-1 -right-1 translate-x-full"
        size={0.8 * size + "rem"}
      />
    </div>
  {:else if type === "PB"}
    <div class="tooltip tooltip-right" data-tip="Récord Personal">
      <TrophyIcon
        class="transition-all duration-200 text-orange-400 absolute -top-1 -right-1 translate-x-full"
        size={0.8 * size + "rem"}
      />
    </div>
  {/if}
</div>
