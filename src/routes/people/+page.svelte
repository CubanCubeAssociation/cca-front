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

  let error = $state(false);
  let loading = $state(false);
  let pg = $state(new Paginator([], 20));
  let users = $state([] as USER[]);

  function updateData() {
    loading = true;
    error = false;
    users.length = 0;

    getUsers(pg.page, pg.limit)
      .then(res => {
        if (!res) {
          error = true;
          return;
        }

        pg.setTotal(res.totalResults);
        pg.setPage(res.page);
        users = res.results;
        error = false;
        goto(page.url.pathname + `/?page=${pg.page}`, { replaceState: true });
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
    pg.page = Math.max(1, parseInt(page.url.searchParams.get("page") || "1", 10));
    updateData();
  });
</script>

<card class="card mx-auto mb-8 mt-4 max-w-4xl">
  <h1 class="flex items-center justify-center gap-1 text-center text-4xl">Competidores</h1>

  {#if loading}
    <span class="loading loading-spinner loading-lg mx-auto"></span>
  {:else if users.length > 0}
    <PaginatorComponent showNextPrev={!$screen.isMobile} update={updateData} bind:pg class="mb-4" />

    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Provincia</th>
            <th>ELO</th>
          </tr>
        </thead>

        <tbody>
          {#each users as user, pos}
            <tr>
              <td> {(pg.page - 1) * pg.limit + pos + 1}</td>
              <td><UserField {user} showAvatar link /></td>
              <td>{user.province}</td>
              <td>-</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <PaginatorComponent showNextPrev={!$screen.isMobile} update={updateData} bind:pg class="mb-4" />
  {:else if error}
    <span class="text-center text-red-500!">
      Ha ocurrido un error. Por favor revise su conexión y vuelva a intentarlo.
    </span>

    <button class="btn btn-primary mt-8" onclick={updateData}>Recargar</button>
  {:else}
    <span class="text-center">No hay resultados disponibles</span>
  {/if}
</card>
