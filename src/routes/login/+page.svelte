<script lang="ts">
  import { login } from "@helpers/API";
  import { onMount } from "svelte";
  import { userStore } from "@stores/user";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { preventDefault } from "@helpers/object";

  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  async function _login() {
    loading = true;
    try {
      let res = await login(email, password);

      if (!res) {
        error = "Error de autenticación.";
        loading = false;
        return;
      }
      let ret = $page.url.searchParams.get("returnTo");
      goto(ret || "/", { replaceState: true });
    } catch {
      error = "Email o contraseña inválidos.";
      loading = false;
    }
  }

  function clearError() {
    error = "";
  }

  onMount(() => {
    if ($userStore) {
      let ret = $page.url.searchParams.get("returnTo");
      goto(ret || "/", { replaceState: true });
    }
  });
</script>

<div class="card mt-4 max-w-xs mx-auto mb-8">
  <h1 class="text-2xl font-bold">Iniciar sesión</h1>

  {#if error}
    <h3 class="text-lg my-0 text-red-700">{error}</h3>
  {/if}

  <form class="space-y-2" onsubmit={preventDefault(_login)}>
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Email</legend>
      <input
        class="input"
        oninput={clearError}
        bind:value={email}
        type="email"
        name="email"
        id="email"
        placeholder="Email"
        required
        autocomplete="email"
      />
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Contraseña</legend>
      <input
        class="input"
        oninput={clearError}
        bind:value={password}
        type="password"
        name="password"
        id="password"
        placeholder="Contraseña"
        required
        autocomplete="current-password"
      />
    </fieldset>

    <!-- <div class="flex items-start">
      <a href="/">Olvidó su contraseña?</a>
    </div> -->
    <button type="submit" class="btn btn-primary">
      {#if loading}
        <span class="loading loading-spinner loading-sm mx-auto"></span>
      {:else}
        Entrar
      {/if}
    </button>
  </form>
</div>
