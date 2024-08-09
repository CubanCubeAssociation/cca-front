<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { Button, Card, Heading, Input, Label, Modal, Radio, Span } from 'flowbite-svelte';
  import { ExclamationCircleOutline, TrashBinSolid } from "flowbite-svelte-icons";
  import { createUser, getUser, removeUser, updateUser } from "@helpers/API";
  import type { USER } from "@interfaces";
  import { PROVINCIAS, ROLES } from "@constants";
  import SaveIcon from "@icons/Send.svelte";
  import Select from '@components/Select.svelte';

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
  let showModal = false;

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

  // dev-only
  function createGroup() {
    const names = ['Angel', 'Carmen', 'Pedro', 'Juan', 'Andrea', 'Paco', 'Lucía', 'Ramiro', 'Abraham', 'Carlos', 'Edgar',
      'Lucio', 'Pascual', 'Ana', 'Lidia', 'Rosa'];
    
    for (let i = 1; i <= 10; i += 1) {
      let nm = names[ Math.floor(Math.random() * names.length) ];
      let lnm = 'A' + Math.random().toString().split('.')[1].slice(0, 5);
      let username = Math.random().toString().split('.')[1];
      let p = Math.floor(Math.random() * PROVINCIAS.length);
      let m = Math.floor(Math.random() * PROVINCIAS[p].municipios.length);

      createUser({
        name: nm + ' ' + lnm,
        email: username + '@gmail.com',
        password: 'Alfa123Perro',
        ci: '970413' + (new Array(5).fill(0)).map(_ => Math.random().toString()[4]).join(''),
        sex: 'M',
        username,
        province: PROVINCIAS[p].nombre,
        municipality: PROVINCIAS[p].municipios[m],
        credit: 0,
        avatar: '',
        role: 'user',
        isEmailVerified: false,
        age: 0,
        id: ''
      });
    }
  }

  function deleteUser() {
    showModal = false;

    removeUser(user)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  function updateMunicipalities(province: string) {
    municipios = (PROVINCIAS.filter(p => p.nombre === province)[0] || {}).municipios || [];
  }

  onMount(() => {
    if ( !id || !id.trim() ) {
      id = 'new';
    }

    if ( id != 'new' ) {
      getUser(id)
        .then((u) => {
          if ( !u ) {
            return navigate('/login');
          }
          user = u;
          municipios = PROVINCIAS.find(p => p.nombre === u.province)?.municipios || [];
        })
        .catch(err => console.log("ERROR: ", err));
    }
  });

  $: updateMunicipalities(user.province);
</script>

<Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8">
  <Heading class="text-3xl text-center">{ id === 'new' ? 'Crear usuario' : `Editar "${ user.name }"`}</Heading>

  <form class="mt-8 grid gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2" on:submit|preventDefault={ save }>
    <div>
      <Label for="name" class="mb-2">Nombre</Label>
      <Input bind:value={ user.name } type="text" id="name" placeholder="Nombre..." required />
    </div>

    <div>
      <Label for="email" class="mb-2">Email</Label>
      <Input bind:value={ user.email } type="email" id="email" placeholder="email@email.com" required />
    </div>

    {#if id === 'new'}
      <div>
        <Label for="password" class="mb-2">Contraseña</Label>
        <Input bind:value={ user.password } type="password" name="password" id="password" placeholder="••••••••" required />
      </div>
    {/if}

    <div>
      <Label for="ci" class="mb-2">CI</Label>
      <Input bind:value={ user.ci } type="text" id="ci" placeholder="########" required />
    </div>

    <div>
      <Label for="sex" class="mb-2">Sexo</Label>
      <div class="flex flex-wrap">
        <Radio class="p-2 gap-1" bind:group={ user.sex } value="M">Masculino</Radio>
        <Radio class="p-2 gap-1" bind:group={ user.sex } value="F">Femenino</Radio>
      </div>
    </div>

    <div>
      <Label for="username" class="mb-2">Usuario</Label>
      <Input bind:value={ user.username } type="text" id="username" required />
    </div>

    <div>
      <Label class="mb-2">Provincia</Label>
      <Select items={ PROVINCIAS } transform={ e => e.nombre } label={ e => e.nombre }
        bind:value={ user.province } onChange={ updateMunicipalities } placement="right-start"/>
    </div>

    <div>
      <Label class="mb-2">Municipio</Label>
      <Select items={ municipios } transform={ e => e } label={e => e} bind:value={ user.municipality }
        placement="right-start"/>
    </div>

    <div>
      <Label for="credit" class="mb-2">Crédito</Label>
      <Input bind:value={ user.credit } type="number" min={ 0 } id="credit" required />
    </div>

    <div>
      <Label class="mb-2">Rol</Label>
      <Select items={ ROLES.slice(1) } transform={ e => e.value } label={e => e.name} bind:value={ user.role } placement="right-start"/>
    </div>
  
    <div class="col-span-full flex flex-wrap gap-2 justify-center mt-4">
      {#if id != 'new' }
        <Button color="red" on:click={ () => showModal = true }>
          <TrashBinSolid size="sm"/> <Span class="ml-1">Eliminar</Span>
        </Button>
      {/if}

      <Button type="submit" class="gap-2"><SaveIcon size="1.2rem"/> { id === 'new' ? 'Crear' : 'Guardar' }</Button>
    </div>
  </form>

  <Button class="w-fit mx-auto mt-4" on:click={ createGroup }>Crear grupo</Button>
</Card>

<Modal bind:open={ showModal } outsideclose autoclose title="Eliminar usuario" size="xs">
  <div class="flex flex-col items-center justify-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />

    <Heading tag="h4" class="text-center">¿Desea eliminar el usuario "{ user.name }"?</Heading>

    <div class="flex gap-2 mt-4">
      <Button color="red" on:click={ deleteUser }>
        <TrashBinSolid size="sm"/> <Span class="ml-1">Eliminar</Span>
      </Button>
      <Button color="alternative">Cancelar</Button>
    </div>
  </div>
</Modal>