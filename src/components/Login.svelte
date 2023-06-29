<script lang="ts">
  import Button from '@material/Button.svelte';
  import Input from '@material/Input.svelte';
  import { login } from '@helpers/API';

  // let email = 'isaacvega1996@gmail.com';
  // let password = 'Jamonada2015..';
  let email = 'krra@gmail.com';
  let password = 'Leonard123';
  let error = '';

  async function _login() {
    try {
      await login(email, password);
      console.log("LOGGED IN");
    } catch(e) {
      error = 'Email o contraseña inválidos.'
    }
  }

  function clearError() {
    error = '';
  }
</script>

<div class="card mt-0 w-full max-w-xs shadow-md grid
  place-items-center bg-green-600 bg-opacity-70 text-white
  rounded-md p-2 gap-6">
  <h2 class="text-2xl">Iniciar sesión</h2>
  
  {#if error}
    <h3 class="text-lg my-0 text-red-700">{ error }</h3>
  {/if}

  <Input
    bind:value={email}
    on:UENTER={ _login } on:input={ clearError }
    placeholder="Email"/>

  <Input
    bind:value={password}
    on:UENTER={ _login } on:input={ clearError }
    placeholder="Contraseña"/>

  <Button class="bg-white text-black" on:click={ _login }>Entrar</Button>
</div>

<style>
  .card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>