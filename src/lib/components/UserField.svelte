<script lang="ts">
  import type { USER } from "@interfaces";
  import AdminIcon from "@icons/ShieldAccount.svelte";
  import DelegateIcon from "@icons/Shield.svelte";
  import { Tooltip } from "flowbite-svelte";

  type USER_LIKE = Pick<USER, "name" | "role">;

  const { user }: { user: USER_LIKE } = $props();
</script>

<span class="flex gap-2">
  {user.name}

  {#if user.role === "admin"}
    <AdminIcon size="1.1rem" class="text-primary-500 dark:text-primary-400" />
    <Tooltip class="!text-blue-200">Administrador</Tooltip>
  {:else if user.role === "delegate"}
    <DelegateIcon class="text-green-500 dark:text-green-400" />
    <Tooltip class="!text-green-200">Delegado</Tooltip>
  {/if}
</span>
