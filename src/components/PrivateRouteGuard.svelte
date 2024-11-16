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
      debug && console.log("Trying to refresh token");

      if (await refreshToken()) {
        debug && console.log("Token updated");
        return;
      }

      debug && console.log("Redirecting");

      redirectToLogin();
    }
  })();
</script>

{#if $userStore}
  <slot />
{/if}
