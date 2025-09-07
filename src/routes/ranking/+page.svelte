<script lang="ts">
  import { onMount } from "svelte";
  import { getCategories, getRanking } from "@helpers/API";
  import type { CATEGORY, RANKING } from "@interfaces";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import Select from "@components/Select.svelte";
  import { timer } from "@helpers/timer";
  import { screen } from "@stores/screen.store";
  import { Paginator } from "@classes/Paginator.svelte";
  import Award from "@components/Award.svelte";
  import UserField from "@components/UserField.svelte";
  import { contestNameToLink } from "@helpers/routing";
  import { twMerge } from "tailwind-merge";
  import { ArrowDown01Icon } from "lucide-svelte";
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { PROVINCIAS } from "@constants";

  const debug = false;
  const provinces = $state([{ id: "0", nombre: "Todas las Provincias" }, ...PROVINCIAS]);
  let selectedProvince = $state<(typeof provinces)[number]>();

  const sexs = $state([
    { id: "0", sexo: "", nombre: "Todos los sexos" },
    { id: "1", sexo: "M", nombre: "Masculino" },
    { id: "2", sexo: "F", nombre: "Femenino" },
  ]);
  let selectedSex = $state<(typeof sexs)[number]>();

  let rankingResults: RANKING[] = $state([]);

  let loading = $state(false);
  let error = $state(false);
  let pg = $state(new Paginator([], 20));
  let categories: CATEGORY[] = $state([]);
  let category: CATEGORY | null = $state(null);
  let type: "Single" | "Media" = $state("Single");

  function addQueryField(
    query: URLSearchParams,
    field: string,
    value: string,
    defaultValue: string | null = null
  ) {
    if (defaultValue === null || value != defaultValue) {
      query.set(field, value);
    } else {
      query.delete(field);
    }
  }

  function refreshRankingData() {
    loading = true;
    error = false;

    getCategories()
      .then(res => {
        if (!res) return;
        categories = res.results.sort((a, b) => (a.name < b.name ? -1 : 1));
        category = categories.reduce(
          (acc, c) =>
            acc ? acc : c.name.startsWith(page.url.searchParams.get("category") || "3x3") ? c : acc,
          null as CATEGORY | null
        );
        category = category || categories[0];
      })
      .then(() => getRankingInfo())
      .catch(err => {
        if (debug) console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => (loading = false));
  }

  async function getRankingInfo() {
    if (!category) return;
    if (debug) console.log("getRankingInfo");
    if (debug) console.trace();
    loading = true;
    error = false;

    rankingResults.length = 0;
    let name = category.name;

    return getRanking(category.id, type, selectedProvince?.nombre, selectedSex?.sexo)
      .then(c => {
        if (!c) {
          error = true;
          return;
        }
        rankingResults = c;
        if (debug) console.log("RESULTS: ", rankingResults);
        let urlPage = parseInt(page.url.searchParams.get("page") || "1") || 1;
        pg.setData(rankingResults);
        pg.setPage(urlPage);

        let query = page.url.searchParams;
        query.set("category", name);

        addQueryField(query, "type", type, "Single");

        if (!selectedProvince || selectedProvince.id === "0") {
          query.delete("province");
          selectedProvince = undefined;
        } else {
          addQueryField(query, "province", selectedProvince.nombre);
        }

        if (!selectedSex || selectedSex.id === "0") {
          query.delete("sex");
          selectedSex = undefined;
        } else {
          addQueryField(query, "sex", selectedSex.sexo);
        }

        goto(page.url.pathname + "?" + query.toString(), { replaceState: true });
      })
      .catch(err => {
        if (debug) console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    let query = page.url.searchParams;
    query.set("page", pg.page.toString());
    goto(page.url.pathname + "?" + query.toString(), { replaceState: true });
  }

  onMount(() => {
    let params = page.url.searchParams;
    let _type = params.get("type");
    let _province = (params.get("province") || "").toLowerCase();
    let _sex = (params.get("sex") || "").toLowerCase();

    let prov = provinces.slice(1).find(p => p.nombre.toLowerCase() === _province);
    let sx = sexs.slice(1).find(s => s.sexo.toLowerCase() === _sex);

    selectedProvince = prov;
    selectedSex = sx;

    addQueryField(params, "page", "" + (parseInt(params.get("page") || "1") || 1));
    addQueryField(
      params,
      "type",
      _type && _type.toLocaleLowerCase() === "media" ? "Media" : "Single",
      "Single"
    );
    addQueryField(params, "province", prov?.nombre || "", "");
    addQueryField(params, "sex", sx?.sexo || "", "");

    goto(page.url.pathname + "?" + params.toString(), { replaceState: true });

    refreshRankingData();
  });
</script>

<LoadingLayout {loading} {error} altError={false} reloadFunction={refreshRankingData}>
  {#snippet title()}
    <ArrowDown01Icon size="1.5rem" class="text-green-400" /> Ranking
  {/snippet}

  {#snippet content()}
    <div class="actions mb-2 flex flex-wrap justify-center items-center gap-2">
      <Select
        bind:value={category}
        items={categories}
        transform={e => e}
        label={e => e.name}
        placement="right"
        hasIcon={e => e.scrambler}
        onChange={() => getRankingInfo()}
      />

      <Select
        bind:value={type}
        items={["Single", "Media"]}
        transform={e => e}
        label={e => e}
        placement="right"
        onChange={() => getRankingInfo()}
      />

      <Select
        bind:value={selectedProvince}
        items={provinces}
        label={p => p.nombre}
        transform={p => p}
        placeholder="Provincia"
        onChange={() => {
          if (!selectedProvince || selectedProvince.id === "0") {
            selectedProvince = undefined;
          }
          getRankingInfo();
        }}
      />

      <Select
        bind:value={selectedSex}
        items={sexs}
        label={p => p.nombre}
        transform={s => s}
        placeholder="Sexo"
        onChange={() => {
          if (!selectedSex || selectedSex.id === "0") {
            selectedSex = undefined;
          }
          getRankingInfo();
        }}
      />
    </div>

    {#if rankingResults.length > 0}
      <PaginatorComponent showNextPrev={!$screen.isMobile} bind:pg update={updatePaginator} />

      <div class="overflow-x-auto w-full rounded-lg border border-base-content/10">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Provincia</th>
              <th>{type === "Single" ? "Tiempo" : "Promedio"}</th>
              <th>Competencia</th>
            </tr>
          </thead>

          <tbody>
            {#each rankingResults.slice(pg.start, pg.end) as r, pos}
              <tr>
                <td>
                  {#if pos === 0 && pg.page === 1}
                    <Award type="gold" />
                  {:else if pos === 1 && pg.page === 1}
                    <Award type="silver" />
                  {:else if pos === 2 && pg.page === 1}
                    <Award type="bronze" />
                  {:else}
                    <span class="flex justify-center">{(pg.page - 1) * pg.limit + pos + 1}</span>
                  {/if}
                </td>
                <td>
                  <UserField user={r.contestant} link />
                </td>
                <td>{r.contestant.province}</td>
                <td>
                  <a
                    href={contestNameToLink(r.contest, {
                      category: category?.name,
                      time: r.time,
                      type: type === "Single" ? "single" : "avg",
                      username: r.contestant.username,
                    })}
                    target="_blank"
                  >
                    <span
                      class={twMerge(
                        "flex items-center justify-between gap-2",
                        type === "Single" ? "text-green-400" : "text-purple-400"
                      )}
                    >
                      {r.time ? timer(r.time, true, true) : "DNF"}
                    </span>
                  </a>
                </td>
                <td>
                  <a class="text-blue-300" href={contestNameToLink(r.contest)} target="_blank">
                    {r.contest}
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <PaginatorComponent
        showNextPrev={!$screen.isMobile}
        bind:pg
        class="mt-4"
        update={updatePaginator}
      />
    {:else}
      <span class="text-center"
        >No hay resultados disponibles para {category?.name}
        {type}
        {#if selectedSex && selectedSex.id != "0"}({selectedSex.nombre}){/if}
        {#if selectedProvince && selectedProvince.id != "0"}en la provincia "{selectedProvince.nombre}"{/if}
      </span>
    {/if}
  {/snippet}

  {#snippet errorContent()}
    <span class="text-center text-error">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </span>

    <button
      class="btn btn-primary mt-8"
      onclick={() => (category ? getRankingInfo() : refreshRankingData())}
    >
      Recargar
    </button>
  {/snippet}
</LoadingLayout>
