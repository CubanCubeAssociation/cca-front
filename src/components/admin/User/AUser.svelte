<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { createUser, getUser, removeUser, updateUser } from "@helpers/API";
  import type { USER } from "@interfaces";
  import { PROVINCIAS, ROLES } from "@constants";
  import Input from "@components/material/Input.svelte";
  import Select from "@components/material/Select.svelte";
  import Button from "@components/material/Button.svelte";
  import DeleteIcon from "@icons/Delete.svelte";
  import SaveIcon from "@icons/Send.svelte";
  import UserIcon from '@icons/Account.svelte';

  export let id = 'new';

  let user: USER = {
    name: '',
    email: '',
    password: '',
    ci: '',
    sex: 'M',
    username: '',
    province: '',
    municipality: '',
    credit: 0,
    avatar: '',
    role: 'user',
    isEmailVerified: false,
    age: 0,
    id: ''
  };

  let municipios: string[] = [];
  let dialog: HTMLDialogElement;

  function closeModal() {
    dialog.close();
  }

  function exit() {
    navigate('/admin/user');
  }

  function save() {
    if ( id != 'new' ) {
      updateUser(user)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    } else {
      createUser(user)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    }
  }

  function deleteUser() {
    closeModal();
    
    removeUser(user)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  onMount(() => {
    if ( !id || !id.trim() ) {
      id = 'new';
    }

    if ( id != 'new' ) {
      getUser(id)
        .then((u) => {
          user = u;
          console.log("USER: ", user);
          municipios = PROVINCIAS.find(p => p.nombre === u.province)?.municipios || [];
        })
        .catch(err => console.log("ERROR: ", err));
    }
  });
</script>

<div class="card bg-white mt-20">
  <h1 class="text-3xl text-center">
    { id === 'new' ? 'Crear' : 'Editar'} usuario
  </h1>

  <div class="grid gap-4">
    <div class="field flex items-center justify-between">
      {#if user.avatar}
        <img src={ user.avatar } alt={ user.name } class="avatar">
      {:else}
        <div class="avatar">
          <UserIcon size="100%"/>
        </div>
      {/if}
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Nombre: </span>
      <Input bind:value={ user.name }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Email: </span>
      <Input bind:value={ user.email }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">CI: </span>
      <Input bind:value={ user.ci }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Sexo: </span>
      <Input bind:value={ user.sex }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Usuario: </span>
      <Input bind:value={ user.username }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Provincia: </span>
      <Select class="w-full"
        bind:value={ user.province }
        items={ PROVINCIAS }
        label={ p => p.nombre }
        transform={ p => p.nombre }
        onChange={ p => municipios = p.municipios }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Municipio: </span>
      <Select class="w-full"
        bind:value={ user.municipality }
        items={ municipios }
        label={ p => p }
        transform={ p => p }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Crédito: </span>
      <Input bind:value={ user.credit }/>
    </div>

    <div class="field flex items-center justify-between">
      <span class="font-bold text-xl">Rol: </span>
      <Select class="w-full"
        bind:value={ user.role }
        items={ ROLES } label={ r => r.name }/>
    </div>
  </div>

  <div class="flex justify-center gap-2 mt-4">
    {#if id != 'new' }
      <Button class="text-white bg-red-500" on:click={ () => dialog.showModal() }>
        <DeleteIcon size="1.2rem"/> Eliminar
      </Button>
    {/if}
    
    <Button class="text-white" on:click={ save }>
      <SaveIcon size="1.2rem"/> { id === 'new' ? 'Crear' : 'Guardar' }
    </Button>
  </div>
</div>


<dialog
  bind:this={ dialog }
  class="bg-white text-current shadow-md rounded-md"
  >
  <h3 class="text-lg mb-4">¿Desea eliminar esta categoría?</h3>
  <div class="flex gap-2 justify-center">
    <Button class="text-white"
      on:click={ closeModal }
    >Cancelar</Button>
    
    <Button class="text-white bg-red-500" on:click={ deleteUser }>
      <DeleteIcon size="1.2rem"/> Eliminar
    </Button>
  </div>
</dialog>