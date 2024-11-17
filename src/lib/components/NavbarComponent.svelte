<script lang="ts">
  import {
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
  import ChevronDownOutline from "@icons/ChevronDown.svelte";
  import ShieldIcon from "@icons/Shield.svelte";
  import SwordIcon from "@icons/Sword.svelte";
  import TrophyIcon from "@icons/Trophy.svelte";
  import RulesIcon from "@icons/Script.svelte";
  import CubeIcon from "@icons/Cube.svelte";
  import UserIcon from "@icons/AccountGroup.svelte";
  import RankingIcon from "@icons/SortNumericAscending.svelte";

  function checkMobile(cb: any) {
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

    <NavUl {hidden} class="order-1">
      <a href="/contests" on:click={() => checkMobile(toggle)}>
        <NavLi class="flex items-center gap-1">
          <SwordIcon class="text-red-600 dark:text-red-400" /> Competencias
        </NavLi>
      </a>
      <a href="/results" on:click={() => checkMobile(toggle)}>
        <NavLi class="flex items-center gap-1">
          <TrophyIcon class="text-yellow-400 dark:text-yellow-300" /> Resultados
        </NavLi>
      </a>
      <a href="/ranking" on:click={() => checkMobile(toggle)}>
        <NavLi class="flex items-center gap-1">
          <RankingIcon class="text-green-400 dark:text-green-300" /> Ranking
        </NavLi>
      </a>
      <a href="/rules" on:click={() => checkMobile(toggle)}>
        <NavLi class="flex items-center gap-1">
          <RulesIcon class="text-orange-400 dark:text-orange-300" /> Reglamento
        </NavLi>
      </a>
      <a href="/cca" on:click={() => checkMobile(toggle)}>
        <NavLi class="flex items-center gap-1">
          <CubeIcon class="text-primary-500 dark:text-primary-400" /> CCA
        </NavLi>
      </a>

      {#if !isAuth($userStore)}
        <a href="/login" on:click={() => checkMobile(toggle)}><NavLi>Entrar</NavLi></a>
      {/if}

      {#if minRole($userStore, "delegate")}
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
      {/if}
    </NavUl>
  </Navbar>
</div>
