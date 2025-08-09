<script lang="ts">
  import { RefreshCcw } from "lucide-svelte";
  import { twMerge } from "tailwind-merge";

  interface ILoadingLayout {
    content: any;
    loading: boolean;
    error: boolean;
    title?: any;
    errorContent?: any;
    altError?: boolean;
    altErrorContent?: any;
    class?: string;
    reloadFunction?: (...args: any[]) => any;
  }

  let {
    content,
    title,
    errorContent,
    altError,
    altErrorContent,
    loading,
    error,
    class: _cl,
    reloadFunction,
  }: ILoadingLayout = $props();
</script>

{#snippet defaultError()}
  <span class="text-center text-error">
    Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
  </span>

  <button class="btn btn-primary mt-2" onclick={reloadFunction || (() => window.location.reload())}>
    <RefreshCcw size="1.2rem" />
    Recargar
  </button>
{/snippet}

<div class={twMerge("card max-w-4xl mx-auto mb-8 mt-4", _cl)}>
  {#if title}
    <h1 class="flex items-center justify-center gap-1 text-center text-2xl">
      {@render title()}
    </h1>
  {/if}
  {#if loading}
    <span class="loading loading-spinner loading-lg mx-auto mb-4"></span>
  {:else if error}
    {#if errorContent}
      {@render errorContent()}
    {:else}
      {@render defaultError()}
    {/if}
  {:else if altError}
    {#if altErrorContent}
      {@render altErrorContent()}
    {:else}
      {@render defaultError()}
    {/if}
  {:else}
    {@render content()}
  {/if}
</div>
