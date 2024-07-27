<script lang="ts">
  import { DarkMode, Dropdown, DropdownItem, NavBrand, NavHamburger, NavLi, NavUl, Navbar, Span } from "flowbite-svelte";
  import { Link } from "svelte-routing";
  import { userStore } from '@stores/user';
  import ChevronDownOutline from '@icons/ChevronDown.svelte';
  import ShieldIcon from '@icons/Shield.svelte';
  import SwordIcon from '@icons/Sword.svelte';
  import TrophyIcon from '@icons/Trophy.svelte';
  import RulesIcon from '@icons/Script.svelte';
  import CubeIcon from '@icons/Cube.svelte';
  import UserIcon from '@icons/AccountGroup.svelte';
  import { isAuth, minRole } from "@helpers/auth";
  import WcaCategory from "./wca/WCACategory.svelte";
  import CcaLogo from "./CCALogo.svelte";

  function checkMobile(cb: any) {
    if ( window.innerWidth < 768 ) {
      cb();
    }
  }
</script>

<div class="relative py-10">
  <Navbar let:hidden let:toggle class="justify-between fixed top-0 left-0 w-full z-10">
    <Link to="/">
      <NavBrand>
        <CcaLogo size="2rem"/>
        <Span class="self-center whitespace-nowrap text-xl font-semibold ml-2"> CCA </Span>
      </NavBrand>
    </Link>
  
    <div class="flex md:order-2">
      <DarkMode />
      <NavHamburger on:click={toggle} />
    </div>
    
    <NavUl {hidden} class="order-1">
      <Link on:click={ () => checkMobile(toggle) } to="/contests">
        <NavLi class="flex items-center gap-1"> <SwordIcon class="dark:text-red-400 text-red-600"/> Competencias </NavLi>
      </Link>
      <Link on:click={ () => checkMobile(toggle) } to="/results">
        <NavLi class="flex items-center gap-1"> <TrophyIcon class="dark:text-yellow-300 text-yellow-400"/> Resultados </NavLi>
      </Link>
      <Link on:click={ () => checkMobile(toggle) } to="/rules">
        <NavLi class="flex items-center gap-1"> <RulesIcon class="dark:text-orange-300 text-orange-400"/> Reglamento </NavLi>
      </Link>
      <Link on:click={ () => checkMobile(toggle) } to="/cca">
        <NavLi class="flex items-center gap-1"> <CubeIcon class="dark:text-primary-400 text-primary-500"/> CCA </NavLi>
      </Link>
      
      {#if !isAuth($userStore)}
        <Link to="/login"><NavLi> Entrar </NavLi></Link>
      {/if}
  
      {#if minRole($userStore, 'delegate')}
        <NavLi class="cursor-pointer flex items-center gap-1">
          <ShieldIcon class="dark:text-green-400 text-green-600"/>
          ADMIN
          <ChevronDownOutline class="w-3 h-3 ms-2 text-primary-800 dark:text-white inline" />
        </NavLi>
        <Dropdown class="w-44 z-20">
          <Link to="/admin/user" on:click={ () => checkMobile(toggle) }>
            <DropdownItem class="flex items-center gap-1">
              <UserIcon class="dark:text-blue-400"/> Usuarios
            </DropdownItem>
          </Link>
          <Link to="/admin/contest" on:click={ () => checkMobile(toggle) }>
            <DropdownItem class="flex items-center gap-1">
              <SwordIcon class="dark:text-red-400"/> Competencias
            </DropdownItem>
          </Link>

          {#if minRole($userStore, 'admin')}
            <Link to="/admin/category" on:click={ () => checkMobile(toggle) }>
              <DropdownItem class="flex items-center gap-1">
                <WcaCategory icon="333" size=".7rem" class="text-yellow-400" buttonClass="!p-[.1rem]"/> Categorías
              </DropdownItem>
            </Link>
          {/if}
        </Dropdown>
      {/if}
    </NavUl>
  </Navbar>
</div>