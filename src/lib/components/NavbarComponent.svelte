<script lang="ts">
  import { userStore } from "@stores/user";
  import { isAuth, minRole } from "@helpers/auth";
  import CcaLogo from "@components/CCALogo.svelte";
  import WcaCategory from "./wca/WCACategory.svelte";
  import { logout } from "@helpers/API";
  import { NotificationService } from "@stores/notification.service";
  import { ROLES } from "@constants";
  import SwordIcon from "@icons/Sword.svelte";
  import TrophyIcon from "@icons/Trophy.svelte";
  import RulesIcon from "@icons/Script.svelte";
  import CubeIcon from "@icons/Cube.svelte";
  import UserIcon from "@icons/Account.svelte";
  import UsersIcon from "@icons/AccountGroup.svelte";
  import RankingIcon from "@icons/SortNumericAscending.svelte";
  import ExitIcon from "@icons/ExitToApp.svelte";
  import SettingsIcon from "@icons/Cog.svelte";
  import PeopleIcon from "@icons/AccountGroup.svelte";
  import { getReturnURL } from "@helpers/strings";
  import { page } from "$app/state";
  import { MenuIcon } from "lucide-svelte";
  import { screen } from "@stores/screen.store";
  import Avatar from "./Avatar.svelte";

  const notification = NotificationService.getInstance();

  let userDropdownOpen = $state(false);
  let avatarDropdownOpen = $state(false);

  function handleClick(ev: MouseEvent) {
    let navbarDropdown = document.getElementById("navbarDropdown");

    if (navbarDropdown && userDropdownOpen) {
      if (!navbarDropdown.contains(ev.target as Node)) {
        userDropdownOpen = false;
      }
    }

    let avatarDropdown = document.getElementById("avatarDropdown");

    if (avatarDropdown && avatarDropdownOpen) {
      if (!avatarDropdown.contains(ev.target as Node)) {
        avatarDropdownOpen = false;
      }
    }
  }
</script>

<svelte:window onclick={handleClick} />

{#snippet userSnippet()}
  <li>
    <details id="avatarDropdown" class="dropdown dropdown-end" bind:open={avatarDropdownOpen}>
      <summary>
        <Avatar size="xs" user={$userStore} showName />
      </summary>

      <ul class="menu menu-sm w-3xs dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
        <li>
          <div class="flex gap-4 items-center cursor-default hover:bg-black px-4 py-1 rounded-md">
            <Avatar size="lg" user={$userStore} />

            <div class="grid">
              <span class="block">
                {$userStore?.name}
              </span>
              <a
                href={`/people/${$userStore?.username || "#"}`}
                class="block truncate font-medium text-pink-400"
                onclick={() => (avatarDropdownOpen = false)}
              >
                CCA ID: {$userStore?.username}
              </a>
              <span
                class={$userStore?.role === "root"
                  ? "text-purple-300"
                  : $userStore?.role === "admin"
                    ? "text-blue-300"
                    : $userStore?.role === "delegate"
                      ? "text-green-400"
                      : "hidden"}
              >
                {ROLES.find(r => r.value === $userStore?.role)?.name || "Usuario"}
              </span>
            </div>
          </div>
        </li>

        <li>
          <a href="/me/profile" onclick={() => (avatarDropdownOpen = false)}>
            <UserIcon class="text-green-400" /> Perfil
          </a>
        </li>

        <li>
          <a href="/me/settings" onclick={() => (avatarDropdownOpen = false)}>
            <SettingsIcon class="text-gray-400" /> Configuración
          </a>
        </li>

        {#if minRole($userStore, "delegate")}
          <li>
            <a href="/admin/user" onclick={() => (avatarDropdownOpen = false)}>
              <UsersIcon class="text-blue-400" /> Usuarios
            </a>
          </li>

          <li>
            <a href="/admin/contest" onclick={() => (avatarDropdownOpen = false)}>
              <SwordIcon class="text-red-400" /> Competencias
            </a>
          </li>

          {#if minRole($userStore, "admin")}
            <li>
              <a href="/admin/category" onclick={() => (avatarDropdownOpen = false)}>
                <WcaCategory
                  icon="333"
                  size=".7rem"
                  class="text-yellow-400"
                  buttonClass="p-[.1rem]!"
                />
                Categorías
              </a>
            </li>
          {/if}
        {/if}

        <li>
          <button
            onclick={async () => {
              if (await logout()) {
                notification.addNotification({
                  header: "Hecho",
                  text: "Sesión cerrada correctamente.",
                  timeout: 2000,
                });
              } else {
                notification.addNotification({
                  header: "Error",
                  text: "Error al intentar cerrar sesión.",
                  timeout: 2000,
                });
              }
              avatarDropdownOpen = false;
            }}
          >
            <ExitIcon class="text-red-400" /> Salir
          </button>
        </li>
      </ul>
    </details>
  </li>
{/snippet}

{#snippet navlist()}
  <li>
    <a href="/contests">
      <SwordIcon class="text-red-400" /> Competencias
    </a>
  </li>

  <li>
    <details id="navbarDropdown" bind:open={userDropdownOpen}>
      <summary>
        <TrophyIcon class="text-yellow-300" />
        Resultados
      </summary>

      <ul>
        <li>
          <a href="/records" onclick={() => (userDropdownOpen = false)}>
            <TrophyIcon class="text-yellow-300" /> Récords
          </a>
        </li>
        <li>
          <a href="/ranking" onclick={() => (userDropdownOpen = false)}>
            <RankingIcon class="text-green-300" /> Ranking
          </a>
        </li>
        <li>
          <a href="/people" onclick={() => (userDropdownOpen = false)}>
            <PeopleIcon class="text-blue-300" /> Competidores
          </a>
        </li>
      </ul>
    </details>
  </li>

  <li>
    <a href="/rules" class="flex items-center gap-1">
      <RulesIcon class="text-orange-300" /> Reglamento
    </a>
  </li>

  <li>
    <a href="/cca" class="flex items-center gap-1">
      <CubeIcon class="text-primary-400" /> CCA
    </a>
  </li>

  {#if !isAuth($userStore)}
    <li>
      <a
        href={encodeURI(`/login?returnTo=${getReturnURL(page.url)}`)}
        onclick={() => (userDropdownOpen = false)}
      >
        Entrar
      </a>
    </li>
  {:else if !$screen.isMobile}
    {@render userSnippet()}
  {/if}
{/snippet}

<div class="navbar bg-base-100 shadow-sm fixed z-50 top-0 left-0 w-full">
  <div class="navbar-start w-min">
    {#if $screen.isMobile}
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <MenuIcon />
        </div>

        <ul class="menu dropdown-content bg-base-200 rounded-box w-56">
          {@render navlist()}
        </ul>
      </div>
    {/if}

    <a href="/" class="btn btn-ghost text-xl">
      <CcaLogo size="2rem" />
      <span class="ml-2 self-center whitespace-nowrap text-base font-semibold">CCA</span>
    </a>
  </div>
  <div class="navbar-end w-auto ml-auto">
    <ul class="menu menu-horizontal items-center">
      {#if !$screen.isMobile}
        {@render navlist()}
      {:else}
        {@render userSnippet()}
      {/if}
    </ul>
  </div>
</div>
