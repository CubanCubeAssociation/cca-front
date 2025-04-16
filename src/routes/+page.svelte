<script lang="ts">
  import { Button, Heading, P, Span } from "flowbite-svelte";
  import ChevronRight from "@icons/ChevronRight.svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import type { Scrambler } from "@interfaces";

  const POPULAR: { icon: Scrambler; name: string }[] = [
    { icon: "333", name: "3x3" },
    { icon: "222so", name: "2x2" },
    { icon: "444wca", name: "4x4" },
    { icon: "pyrso", name: "Pyraminx" },
  ];
</script>

<main id="hero">
  <Heading tag="h1" class="mb-4 text-center">Cuban Cube Association</Heading>
  <P align="center">
    Nuestra misión es organizar y gestionar las competiciones en todo el país con la mayor cantidad
    de personas y de la forma más divertida, bajo condiciones justas y equitativas siguiendo las
    reglas de la WCA (Asociación Mundial del Cubo), además de fomentar el uso de los puzzles para el
    desarrollo mental de los niños y jóvenes.
  </P>

  <a href="/cca"><Button class="mt-4">Saber más <ChevronRight /></Button></a>
</main>

<section id="popular">
  <Heading tag="h2" class="mb-4 text-center">Categorías populares</Heading>
  <ul class="flex list-none items-center justify-evenly">
    {#each POPULAR as p}
      <li
        class="flex w-fit cursor-default flex-col items-center justify-center
          rounded-md bg-white p-2 text-black
          transition-all duration-200 hover:text-orange-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-orange-300"
      >
        <WcaCategory icon={p.icon} size="3rem" />
        <Span>{p.name}</Span>
      </li>
    {/each}
  </ul>
</section>

<style lang="postcss">
  @reference "tailwindcss";

  #hero,
  #popular {
    @apply mx-auto w-[min(100%,40rem)] p-4 text-center;
  }

  #popular {
    @apply my-8;
  }
</style>
