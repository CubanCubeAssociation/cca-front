<script lang="ts">
  import { onMount } from "svelte";
  import moment from 'moment';
  import { navigate } from 'svelte-routing';
  import { getContests } from "@helpers/API";
  import type { CONTEST_RESULT } from "@interfaces";

  let contestResults: CONTEST_RESULT = {
    limit: 0,
    page: 0,
    results: [],
    totalPages: 0,
    totalResults: 0
  };

  onMount(() => {
    getContests().then(c => {
      contestResults = c;
      // contestResults.results = [
      //   ...contestResults.results,
      //   ...contestResults.results,
      //   ...contestResults.results,
      // ]
    });
  });
</script>

<div class="card bg-white mt-20">
  <h1 class="text-center text-3xl">Competencias</h1>

  <div class="table-wrapper rounded-md overflow-x-auto shadow-md">
    <table class="table-auto text-center w-full stripped overflow-hidden">
      <thead class="border-b border-black">
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Fecha</th>
          <th>Hora</th>
        </tr>
      </thead>
      <tbody>
        {#each contestResults.results as r, pos}
          <tr class="hover:bg-gray-200 cursor-pointer transition-all duration-100"
            on:click={ () => navigate('/contests/' + r.name) }
          >
            <td>{pos + 1}</td>
            <td>{r.name}</td>
            <td>
              { moment( r.date ).format('DD/MM/YYYY') }
            </td>
            <td>
              { moment( r.date ).format('hh:mm a') }
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>