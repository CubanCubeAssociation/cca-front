<script lang="ts">
  import { parseReconstruction } from "@helpers/strings";
  import type { PuzzleType, Scrambler } from "@interfaces";

  interface IReconstructorProps {
    reconstruction: string;
    scrambler: Scrambler;
  }

  interface IScramblerConfig {
    type: PuzzleType;
    order: number;
  }

  let { reconstruction, scrambler }: IReconstructorProps = $props();
  let recHTML = $state("");

  const reconstructionMap: Record<Scrambler, IScramblerConfig> = {
    "222so": {
      type: "rubik",
      order: 2,
    },
    "333": {
      type: "rubik",
      order: 3,
    },
    "333fm": {
      type: "rubik",
      order: 3,
    },
    "333ni": {
      type: "rubik",
      order: 3,
    },
    "333mbf": {
      type: "rubik",
      order: 3,
    },
    "333oh": {
      type: "rubik",
      order: 3,
    },
    "444bld": {
      type: "rubik",
      order: 4,
    },
    "444wca": {
      type: "rubik",
      order: 4,
    },
    "555wca": {
      type: "rubik",
      order: 5,
    },
    "555bld": {
      type: "rubik",
      order: 5,
    },
    "666wca": {
      type: "rubik",
      order: 6,
    },
    "777wca": {
      type: "rubik",
      order: 7,
    },
    clkwca: {
      type: "clock",
      order: -1,
    },
    mgmp: {
      type: "megaminx",
      order: 3,
    },
    pyrso: {
      type: "pyraminx",
      order: 3,
    },
    skbso: {
      type: "skewb",
      order: -1,
    },
    sqrs: {
      type: "square1",
      order: -1,
    },
  };

  $effect(() => {
    let scr = reconstructionMap[scrambler];
    recHTML = parseReconstruction(reconstruction, scr.type, scr.order).result;
  });
</script>

<pre
  class="reconstructor max-w-80 whitespace-pre-wrap"
  bind:innerHTML={recHTML}
  contenteditable="false"></pre>
