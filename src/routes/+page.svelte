<script lang="ts">
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

<main id="hero" class="card">
  <h1 class="text-4xl mb-4 text-center">Cuban Cube Association</h1>
  <p class="text-center">
    Nuestra misión es organizar y gestionar las competiciones en todo el país con la mayor cantidad
    de personas y de la forma más divertida, bajo condiciones justas y equitativas siguiendo las
    reglas de la WCA (Asociación Mundial del Cubo), además de fomentar el uso de los puzzles para el
    desarrollo mental de los niños y jóvenes.
  </p>

  <a href="/cca"><button class="btn btn-info mt-4">Saber más <ChevronRight /></button></a>
</main>

<section id="popular" class="card">
  <h2 class="mb-4 text-center text-3xl">Categorías populares</h2>
  <ul class="flex list-none items-center justify-evenly gap-2">
    {#each POPULAR as p}
      <li
        class="flex w-fit cursor-default flex-col items-center justify-center
          rounded-md p-2
          transition-all duration-200 border"
      >
        <WcaCategory icon={p.icon} size="3rem" />
        <span>{p.name}</span>
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
