<script lang="ts">
  import { onMount } from "svelte";
  import type { NotificationAction } from "@interfaces";
  import { NotificationService } from "@stores/notification.service";
  import { CCA_ICON } from "@constants";
  import { CircleXIcon } from "lucide-svelte";
  import { twMerge } from "tailwind-merge";

  interface NotificationProps {
    key?: string;
    timeout?: number;
    header?: string;
    text?: string;
    html?: string;
    icon?: any;
    fixed?: boolean;
    actions?: NotificationAction[];
  }

  let {
    key = "",
    timeout = 5000,
    header = "Header",
    text = "Text",
    html = "",
    icon = CCA_ICON,
    fixed = false,
    actions = [],
  }: NotificationProps = $props();

  let open = $state(true);
  let tm: any;
  let notService = NotificationService.getInstance();

  function close() {
    if (!open) return;

    if (!fixed) clearTimeout(tm);
    open = false;

    setTimeout(() => {
      notService.removeNotification(key);
    }, 100);
  }

  onMount(() => {
    // Avoid notifications that can't close and have no actions
    if (actions.length === 0) {
      fixed = false;
    }

    if (!fixed) {
      tm = setTimeout(close, timeout);
    }
  });
</script>

{#if open}
  <div class="alert">
    {#if !fixed}
      <button onclick={close} class="btn absolute top-0 right-0 ml-2 -mt-2 p-0 h-min rounded-full">
        <CircleXIcon />
      </button>
    {/if}

    {#if icon}
      <div class="avatar bg-base-100 rounded-full">
        <div class="w-10 rounded-full p-1">
          {#if typeof icon === "string"}
            <img src={icon} alt="" />
          {:else}
            {@const Icon = icon}
            <Icon size="1.2rem" />
          {/if}
        </div>
      </div>
    {/if}
    <div class="tx-text ms-3 text-sm font-normal">
      <span class="tx-text text-lg font-bold">{header}</span>
      <p class="mb-2 mt-2 text-sm font-normal whitespace-break-spaces">{text}</p>
      <div bind:innerHTML={html} contenteditable="false"></div>

      {#if (actions || []).length}
        <div class="mt-4 flex gap-2">
          {#each actions || [] as action}
            <button
              class={twMerge("btn", action.color || "btn-primary")}
              onclick={e => {
                action.callback(e);
                close();
              }}>{action.text}</button
            >
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .alert {
    width: min(25rem, calc(100vw - 3rem));
  }
</style>
