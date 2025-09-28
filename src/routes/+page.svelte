<script lang="ts">
  // import { Puzzle } from "@classes/puzzle/puzzle";
  // import PuzzleImage from "@components/PuzzleImage.svelte";
  // import { pGenerateCubeBundle } from "@helpers/cube-draw";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { SITEMAP } from "@helpers/routing";
  import type { Scrambler } from "@interfaces";
  import { ChevronRightIcon } from "lucide-svelte";

  const POPULAR: { icon: Scrambler; name: string }[] = [
    { icon: "333", name: "3x3" },
    { icon: "222so", name: "2x2" },
    { icon: "444wca", name: "4x4" },
    { icon: "pyrso", name: "Pyraminx" },
  ];
  // console.time("puzzle");
  // const puzzle = $state(
  //   Puzzle.fromSequence(`U' R' B L' U B R' L l r b u`, { type: "pyraminx", rounded: true })
  // );
  // console.timeEnd("puzzle");

  // let img = $state(pGenerateCubeBundle([puzzle])[0]);
</script>

<main id="hero" class="card">
  <h1 class="text-2xl mb-4 text-center">Cuban Cube Association</h1>
  <p class="text-center text-sm">
    Nuestra misión es organizar y gestionar las competiciones en todo el país con la mayor cantidad
    de personas y de la forma más divertida, bajo condiciones justas y equitativas siguiendo las
    reglas de la WCA (Asociación Mundial del Cubo), además de fomentar el uso de los puzzles para el
    desarrollo mental de los niños y jóvenes.
  </p>

  <a href={SITEMAP.cca}>
    <button class="btn btn-info mt-4">Saber más <ChevronRightIcon size="1rem" /> </button>
  </a>

  <!-- <PuzzleImage src={img} /> -->
</main>

<section id="popular" class="card">
  <h2 class="mb-4 text-center text-xl">Categorías populares</h2>
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
