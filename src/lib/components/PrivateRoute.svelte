<script lang="ts">
  import { Route } from "svelte-routing";
  import PrivateRouteGuard from "./PrivateRouteGuard.svelte";

  export let path: string = "";
</script>

<Route {path} let:params let:location>
  <PrivateRouteGuard>
    <slot {params} {location} />
  </PrivateRouteGuard>
</Route>
