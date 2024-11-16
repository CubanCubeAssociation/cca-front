<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Contests from "./components/Contests.svelte";
  import Contest from "./components/Contest.svelte";
  import Login from "./components/Login.svelte";
  import ACategories from "./components/admin/Category/ACategories.svelte";
  import ACategory from "./components/admin/Category/ACategory.svelte";
  import AUser from "./components/admin/User/AUser.svelte";
  import AUsers from "./components/admin/User/AUsers.svelte";
  import AContests from "./components/admin/Contest/AContests.svelte";
  import AContest from "./components/admin/Contest/AContest.svelte";
  import ASolve from "./components/admin/Solve/ASolve.svelte";
  import ASolves from "./components/admin/Solve/ASolves.svelte";
  import PrivateRoute from "@components/PrivateRoute.svelte";
  import { userStore } from "@stores/user";
  import { tokenStore } from "@stores/token";
  import NavbarComponent from "@components/NavbarComponent.svelte";
  import FooterComponent from "@components/FooterComponent.svelte";
  import Home from "@components/Home.svelte";
  import { clearSessionStores, refreshToken } from "@helpers/API";
  import { isAuth } from "@helpers/auth";
  import Results from "@components/Results.svelte";
  import Ranking from "@components/Ranking.svelte";
  import type { INotification } from "@interfaces";
  import { NotificationService } from "@stores/notification.service";
  import { onMount } from "svelte";
  import Notification from "@components/Notification.svelte";
  import { screen } from "@stores/screen.store";

  let notifications: INotification[] = [];
  const notService = NotificationService.getInstance();
  const subService = notService.notificationSub;
  const debug = false;

  if (localStorage.getItem("tokens") && localStorage.getItem("user")) {
    $tokenStore = JSON.parse(localStorage.getItem("tokens")!);
    $userStore = JSON.parse(localStorage.getItem("user")!);
  } else {
    clearSessionStores();
  }

  (async () => {
    if (!isAuth($userStore)) {
      debug && console.log("Token does not exist or expired");
      clearSessionStores();

      if (await refreshToken()) {
        debug && console.log("Token updated app");
        location.reload();
        return;
      }
    } else {
      debug && console.log("IS AUTH");
    }
  })();

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
</script>

<svelte:window on:resize={handleResize} />

<Router>
  <NavbarComponent />

  <!-- Components -->
  <Route path="/" component={Home} />
  <Route path="/login" component={Login} />
  <Route path="/contests" component={Contests} />
  <Route path="/contests/:name" component={Contest} />
  <Route path="/results" component={Results} />
  <Route path="/rankings" component={Ranking} />

  <!-- Admin -->
  <!-- Done -->
  <PrivateRoute path="/admin/category"><ACategories /></PrivateRoute>
  <PrivateRoute path="/admin/category/:id" let:params><ACategory id={params.id} /></PrivateRoute>

  <!-- Todo -->
  <PrivateRoute path="/admin/user"><AUsers /></PrivateRoute>
  <PrivateRoute path="/admin/user/:id" let:params><AUser id={params.id} /></PrivateRoute>

  <!-- Todo -->
  <PrivateRoute path="/admin/contest"><AContests /></PrivateRoute>
  <PrivateRoute path="/admin/contest/:name" let:params><AContest name={params.name} /></PrivateRoute
  >

  <!-- Todo -->
  <PrivateRoute path="/admin/solve"><ASolves /></PrivateRoute>
  <PrivateRoute path="/admin/solve/:id" let:params><ASolve id={params.id} /></PrivateRoute>

  <FooterComponent />
</Router>

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
