<script lang="ts">
  import { userStore } from "@stores/user";
  import { tokenStore } from "@stores/token";
  import { useLocation, navigate } from "svelte-routing";
  import { refreshToken } from "@helpers/API";
  
  const location = useLocation();

  (async() => {
    if ( !$userStore || !$tokenStore || (new Date($tokenStore.access.expires)).getTime() < Date.now() ) {
      console.log("Trying to refresh token");
      
      if ( await refreshToken() ) {
        console.log("Token updated");
        return;
      }

      console.log("Redirecting");

      $userStore = $tokenStore = null;
      navigate(encodeURI(`/login?returnTo=${ $location.pathname }`));
    }
  })();
</script>

{#if $userStore}
  <slot />
{/if}
