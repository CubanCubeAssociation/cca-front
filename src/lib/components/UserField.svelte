<script lang="ts">
  import type { USER } from "@interfaces";
  import RootIcon from "@icons/ShieldCrownOutline.svelte";
  import AdminIcon from "@icons/ShieldAccount.svelte";
  import DelegateIcon from "@icons/Shield.svelte";
  import Avatar from "./Avatar.svelte";

  // type USER_LIKE = Pick<USER, "name" | "role" | "username"> & { avatar?: string };

  interface IUserFieldProps {
    user: any;
    class?: string;
    showAvatar?: boolean;
    link?: boolean;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    user,
    class: cl = "",
    showAvatar = false,
    link = false,
    onclick,
  }: IUserFieldProps = $props();
</script>

<span
  class={"flex gap-2 items-center w-max " + cl}
  role="button"
  tabindex="0"
  {onclick}
  onkeydown={() => {}}
>
  {#if showAvatar}
    <Avatar {user} />
  {/if}

  {#if link}
    <a href={`/people/${user.username}`} class="hover:text-primary-300">
      {user.name}
    </a>
  {:else}
    {user.name}
  {/if}

  {#if user.role === "root"}
    <RootIcon size="1.1rem" class="text-purple-500 dark:text-purple-400" />
    <!-- <Tooltip class="text-purple-200!">Superadmin</Tooltip> -->
  {:else if user.role === "admin"}
    <AdminIcon size="1.1rem" class="text-primary-500 dark:text-primary-400" />
    <!-- <Tooltip class="text-blue-200!">Administrador</Tooltip> -->
  {:else if user.role === "delegate"}
    <DelegateIcon class="text-green-500 dark:text-green-400" />
    <!-- <Tooltip class="text-green-200!">Delegado</Tooltip> -->
  {/if}
</span>
