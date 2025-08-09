<script lang="ts">
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import { ScrollIcon } from "lucide-svelte";
</script>

<LoadingLayout loading={false} error={false} altError={false} reloadFunction={() => {}}>
  {#snippet title()}
    <ScrollIcon size="1.5rem" class="text-orange-400" /> Reglamento
  {/snippet}

  {#snippet content()}
    <span class="max-w-2xl my-4">
      La CCA se rige bajo las mismas regulaciones de la WCA para las categorías el común. Para más
      información, consultar el enlace debajo.
    </span>

    <a
      href="https://www.worldcubeassociation.org/regulations/translations/spanish-american/"
      class="bg-orange-300 py-1 px-2 rounded-md text-black"
      target="_blank"
    >
      WCA Reglamento y Directrices
    </a>
  {/snippet}
</LoadingLayout>

<!-- <div class="card !hidden mx-auto mb-8 mt-4 max-w-4xl">
  <h2 class="mb-4 flex items-center justify-center gap-1 text-center text-3xl">
    Información complementaria
  </h2>

  <section id="index">
    <h3 class="text-2xl mb-4 text-center" id="categories">Índice</h3>

    <ol>
      <li class="text-center">
        <a href="#categories" class="text-orange-300 text-lg">Categorías</a>
      </li>
      <li class="text-center"><a href="#notation" class="text-orange-300 text-lg">Notación</a></li>
    </ol>
  </section>

  <section id="categories">
    <ol>
      <li>
        <span class="content">Categorías</span>

        <ol>
          <!-- 2x2 BLD, 2x2 OH -- >
          <li>
            <span class="content">2x2 BLD, 2x2 OH</span>

            <ol>
              <li>Formato de ronda completo para esta categoría: "Promedio de 5".</li>
              <li>
                Formato de corte (o tope) para estas categorías: fase de corte "Mejor de 2" para
                "Promedio de 5".
              </li>
            </ol>
          </li>

          <!-- FTO - ->
          <li>
            <span class="content">FTO</span>

            <ol>
              <li>Formato de ronda completo para esta categoría: "Promedio de 5".</li>
              <li>
                Formato de corte (o tope) para estas categorías: fase de corte "Mejor de 2" para
                "Promedio de 5".
              </li>
            </ol>
          </li>

          <!-- 3x3 Mirror - ->
          <li>
            <span class="content">3x3 Mirror</span>

            <ol>
              <li>Formato de ronda completo para esta categoría: "Promedio de 5".</li>
              <li>
                Formato de corte (o tope) para estas categorías: fase de corte "Mejor de 2" para
                "Promedio de 5".
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </section>

  <section id="notation">
    <ol>
      <li>
        <span class="content">Notación</span>

        <ol>
          <!-- 2x2 BLD, 2x2 OH -- >
          <li>
            <span class="content">2x2 BLD, 2x2 OH</span>

            <ol>
              <li>Formato de ronda completo para esta categoría: "Promedio de 5".</li>
              <li>
                Formato de corte (o tope) para estas categorías: fase de corte "Mejor de 2" para
                "Promedio de 5".
              </li>
            </ol>
          </li>

          <!-- FTO -- >
          <li>
            <span class="content">FTO</span>

            <ol>
              <li>Formato de ronda completo para esta categoría: "Promedio de 5".</li>
              <li>
                Formato de corte (o tope) para estas categorías: fase de corte "Mejor de 2" para
                "Promedio de 5".
              </li>
            </ol>
          </li>

          <!-- 3x3 Mirror -- >
          <li>
            <span class="content">3x3 Mirror</span>

            <ol>
              <li>Formato de ronda completo para esta categoría: "Promedio de 5".</li>
              <li>
                Formato de corte (o tope) para estas categorías: fase de corte "Mejor de 2" para
                "Promedio de 5".
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </section>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  section {
    @apply bg-orange-200/5 w-full border border-gray-400 my-2 p-2
      rounded-md shadow-md text-gray-200 max-w-2xl;
  }

  ol {
    counter-reset: item;
  }

  li {
    font-size: 0.98em;
  }

  li::before {
    @apply text-orange-300;
    content: counters(item, ".") "- ";
    counter-increment: item;
    font-weight: bold;
  }

  li > ol {
    padding-left: 1rem;
    font-size: 1em;
  }

  li > .content {
    @apply text-orange-300;
    font-weight: bolder;
    font-size: 1.2em;
  }

  li:has(> .content) {
    margin-top: 0.5rem;
  }

  li:has(> .content)::before {
    font-weight: bolder;
    font-size: 1.1em;
  }

  section > ol > li > .content {
    font-size: 1.5rem;
  }
</style> -->
