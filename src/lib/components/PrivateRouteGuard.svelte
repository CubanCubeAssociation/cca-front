<script lang="ts">
  import { userStore } from "@stores/user";
  import { tokenStore } from "@stores/token";
  import { redirectToLogin, refreshToken } from "@helpers/API";

  const debug = false;

  (async () => {
    if (
      !$userStore ||
      !$tokenStore ||
      new Date($tokenStore.access.expires).getTime() < Date.now()
    ) {
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
