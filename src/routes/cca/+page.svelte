<script lang="ts">
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import { BoxIcon } from "lucide-svelte";
</script>

<LoadingLayout loading={false} error={false} altError={false} reloadFunction={() => {}}>
  {#snippet title()}
    <BoxIcon class="text-primary" /> CCA
  {/snippet}

  {#snippet content()}
    <span>La información de la CCA aún no está disponible.</span>
  {/snippet}
</LoadingLayout>
