<script lang="ts">
  import { userStore } from "@stores/user";
  import { tokenStore } from "@stores/token";
  import { redirectToLogin, refreshToken } from "@helpers/API";

  (async () => {
    if (
      !$userStore ||
      !$tokenStore ||
      new Date($tokenStore.access.expires).getTime() < Date.now()
    ) {
      console.log("Trying to refresh token");

      if (await refreshToken()) {
        console.log("Token updated");
        return;
      }

      console.log("Redirecting");

      redirectToLogin();
    }
  })();
</script>

{#if $userStore}
  <slot />
{/if}
