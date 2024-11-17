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
  <P align="center">
    Nuestra misión es organizar y gestionar las competiciones en todo el país con la mayor cantidad
    de personas y de la forma más divertida, bajo condiciones justas y equitativas siguiendo las
    reglas de la WCA (Asociación Mundial del Cubo), además de fomentar el uso de los puzzles para el
    desarrollo mental de los niños y jóvenes.
  </P>

  <Link to="/cca"><Button class="mt-4">Saber más <ChevronRight /></Button></Link>
</main>

<section id="popular">
  <Heading tag="h2" class="text-center mb-4">Categorías populares</Heading>
  <ul class="list-none flex items-center justify-evenly">
    {#each POPULAR as p}
      <li
        class="bg-white dark:bg-gray-800 text-black dark:text-gray-300 w-fit p-2
          rounded-md hover:text-orange-600 dark:hover:text-orange-300 transition-all
          duration-200 flex flex-col items-center justify-center cursor-default"
      >
        <WcaCategory icon={p.icon} size="3rem" />
        <Span>{p.name}</Span>
      </li>
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
