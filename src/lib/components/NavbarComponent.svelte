<script lang="ts">
  import {
    Avatar,
    DarkMode,
    Dropdown,
    DropdownDivider,
    DropdownItem,
    NavBrand,
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
  import { getAvatarRoute, logout } from "@helpers/API";
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
  import ChevronDownIcon from "@icons/ChevronDown.svelte";

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
    <NavBrand>
      <CcaLogo size="2rem" />
      <Span class="ml-2 self-center whitespace-nowrap text-base font-semibold">CCA</Span>
    </NavBrand>

    <div class="flex md:order-2">
      <DarkMode />
      <NavHamburger on:click={toggle} />
    </div>

    <NavUl {hidden} class="order-1" ulClass={UL_CLASS}>
      <NavLi href="/contests" class="flex items-center gap-1" onclick={() => checkMobile(toggle)}>
        <SwordIcon class="text-red-600 dark:text-red-400" /> Competencias
      </NavLi>

      <NavLi class="flex items-center gap-1 cursor-pointer">
        <TrophyIcon class="text-yellow-400 dark:text-yellow-300" />
        Resultados
        <ChevronDownIcon />
      </NavLi>

      <Dropdown trigger="hover">
        <DropdownItem
          href="/ranking"
          class="flex items-center gap-1"
          onclick={() => checkMobile(toggle)}
        >
          <TrophyIcon class="text-yellow-400 dark:text-yellow-300" /> Récords
        </DropdownItem>

        <DropdownItem
          href="/ranking"
          class="flex items-center gap-1"
          onclick={() => checkMobile(toggle)}
        >
          <RankingIcon class="text-green-400 dark:text-green-300" /> Ranking
        </DropdownItem>

        <DropdownItem
          href="/people"
          class="flex items-center gap-1"
          onclick={() => checkMobile(toggle)}
        >
          <PeopleIcon class="text-blue-400 dark:text-blue-300" /> Competidores
        </DropdownItem>
      </Dropdown>

      <NavLi href="/rules" class="flex items-center gap-1" onclick={() => checkMobile(toggle)}>
        <RulesIcon class="text-orange-400 dark:text-orange-300" /> Reglamento
      </NavLi>

      <NavLi href="/cca" class="flex items-center gap-1" onclick={() => checkMobile(toggle)}>
        <CubeIcon class="text-primary-500 dark:text-primary-400" /> CCA
      </NavLi>

      {#if !isAuth($userStore)}
        <NavLi href="/login" onclick={() => checkMobile(toggle)}>Entrar</NavLi>
      {:else}
        <NavLi>
          <div class="flex items-center gap-2">
            <Avatar
              border
              size="xs"
              src={getAvatarRoute($userStore?.username || "")}
              class={"cursor-pointer p-0 " +
                ($userStore?.role === "root"
                  ? "!ring-purple-500 dark:!ring-purple-400"
                  : $userStore?.role === "admin"
                    ? "!ring-primary-500 dark:!ring-primary-400"
                    : $userStore?.role === "delegate"
                      ? "!ring-green-500 dark:!ring-green-400"
                      : "")}
            />
            <span class="md:hidden">{$userStore?.name}</span>
          </div>
        </NavLi>

        <Dropdown trigger="click" bind:open={userDropdownOpen}>
          <svelte:element this={"slot"} slot="header">
            <div
              class="flex gap-4 items-center cursor-pointer hover:bg-black hover:bg-opacity-5 px-4 py-1 rounded-md"
            >
              <Avatar
                border
                size="sm"
                src={getAvatarRoute($userStore?.username || "")}
                class={"cursor-pointer p-0 " +
                  ($userStore?.role === "root"
                    ? "!ring-purple-500 dark:!ring-purple-400"
                    : $userStore?.role === "admin"
                      ? "!ring-primary-500 dark:!ring-primary-400"
                      : $userStore?.role === "delegate"
                        ? "!ring-green-500 dark:!ring-green-400"
                        : "")}
              />
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

          <a href="/me/profile" onclick={() => checkMobile(toggle)}>
            <DropdownItem class="flex items-center gap-1">
              <UserIcon class="dark:text-green-400" /> Perfil
            </DropdownItem>
          </a>

          <a href="/me/settings" onclick={() => checkMobile(toggle)}>
            <DropdownItem class="flex items-center gap-1">
              <SettingsIcon class="dark:text-gray-400" /> Configuración
            </DropdownItem>
          </a>

          {#if minRole($userStore, "delegate")}
            <DropdownDivider />
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
    </NavUl>
  </Navbar>
</div>
