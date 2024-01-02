<script lang="ts">
  import { DarkMode, Dropdown, DropdownItem, NavBrand, NavHamburger, NavLi, NavUl, Navbar } from "flowbite-svelte";
  import { Link } from "svelte-routing";
  import { userStore } from '@stores/user';
  import ChevronDownOutline from '@icons/ChevronDown.svelte';

  function checkMobile(cb: any) {
    if ( window.innerWidth < 768 ) {
      cb();
    }
  }
</script>

<div class="relative py-10">
  <Navbar let:hidden let:toggle class="justify-between fixed top-0 left-0 w-full z-50">
    <Link to="/">
      <NavBrand>
        <img class="w-10 h-10 mr-2" src="/logo.png" alt="CCA logo">
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white mr-2">
          CCA
        </span>
      </NavBrand>
    </Link>
  
    <div class="flex md:order-2">
      <DarkMode />
      <NavHamburger on:click={toggle} />
    </div>
    
    <NavUl {hidden} class="order-1">
      <Link on:click={ () => checkMobile(toggle) } to="/contests"><NavLi> Competencias </NavLi></Link>
      <Link on:click={ () => checkMobile(toggle) } to="/results"><NavLi> Resultados </NavLi></Link>
      <Link on:click={ () => checkMobile(toggle) } to="/rules"><NavLi> Reglamento </NavLi></Link>
      <Link on:click={ () => checkMobile(toggle) } to="/cca"><NavLi> CCA </NavLi></Link>
      
      {#if !$userStore}
        <Link to="/login"><NavLi> Entrar </NavLi></Link>
      {/if}
  
      {#if $userStore}
        <NavLi class="cursor-pointer">
          ADMIN <ChevronDownOutline class="w-3 h-3 ms-2 text-primary-800 dark:text-white inline" />
        </NavLi>
        <Dropdown class="w-44 z-20">
          <Link to="/admin/user" on:click={ () => checkMobile(toggle) }><DropdownItem>Usuarios</DropdownItem></Link>
          <Link to="/admin/contest" on:click={ () => checkMobile(toggle) }><DropdownItem>Competencias</DropdownItem></Link>
          <Link to="/admin/category" on:click={ () => checkMobile(toggle) }><DropdownItem>Categorías</DropdownItem></Link>
        </Dropdown>
      {/if}
    </NavUl>
  </Navbar>
</div>