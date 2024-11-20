<script lang="ts">
  import { Card, Heading } from "flowbite-svelte";
  import CubeIcon from "@icons/Cube.svelte";
</script>

<Card class="mx-auto mb-8 mt-4 grid w-[calc(100%-2rem)] max-w-4xl place-items-center">
  <Heading tag="h1" class="mb-4 flex items-center justify-center gap-1 text-center text-4xl">
    <CubeIcon class="text-primary-500 dark:text-primary-400" /> CCA
  </Heading>

  <span>La información de la CCA aún no está disponible.</span>
</Card>
