<script lang="ts">
  import { login } from "@helpers/API";
  import { onMount } from "svelte";
  import { userStore } from "@stores/user";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { preventDefault } from "@helpers/object";
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import { LogInIcon, SendIcon } from "lucide-svelte";
  import { SITEMAP } from "@helpers/routing";

  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  async function _login() {
    loading = true;
    try {
      let res = await login(email, password);

      console.log("RES: ", res);

      if (!res) {
        error = "Error de autenticación.";
        loading = false;
        return;
      }
      let ret = $page.url.searchParams.get("returnTo");
      goto(ret || SITEMAP.home, { replaceState: true });
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
      goto(ret || SITEMAP.home, { replaceState: true });
    }
  });
</script>

<LoadingLayout
  class="max-w-sm"
  loading={false}
  error={false}
  altError={false}
  reloadFunction={() => {}}
>
  {#snippet title()}
    <LogInIcon size="1.5rem" class="text-accent" /> Iniciar sesión
  {/snippet}

  {#snippet content()}
    {#if error}
      <h3 class="text-lg my-0 text-red-700">{error}</h3>
    {/if}

    <form class="space-y-2 w-full px-2" onsubmit={preventDefault(_login)}>
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

      <button type="submit" class="btn btn-primary flex mx-auto" disabled={loading}>
        {#if loading}
          <span class="loading loading-spinner loading-sm mx-auto"></span>
        {:else}
          <SendIcon size="1.2rem" /> Entrar
        {/if}
      </button>
    </form>
  {/snippet}
</LoadingLayout>
