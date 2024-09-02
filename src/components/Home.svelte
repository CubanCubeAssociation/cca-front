<script lang="ts">
  import { Button, Heading, P, Span } from "flowbite-svelte";
  import ChevronRight from "@icons/ChevronRight.svelte";
  import { Link } from "svelte-routing";
  import WcaCategory from "./wca/WCACategory.svelte";
  import type { Scrambler } from "@interfaces";

  const POPULAR: { icon: Scrambler; name: string }[] = [
    { icon: "333", name: "3x3" },
    { icon: "222so", name: "2x2" },
    { icon: "444wca", name: "4x4" },
    { icon: "pyrso", name: "Pyraminx" },
  ];
</script>

<main id="hero">
  <Heading tag="h1" class="text-center mb-4">Cuban Cube Association</Heading>
  <P align="center"
    >Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam eaque, veniam repellat velit
    omnis repudiandae doloremque sint cumque, laborum magnam illum vitae? Odio, maiores iusto minima
    laudantium reprehenderit ea numquam!</P
  >
  <Link to="/contests"><Button class="mt-4">Explorar <ChevronRight /></Button></Link>
</main>

<section id="popular">
  <Heading tag="h2" class="text-center mb-4">Categorías populares</Heading>
  <ul class="list-none flex items-center justify-evenly">
    {#each POPULAR as p}
      <Link to="#">
        <li
          class="bg-white dark:bg-gray-800 text-black dark:text-gray-300 w-fit p-2 rounded-md
          hover:text-primary-600 dark:hover:text-primary-500 transition-all duration-200 flex flex-col items-center justify-center"
        >
          <WcaCategory icon={p.icon} size="3rem" />
          <Span>{p.name}</Span>
        </li>
      </Link>
    {/each}
  </ul>
</section>

<style lang="postcss">
  #hero,
  #popular {
    @apply w-[min(100%,40rem)] mx-auto p-4 text-center;
  }

  #popular {
    @apply my-8;
  }
</style>
