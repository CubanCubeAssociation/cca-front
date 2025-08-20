<script lang="ts">
  import { onMount } from "svelte";
  import { Paginator } from "@classes/Paginator.svelte";
  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import { getUsers } from "@helpers/API";
  import type { USER } from "@interfaces";
  import { screen } from "@stores/screen.store";
  import UserField from "@components/UserField.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { UsersIcon } from "lucide-svelte";
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import Select from "@components/Select.svelte";
  import { PROVINCIAS } from "@constants";

  const provinces = $state([{ id: "0", nombre: "Todas las Provincias" }, ...PROVINCIAS]);
  let error = $state(false);
  let loading = $state(false);
  let pg = $state(new Paginator([], 10));
  let users = $state([] as USER[]);
  let sortBy = $state([
    { label: "Por nombre", key: "name" },
    { label: "Por ELO", key: "elo" },
    { label: "Por SoR", key: "sor" },
  ]);
  let selectedProvince = $state(provinces[0]);
  let selectedSortBy = $state(sortBy[0]);
  let sortAsc = $state(true);

  function updateData() {
    loading = true;
    error = false;
    users.length = 0;

    let params = new URLSearchParams(page.url.searchParams.toString());

    params.set("page", pg.page + "");

    if (selectedProvince.id != "0") {
      params.set("province", selectedProvince.nombre.replaceAll(/\s/g, "-"));
    } else {
      params.delete("province");
    }

    params.set("sortBy", (sortAsc ? "" : "-") + selectedSortBy.key);

    goto(`?${params.toString()}`, { replaceState: true });

    getUsers({
      page: pg.page,
      limit: pg.limit,
      sortBy: (sortAsc ? "" : "-") + selectedSortBy.key,
      province: selectedProvince.id != "0" ? selectedProvince.nombre : "",
    })
      .then(res => {
        if (!res) {
          error = true;
          return;
        }

        pg.setTotal(res.totalResults);
        pg.setPage(res.page);
        users = res.results;
        error = false;
      })
      .catch(err => {
        console.log("ERROR: ", err);
        error = true;
      })
      .finally(() => {
        loading = false;
      });
  }

  onMount(() => {
    let params = page.url.searchParams;
    pg.page = Math.max(1, parseInt(params.get("page") || "1", 10));

    if (params.get("province")) {
      let pr = params.get("province")!.replaceAll(/-/g, " ");
      selectedProvince = provinces.find(p => p.nombre === pr) || provinces[0];
    }

    if (params.get("sortBy")) {
      let sb = params.get("sortBy");
      selectedSortBy = sortBy.find(s => s.key === sb) || sortBy[0];
    }

    updateData();
  });
</script>

<LoadingLayout {loading} {error} altError={false} reloadFunction={updateData}>
  {#snippet title()}
    <UsersIcon size="1.5rem" class="text-blue-300" /> Competidores
  {/snippet}

  {#snippet content()}
    <div class="flex flex-wrap gap-2">
      <Select
        bind:value={selectedProvince}
        items={provinces}
        label={p => p.nombre}
        transform={p => p}
        placeholder="Provincia"
        onChange={() => updateData()}
      />
      <Select
        bind:value={selectedSortBy}
        items={sortBy}
        label={p => p.label}
        transform={p => p}
        placeholder="Ordenar"
        onChange={() => updateData()}
      />
      <Select
        bind:value={sortAsc}
        items={[
          { label: "Ascendente", key: true },
          { label: "Descendente", key: false },
        ]}
        label={p => p.label}
        transform={p => p.key}
        placeholder="Criterio"
        onChange={() => updateData()}
      />
    </div>

    {#if users.length <= 0}
      <span class="text-center">No hay resultados disponibles</span>
    {:else}
      <PaginatorComponent
        showNextPrev={!$screen.isMobile}
        update={updateData}
        bind:pg
        class="mb-2"
      />

      <div class="overflow-x-auto w-full rounded-lg border border-base-content/10">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Provincia</th>
              <th>ELO</th>
              <th>SoR</th>
            </tr>
          </thead>

          <tbody>
            {#each users as user, pos}
              <tr>
                <td> {(pg.page - 1) * pg.limit + pos + 1}</td>
                <td><UserField {user} showAvatar link /></td>
                <td>{user.province}</td>
                <td>
                  {user.elo}
                </td>
                <td>
                  {#if user.sor}{user.sor}{:else}♾️{/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <PaginatorComponent
        showNextPrev={!$screen.isMobile}
        update={updateData}
        bind:pg
        class="mb-4"
      />
    {/if}
  {/snippet}
</LoadingLayout>
