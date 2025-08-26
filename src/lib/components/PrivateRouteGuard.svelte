<script lang="ts">
  import { userStore } from "@stores/user";
  import { browser } from "$app/environment";
  import { getOwnUser, redirectToLogin } from "@helpers/API";

  const debug = true;

  (async () => {
    if (!browser) return;
    if (!$userStore) {
      if (debug) console.log("Trying to get user");

      if (await getOwnUser()) {
        return;
      }

      if (debug) console.log("Redirecting");

      redirectToLogin();
    }
  })();
</script>

{#if $userStore}
  <slot />
{/if}
