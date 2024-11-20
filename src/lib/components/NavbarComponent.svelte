<script lang="ts">
  import {
    Avatar,
    DarkMode,
    Dropdown,
    DropdownItem,
    NavHamburger,
    NavLi,
    NavUl,
    Navbar,
    Span,
  } from "flowbite-svelte";
  import { userStore } from "@stores/user";
  import { isAuth, minRole } from "@helpers/auth";
  import CcaLogo from "@components/CCALogo.svelte";
  import WcaCategory from "./wca/WCACategory.svelte";
  import SwordIcon from "@icons/Sword.svelte";
  import TrophyIcon from "@icons/Trophy.svelte";
  import RulesIcon from "@icons/Script.svelte";
  import CubeIcon from "@icons/Cube.svelte";
  import UserIcon from "@icons/Account.svelte";
  import UsersIcon from "@icons/AccountGroup.svelte";
  import RankingIcon from "@icons/SortNumericAscending.svelte";
  import ExitIcon from "@icons/ExitToApp.svelte";
  import { logout } from "@helpers/API";
  import { NotificationService } from "@stores/notification.service";
  import { ROLES } from "@constants";

  const notification = NotificationService.getInstance();
  const UL_CLASS =
    "flex flex-col p-3 mt-4 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:text-sm md:font-medium";

  let userDropdownOpen = $state(false);

  function checkMobile(cb: any) {
    userDropdownOpen = false;
    if (window.innerWidth < 768) {
      cb();
    }
  }
</script>

<div class="relative py-10">
  <Navbar let:hidden let:toggle class="fixed left-0 top-0 z-10 w-full justify-between shadow-lg">
    <a href="/">
      <div class="flex">
        <CcaLogo size="2rem" />
        <Span class="ml-2 self-center whitespace-nowrap text-base font-semibold">CCA</Span>
      </div>
    </a>

    <div class="flex md:order-2">
      <DarkMode />
      <NavHamburger on:click={toggle} />
    </div>

    <NavUl {hidden} class="order-1" ulClass={UL_CLASS}>
      <a href="/contests" onclick={() => checkMobile(toggle)} class="flex items-center">
        <NavLi class="flex items-center gap-1">
          <SwordIcon class="text-red-600 dark:text-red-400" /> Competencias
        </NavLi>
      </a>
      <a href="/results" onclick={() => checkMobile(toggle)} class="flex items-center">
        <NavLi class="flex items-center gap-1">
          <TrophyIcon class="text-yellow-400 dark:text-yellow-300" /> Resultados
        </NavLi>
      </a>
      <a href="/ranking" onclick={() => checkMobile(toggle)} class="flex items-center">
        <NavLi class="flex items-center gap-1">
          <RankingIcon class="text-green-400 dark:text-green-300" /> Ranking
        </NavLi>
      </a>
      <a href="/rules" onclick={() => checkMobile(toggle)} class="flex items-center">
        <NavLi class="flex items-center gap-1">
          <RulesIcon class="text-orange-400 dark:text-orange-300" /> Reglamento
        </NavLi>
      </a>
      <a href="/cca" onclick={() => checkMobile(toggle)} class="flex items-center">
        <NavLi class="flex items-center gap-1">
          <CubeIcon class="text-primary-500 dark:text-primary-400" /> CCA
        </NavLi>
      </a>

      {#if !isAuth($userStore)}
        <a href="/login" onclick={() => checkMobile(toggle)} class="flex items-center">
          <NavLi>Entrar</NavLi>
        </a>
      {:else}
        <Avatar size="xs" src={$userStore?.avatar} class="cursor-pointer" />

        <Dropdown trigger="click" bind:open={userDropdownOpen}>
          <svelte:element this={"slot"} slot="header">
            <div
              class="flex gap-4 items-center cursor-pointer hover:bg-black hover:bg-opacity-5 px-4 py-1 rounded-md"
            >
              <Avatar size="sm" src={$userStore?.avatar} class="cursor-pointer" />
              <div class="grid">
                <span class="block text-gray-900 dark:text-white text-base">
                  {$userStore?.name}
                </span>
                <a
                  href={`/people/${$userStore?.username || "#"}`}
                  class="block truncate text-sm font-medium text-pink-400"
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
          </svelte:element>

          <a href="/profile" onclick={() => checkMobile(toggle)}>
            <DropdownItem class="flex items-center gap-1">
              <UserIcon class="dark:text-green-400" /> Perfil
            </DropdownItem>
          </a>

          {#if minRole($userStore, "delegate")}
            <a href="/admin/user" onclick={() => checkMobile(toggle)}>
              <DropdownItem class="flex items-center gap-1">
                <UsersIcon class="dark:text-blue-400" /> Usuarios
              </DropdownItem>
            </a>
            <a href="/admin/contest" onclick={() => checkMobile(toggle)}>
              <DropdownItem class="flex items-center gap-1">
                <SwordIcon class="dark:text-red-400" /> Competencias
              </DropdownItem>
            </a>

            {#if minRole($userStore, "admin")}
              <a href="/admin/category" onclick={() => checkMobile(toggle)}>
                <DropdownItem class="flex items-center gap-1">
                  <WcaCategory
                    icon="333"
                    size=".7rem"
                    class="text-yellow-400"
                    buttonClass="!p-[.1rem]"
                  /> Categorías
                </DropdownItem>
              </a>
            {/if}
          {/if}
          <svelte:element this={"slot"} slot="footer">
            <DropdownItem
              class="flex items-center gap-1"
              on:click={async () => {
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
                checkMobile(toggle);
              }}
            >
              <ExitIcon class="dark:text-red-400" /> Salir
            </DropdownItem>
          </svelte:element>
        </Dropdown>
      {/if}

      <!-- {#if minRole($userStore, "delegate")}
        <NavLi class="flex cursor-pointer items-center gap-1">
          <ShieldIcon class="text-green-600 dark:text-green-400" />
          ADMIN
          <ChevronDownOutline class="ms-2 inline h-3 w-3 text-primary-800 dark:text-white" />
        </NavLi>
        <Dropdown
          class="z-20 w-44"
          containerClass="[&>div]:hidden rounded-md !text-gray-200 !bg-gray-700"
        >
          <a href="/admin/user" on:click={() => checkMobile(toggle)}>
            <DropdownItem class="flex items-center gap-1">
              <UserIcon class="dark:text-blue-400" /> Usuarios
            </DropdownItem>
          </a>
          <a href="/admin/contest" on:click={() => checkMobile(toggle)}>
            <DropdownItem class="flex items-center gap-1">
              <SwordIcon class="dark:text-red-400" /> Competencias
            </DropdownItem>
          </a>

          {#if minRole($userStore, "admin")}
            <a href="/admin/category" on:click={() => checkMobile(toggle)}>
              <DropdownItem class="flex items-center gap-1">
                <WcaCategory
                  icon="333"
                  size=".7rem"
                  class="text-yellow-400"
                  buttonClass="!p-[.1rem]"
                /> Categorías
              </DropdownItem>
            </a>
          {/if}
        </Dropdown>
      {/if} -->
    </NavUl>
  </Navbar>
</div>
