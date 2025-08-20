<script lang="ts">
  import { userStore } from "@stores/user";
  import { minRole } from "@helpers/auth";
  import CcaLogo from "@components/CCALogo.svelte";
  import WcaCategory from "./wca/WCACategory.svelte";
  import { dumpData, logout, updateAll } from "@helpers/API";
  import { NotificationService } from "@stores/notification.service";
  import { ROLES } from "@constants";
  import { getReturnURL } from "@helpers/strings";
  import { page } from "$app/state";
  import {
    ArrowDownNarrowWideIcon,
    BoxIcon,
    LogInIcon,
    LogOutIcon,
    MenuIcon,
    RefreshCcwIcon,
    SaveIcon,
    ScrollIcon,
    SwordsIcon,
    TrendingUpDownIcon,
    TrophyIcon,
    UsersIcon,
  } from "lucide-svelte";
  import { screen } from "@stores/screen.store";
  import Avatar from "./Avatar.svelte";
  import { SITEMAP } from "@helpers/routing";

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

  function handleUpdateAll() {
    updateAll()
      .then(() => {
        notification.addNotification({
          header: "Actualizado",
          text: "Se han actualizado todos los datos correctamente",
        });
      })
      .catch(error => {
        console.dir(error);
        notification.addNotification({
          header: "Error",
          text: "Ha ocurrido un error al actualizar",
        });
      });
    avatarDropdownOpen = false;
  }

  function handleDumpData() {
    dumpData()
      .then(data => {
        let a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "image/png" }));
        a.download = `CCA-Backup-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => {
        notification.addNotification({
          header: "Error",
          text: "Ha ocurrido un error al salvar la información",
        });
      });
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
                href={`${SITEMAP.people}/${$userStore?.username || "#"}`}
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

        {#if minRole($userStore, "delegate")}
          <li>
            <a href={SITEMAP.admin.user} onclick={() => (avatarDropdownOpen = false)}>
              <UsersIcon size="1rem" class="text-blue-400" /> Usuarios
            </a>
          </li>

          <li>
            <a href={SITEMAP.admin.contest} onclick={() => (avatarDropdownOpen = false)}>
              <SwordsIcon size="1rem" class="text-red-400" /> Competencias
            </a>
          </li>

          {#if minRole($userStore, "admin")}
            <li>
              <a href={SITEMAP.admin.category} onclick={() => (avatarDropdownOpen = false)}>
                <WcaCategory
                  icon="333"
                  size="1rem"
                  class="text-yellow-400"
                  buttonClass="p-[.1rem]!"
                />
                Categorías
              </a>
            </li>

            <li>
              <a href="?" onclick={handleUpdateAll}>
                <RefreshCcwIcon size="1rem" class="text-accent" />
                Actualizar todo
              </a>
            </li>

            <li>
              <a href="?" onclick={handleDumpData}>
                <SaveIcon size="1rem" class="text-success" />
                Generar salva
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
            <LogOutIcon size="1rem" class="text-red-400" /> Salir
          </button>
        </li>
      </ul>
    </details>
  </li>
{/snippet}

{#snippet navlist()}
  <li>
    <a href={SITEMAP.contests}>
      <SwordsIcon size="1.2rem" class="text-red-400" /> Competencias
    </a>
  </li>

  <li>
    <details id="navbarDropdown" bind:open={userDropdownOpen}>
      <summary>
        <TrophyIcon size="1.2rem" class="text-yellow-300" />
        Resultados
      </summary>

      <ul>
        <li>
          <a href={SITEMAP.records} onclick={() => (userDropdownOpen = false)}>
            <TrophyIcon size="1.2rem" class="text-yellow-300" /> Récords
          </a>
        </li>
        <li>
          <a href={SITEMAP.ranking} onclick={() => (userDropdownOpen = false)}>
            <ArrowDownNarrowWideIcon size="1.2rem" class="text-green-300" /> Ranking
          </a>
        </li>
        <li>
          <a href={SITEMAP.people} onclick={() => (userDropdownOpen = false)}>
            <UsersIcon size="1.2rem" class="text-blue-300" /> Competidores
          </a>
        </li>
        <li>
          <a href={SITEMAP.compare} onclick={() => (userDropdownOpen = false)}>
            <TrendingUpDownIcon size="1.2rem" class="text-orange-300" /> Comparar
          </a>
        </li>
      </ul>
    </details>
  </li>

  <li>
    <a href={SITEMAP.rules} class="flex items-center gap-1">
      <ScrollIcon size="1.2rem" class="text-purple-300" /> Reglamento
    </a>
  </li>

  <li>
    <a href={SITEMAP.cca} class="flex items-center gap-1">
      <BoxIcon size="1.2rem" class="text-primary-400" /> CCA
    </a>
  </li>

  {#if !$userStore}
    <li>
      <a
        href={encodeURI(`${SITEMAP.login}?returnTo=${getReturnURL(page.url)}`)}
        onclick={() => (userDropdownOpen = false)}
      >
        <LogInIcon size="1.2rem" class="text-accent" />
        Entrar
      </a>
    </li>
  {:else if !$screen.isMobile}
    {@render userSnippet()}
  {/if}
{/snippet}

<div class="navbar bg-base-100 shadow-sm fixed z-[1000] top-0 left-0 w-full">
  <div class="navbar-start w-min">
    {#if $screen.isMobile}
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <MenuIcon size="1.2rem" />
        </div>

        <ul class="menu dropdown-content bg-base-200 rounded-box w-56">
          {@render navlist()}
        </ul>
      </div>
    {/if}

    <a href={SITEMAP.home} class="btn btn-ghost text-xl">
      <CcaLogo size="2rem" />
      <span class="ml-2 self-center whitespace-nowrap text-base font-semibold">CCA</span>
    </a>
  </div>
  <div class="navbar-end w-auto ml-auto">
    <ul class="menu menu-horizontal items-center">
      {#if !$screen.isMobile}
        {@render navlist()}
      {:else if $userStore}
        {@render userSnippet()}
      {/if}
    </ul>
  </div>
</div>
