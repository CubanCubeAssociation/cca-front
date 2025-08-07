<script lang="ts">
  import RootIcon from "@icons/ShieldCrownOutline.svelte";
  import AdminIcon from "@icons/ShieldAccount.svelte";
  import DelegateIcon from "@icons/Shield.svelte";
  import Avatar from "./Avatar.svelte";

  interface IUserFieldProps {
    user: any;
    class?: string;
    showAvatar?: boolean;
    fullName?: boolean;
    link?: boolean;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    user,
    class: cl = "",
    showAvatar = false,
    link = false,
    fullName = false,
    onclick,
  }: IUserFieldProps = $props();

  let displayName = $state("");

  $effect(() => {
    if (fullName) {
      displayName = user.name;
    } else {
      let parts: string[] = (user.name || "").trim().split(" ");
      let res: string[][] = [[]];

      for (let i = 0, maxi = parts.length; i < maxi; i += 1) {
        res[res.length - 1].push(parts[i]);

        if (parts[i][0] === parts[i][0].toUpperCase()) {
          res.push([]);
        }
      }

      res.pop();

      // console.log("RES: ", res);

      displayName = [...res[0], ...res[res.length - 2], ...res[res.length - 1]].join(" ");
    }
  });
</script>

<span
  class={"flex gap-2 items-center w-max text-base-content " + cl}
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
      {displayName}
    </a>
  {:else}
    {displayName}
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
