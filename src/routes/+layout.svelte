<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import { screen } from "@stores/screen.store";
  import { isAuth } from "@helpers/auth";
  import { clearSessionStores, refreshToken } from "@helpers/API";
  import { NotificationService } from "@stores/notification.service";
  import type { INotification } from "@interfaces";
  import { userStore } from "@stores/user";
  import { tokenStore } from "@stores/token";
  import Notification from "@components/Notification.svelte";
  import { browser } from "$app/environment";
  import NavbarComponent from "@components/NavbarComponent.svelte";
  import FooterComponent from "@components/FooterComponent.svelte";
  import type { LayoutServerData } from "./$types";
  import { DOMAIN } from "@constants";
  import { page } from "$app/stores";

  let { children, data }: { children: any; data: LayoutServerData } = $props();

  const notService = NotificationService.getInstance();
  const subService = notService.notificationSub;
  const debug = false;

  let notifications: INotification[] = $state([]);
  let jsonld = $state("");

  if (browser) {
    if (localStorage.getItem("tokens") && localStorage.getItem("user")) {
      $tokenStore = JSON.parse(localStorage.getItem("tokens")!);
      $userStore = JSON.parse(localStorage.getItem("user")!);
    } else {
      clearSessionStores();
    }
  }

  (async () => {
    if (!browser) return;
    if (!isAuth($userStore)) {
      if (debug) console.log("Token does not exist or expired");
      clearSessionStores();

      if (await refreshToken()) {
        if (debug) console.log("Token updated app");
        location.reload();
        return;
      }
    } else if (debug) console.log("IS AUTH");
  })();

  function updateJSONLD(d: any) {
    jsonld = `<${"script"} type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: d.title,
      description: d.description,
      applicationCategory: "Utility",
      operatingSystem: "all",
      url: `${DOMAIN}` + $page.url.pathname,
    })}</${"script"}>`;
  }

  updateJSONLD(data);

  function handleResize() {
    $screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
    };
  }

  onMount(() => {
    subService.subscribe(v => {
      notifications = v;
    });
  });

  $effect(() => {
    updateJSONLD(data);
  });
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  {@html jsonld}
</svelte:head>

<svelte:window on:resize={handleResize} />

<NavbarComponent />

{@render children()}

<FooterComponent />

<div class="notification-container">
  {#each notifications as nt (nt.key)}
    <Notification {...nt} fixed={nt.fixed} />
  {/each}
</div>

<style>
  .notification-container {
    max-width: 25rem;
    position: fixed;
    right: 0;
    top: 3rem;
    height: calc(100% - 3rem);
    width: 100%;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    z-index: 50;
  }
</style>
