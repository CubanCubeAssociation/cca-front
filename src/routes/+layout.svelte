<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import { screen } from "@stores/screen.store";
  import { NotificationService } from "@stores/notification.service";
  import type { INotification } from "@interfaces";
  import Notification from "@components/Notification.svelte";
  import NavbarComponent from "@components/NavbarComponent.svelte";
  import FooterComponent from "@components/FooterComponent.svelte";
  import type { LayoutServerData } from "./$types";
  import { page } from "$app/state";
  import { DOMAIN, getOwnUser } from "@helpers/API";
  import { userStore } from "$lib/stores/user";

  import("eruda").then(eruda => eruda.default.init());

  let { children, data }: { children: any; data: LayoutServerData } = $props();

  const notService = NotificationService.getInstance();
  const subService = notService.notificationSub;

  let notifications: INotification[] = $state(<INotification[]>[]);
  let jsonld = $state("");

  function updateJSONLD(d: any) {
    jsonld = `<${"script"} type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: d.title,
      description: d.description,
      applicationCategory: "Utility",
      operatingSystem: "all",
      url: `${DOMAIN}` + page.url.pathname,
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
    getOwnUser();

    subService.subscribe(v => {
      notifications = v;
    });
    handleResize();

    let handleOnline = () => {
      if (!$userStore) {
        getOwnUser();
      }
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
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

<div class="toast toast-end toast-middle z-50">
  {#each notifications as nt (nt.key)}
    <Notification {...nt} fixed={nt.fixed} />
  {/each}
</div>
