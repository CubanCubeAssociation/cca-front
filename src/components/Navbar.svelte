<script lang="ts">
  import { Link, navigate } from 'svelte-routing';

  let expanded = false;
  let mobile = document.body.clientWidth <= 768;
  let list;

  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleClick() {
    expanded = false;
  }

  function handleResize() {
    if ( document.body.clientWidth >= 768 ) {
      expanded = false;
      mobile = false;
    } else {
      mobile = true;
    }
  }

  function to(url: string) {
    expanded = false;
    navigate(url);
  }

  handleResize();
</script>

<nav>
  <button on:click={ toggleExpanded }
    class="w-8 h-8 grid place-items-center md:hidden">
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </button>

  <div on:click={ handleClick } class:expanded
    class="outside fixed w-full h-full top-0 left-0
    z-50 bg-gray-500 bg-opacity-50 md:hidden"></div>
  
  <ul bind:this={ list } class:mobile class:expanded
    class="top-0 left-0 h-full w-80 bg-white
      m-0 flex gap-4 flex-col items-center pt-8 transition-all
      duration-300 shadow-lg z-50 max-md:fixed
      md:relative md:w-full md:flex-row md:p-4 md:shadow-none"
    >
    <li on:click={ () => to("/info") }> Información </li>
    <li on:click={ () => to("/contests") }> Competencias </li>
    <li on:click={ () => to("/results") }> Resultados </li>
    <li on:click={ () => to("/rules") }> Reglamento </li>
    <li on:click={ () => to("/cca") }> CCA </li>
    <li on:click={ () => to("/login") }> Entrar </li>
  </ul>
</nav>

<svelte:window on:resize={ handleResize }/>

<style lang="postcss">
  nav {
    @apply fixed top-0 left-0 w-full h-16 shadow-md flex
      items-center px-4;
    background-color: var(--color-bg);
  }

  ul.mobile:not(.expanded) {
    left: -250vw;
  }

  .outside:not(.expanded) {
    @apply hidden;
  }

  li {
    @apply font-medium text-xl cursor-pointer p-2 rounded-md
      hover:bg-blue-100 transition-all duration-100;
  }

  li:first-child {
    @apply md:ml-auto;
  }

  .line {
    @apply w-full bg-gray-600 rounded-md;
    height: 0.300rem;
  }
</style>