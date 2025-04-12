<script lang="ts">
  import { Avatar, Tooltip } from "flowbite-svelte";
  import type { USER } from "@interfaces";
  import RootIcon from "@icons/ShieldCrownOutline.svelte";
  import AdminIcon from "@icons/ShieldAccount.svelte";
  import DelegateIcon from "@icons/Shield.svelte";
  import { getAvatarRoute } from "@helpers/API";

  type USER_LIKE = Pick<USER, "name" | "role" | "username"> & { avatar?: string };

  const {
    user,
    class: cl = "",
    showAvatar = false,
    link = false,
    onclick = () => {},
  }: {
    user: USER_LIKE;
    class?: string;
    showAvatar?: boolean;
    link?: boolean;
    onclick?: (ev: MouseEvent) => void;
  } = $props();
</script>

<span
  class={"flex gap-2 items-center w-max " + cl}
  {onclick}
  role="button"
  tabindex="0"
  onkeydown={() => {}}
>
  {#if showAvatar}
    <Avatar
      border
      src={getAvatarRoute(user.username || "")}
      class={"p-0 " +
        (user.role === "root"
          ? "!ring-purple-500 dark:!ring-purple-400"
          : user.role === "admin"
            ? "!ring-primary-500 dark:!ring-primary-400"
            : user.role === "delegate"
              ? "!ring-green-500 dark:!ring-green-400"
              : "")}
    />
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
    <Tooltip class="!text-purple-200">Superadmin</Tooltip>
  {:else if user.role === "admin"}
    <AdminIcon size="1.1rem" class="text-primary-500 dark:text-primary-400" />
    <Tooltip class="!text-blue-200">Administrador</Tooltip>
  {:else if user.role === "delegate"}
    <DelegateIcon class="text-green-500 dark:text-green-400" />
    <Tooltip class="!text-green-200">Delegado</Tooltip>
  {/if}
</span>
