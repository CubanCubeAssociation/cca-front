<script lang="ts">
  import { onMount } from "svelte";
  import type { NotificationAction } from "@interfaces";
  import { NotificationService } from "@stores/notification.service";
  import { Avatar, Button, Toast } from "flowbite-svelte";
  import { fly } from "svelte/transition";
  import { CCA_ICON } from "@constants";

  export let key: string = "";
  export let timeout = 5000;
  export let header = "Header";
  export let text = "Text";
  export let html = "";
  export let icon: any = CCA_ICON;
  export let fixed = false;
  export let actions: NotificationAction[] = [];

  let open = true;
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

<Toast
  transition={fly}
  params={{ x: 200 }}
  class="bg-backgroundLevel3 pointer-events-auto relative bottom-0 end-0 ml-auto mr-4 border border-[#fff1] shadow-lg"
  contentClass="flex items-center gap-4"
  bind:open
  dismissable={fixed}
  position="bottom-right"
  on:close={close}
>
  <svelte:fragment slot="icon">
    {#if icon}
      {#if typeof icon === "string"}
        <Avatar src={icon} class="bg-backgroundLevel1 tx-text aspect-square" />
      {:else}
        <svelte:component
          this={icon}
          size="1.2rem"
          class="bg-backgroundLevel1 tx-text aspect-square"
        />
      {/if}
    {/if}
  </svelte:fragment>

  <div class="tx-text ms-3 text-sm font-normal">
    <span class="tx-text text-lg font-semibold">{header}</span>
    <div class="mb-2 mt-2 text-sm font-normal">{text}</div>
    <div bind:innerHTML={html} contenteditable="false"></div>

    {#if (actions || []).length}
      <div class="mt-4 flex gap-2">
        {#each actions || [] as action}
          <Button
            color={action.color}
            on:click={e => {
              action.callback(e);
              close();
            }}>{action.text}</Button
          >
        {/each}
      </div>
    {/if}
  </div>
</Toast>
