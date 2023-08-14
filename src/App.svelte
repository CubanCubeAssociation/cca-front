<script lang="ts">
  import { Router, Route } from 'svelte-routing';
  import Contests from "./components/Contests.svelte";
  import Contest from "./components/Contest.svelte";
  import Login from "./components/Login.svelte";
  import Navbar from "./components/Navbar.svelte";
  import ACategories from './components/admin/Category/ACategories.svelte';
  import ACategory from './components/admin/Category/ACategory.svelte';
  import AUser from './components/admin/User/AUser.svelte';
  import AUsers from './components/admin/User/AUsers.svelte';
  import AContests from './components/admin/Contest/AContests.svelte';
  import AContest from './components/admin/Contest/AContest.svelte';
  import ASolve from './components/admin/Solve/ASolve.svelte';
  import ASolves from './components/admin/Solve/ASolves.svelte';
</script>

<Router>
  <main>
    <!-- Components -->
    <Route path="/login" component={ Login }/>
    <Route path="/contests" component={ Contests }/>
    <Route path="/contests/:name" component={ Contest }/>
    
    <!-- Admin -->
    <!-- Done -->
    <Route path="/admin/category" component={ ACategories }/>
    <Route path="/admin/category/new" component={ ACategory }/>
    <Route path="/admin/category/:id" component={ ACategory }/>
    
    <!-- Done -->
    <Route path="/admin/user" component={ AUsers }/>
    <Route path="/admin/user/new" component={ AUser }/>
    <Route path="/admin/user/:id" component={ AUser }/>
    
    <!-- Todo -->
    <Route path="/admin/contest" component={ AContests }/>
    <Route path="/admin/contest/new" component={ AContest }/>
    <Route path="/admin/contest/:name" component={ AContest }/>
    
    <!-- Todo -->
    <Route path="/admin/solve" component={ ASolves }/>
    <Route path="/admin/solve/new" component={ ASolve }/>
    <Route path="/admin/solve/:id" component={ ASolve }/>

    <Navbar />
  </main>
</Router>