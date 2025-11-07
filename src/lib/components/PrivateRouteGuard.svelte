<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { userStore } from "@stores/user";
  import { browser } from "$app/environment";
  import { getOwnUser, redirectToLogin } from "@helpers/API";

  const debug = false;

  let loading = true;

  onMount(async () => {
    if (!browser) return;

    const currentUser = get(userStore);

    if (debug) console.log("Checking user...", currentUser);

    if (currentUser) {
      loading = false;
      return;
    }

    const user = await getOwnUser();

    if (user) {
      if (debug) console.log("User fetched:", user);
      userStore.set(user);
      loading = false;
    } else {
      if (debug) console.log("Redirecting to login");
      redirectToLogin();
    }
  });
</script>

{#if loading}
  <div class="flex justify-center items-center h-screen">
    <p>Cargando...</p>
  </div>
{:else if $userStore}
  <slot />
{/if}
