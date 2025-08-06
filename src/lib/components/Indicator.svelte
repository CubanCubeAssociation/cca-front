<script lang="ts">
  import { twMerge } from "tailwind-merge";

  let { color } = $props();
</script>

<span class={twMerge("indicator-item status", color)}></span>
