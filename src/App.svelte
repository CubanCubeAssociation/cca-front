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
  import { refreshToken } from "@helpers/API";
  import { isAuth } from "@helpers/auth";

  if (localStorage.getItem("tokens") && localStorage.getItem("user")) {
    $tokenStore = JSON.parse(localStorage.getItem("tokens")!);
    $userStore = JSON.parse(localStorage.getItem("user")!);
  } else {
    $userStore = $tokenStore = null;
  }

  (async () => {
    if (!isAuth($userStore)) {
      console.log("Token does not exist or expired");
      
      $userStore = null;
      $tokenStore = null;

      if (await refreshToken()) {
        console.log("Token updated app");
        location.reload();
        return;
      }
    } else {
      console.log("IS AUTH");
    }
  })();
</script>

<Router>
  <NavbarComponent />

  <!-- Components -->
  <Route path="/" component={Home} />
  <Route path="/login" component={Login} />
  <Route path="/contests" component={Contests} />
  <Route path="/contests/:name" component={Contest} />

  <!-- Admin -->
  <!-- Done -->
  <PrivateRoute path="/admin/category"><ACategories /></PrivateRoute>
  <PrivateRoute path="/admin/category/:id" let:params
    ><ACategory id={params.id} /></PrivateRoute
  >

  <!-- Todo -->
  <PrivateRoute path="/admin/user"><AUsers /></PrivateRoute>
  <PrivateRoute path="/admin/user/:id" let:params
    ><AUser id={params.id} /></PrivateRoute
  >

  <!-- Todo -->
  <PrivateRoute path="/admin/contest"><AContests /></PrivateRoute>
  <PrivateRoute path="/admin/contest/:name" let:params
    ><AContest name={params.name} /></PrivateRoute
  >

  <!-- Todo -->
  <PrivateRoute path="/admin/solve"><ASolves /></PrivateRoute>
  <PrivateRoute path="/admin/solve/:id" let:params
    ><ASolve id={params.id} /></PrivateRoute
  >

  <FooterComponent />
</Router>
