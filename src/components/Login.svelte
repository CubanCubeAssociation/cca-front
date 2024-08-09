<script lang="ts">
  import { Label, Input, A, Button, Card, Spinner } from "flowbite-svelte";
  import { login } from "@helpers/API";
  import { navigate, useLocation } from "svelte-routing";
  import { onMount } from "svelte";
  import { userStore } from "@stores/user";

  let email = "";
  let password = "";
  let error = "";
  let location = useLocation();
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
      let ret = new URL(($location as any).href).searchParams.get("returnTo");
      navigate(ret || "/");
    } catch (e) {
      error = "Email o contraseña inválidos.";
      loading = false;
    }
  }

  function clearError() {
    error = "";
  }

  onMount(() => {
    if ($userStore) {
      let ret = new URL(($location as any).href).searchParams.get("returnTo");
      navigate(ret || "/");
    }
  });
</script>

<Card class="mt-4 max-w-sm w-[calc(100%-2rem)] mx-auto mb-8">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Iniciar sesión</h1>

  {#if error}
    <h3 class="text-lg my-0 text-red-700">{error}</h3>
  {/if}

  <form class="mt-8 space-y-6" on:submit|preventDefault={_login}>
    <div>
      <Label for="email" class="mb-2">Email</Label>
      <Input
        on:input={clearError}
        bind:value={email}
        type="email"
        name="email"
        id="email"
        placeholder="name@company.com"
        required
        aria
        autocomplete="email"
      />
    </div>
    <div>
      <Label for="password" class="mb-2">Contraseña</Label>
      <Input
        on:input={clearError}
        bind:value={password}
        type="password"
        name="password"
        id="password"
        placeholder="••••••••"
        required
        autocomplete="current-password"
      />
    </div>

    <div class="flex items-start">
      <A href="/" aClass="ml-auto text-sm">Olvidó su contraseña?</A>
    </div>
    <Button type="submit">
      {#if loading}
        <Spinner size="5" color="white" />
      {:else}
        Entrar
      {/if}
    </Button>
  </form>
</Card>
