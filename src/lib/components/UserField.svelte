<script lang="ts">
  import { ShieldIcon, ShieldUserIcon } from "lucide-svelte";
  import Avatar from "./Avatar.svelte";
  import { SITEMAP } from "@helpers/routing";

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

      if (res.length < 3) {
        displayName = res.reduce((acc, e) => [...acc, ...e], []).join(" ");
      } else {
        displayName = [...res[0], ...res[res.length - 2], ...res[res.length - 1]].join(" ");
      }
    }
  });
</script>

{#snippet content()}
  {#if showAvatar}
    <Avatar {user} />
  {/if}

  {#if link}
    <a href={`${SITEMAP.people}/${user.username}`} class="hover:text-primary-300">
      {displayName}
    </a>
  {:else}
    {displayName}
  {/if}

  {#if user.role === "root"}
    <div class="tooltip" data-tip="SuperAdmin">
      <ShieldUserIcon size="1.1rem" class="text-purple-500" />
    </div>
  {:else if user.role === "admin"}
    <div class="tooltip" data-tip={"Administrador" + (user.sex === "F" ? "a" : "")}>
      <ShieldUserIcon size="1.1rem" class="text-primary" />
    </div>
  {:else if user.role === "delegate"}
    <div class="tooltip" data-tip={"Delegad" + (user.sex === "F" ? "a" : "o")}>
      <ShieldIcon size="1rem" class="text-green-500 fill-green-500" />
    </div>
  {/if}
{/snippet}

{#if onclick}
  <span
    class={"flex gap-2 items-center w-max text-base-content " + cl}
    role="button"
    tabindex="0"
    {onclick}
    onkeydown={() => {}}
  >
    {@render content()}
  </span>
{:else}
  <span class={"flex gap-2 items-center w-max text-base-content " + cl}>
    {@render content()}
  </span>
{/if}
