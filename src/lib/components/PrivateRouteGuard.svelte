<script lang="ts">
  import { userStore } from "@stores/user";

  import { redirectToLogin, refreshToken } from "@helpers/API";
  import { browser } from "$app/environment";

  const debug = true;

  (async () => {
    if (!browser) return;
    if (!$userStore) {
      if (debug) console.log("Trying to refresh token");

      if (await refreshToken()) {
        if (debug) console.log("Token updated");
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
