<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { navigate } from "svelte-routing";
  import { STATUS_ORDER, type CATEGORY, type CONTEST, type USER, type CONTESTANT } from "@interfaces";

  import { createContest, getCategories, getContest, removeContest, searchUser as searchUsers, updateContest } from "@helpers/API";
  
  import Tooltip from "@components/material/Tooltip.svelte";
  import Button from "@components/material/Button.svelte";
  import Input from "@components/material/Input.svelte";
  import DeleteIcon from '@icons/Delete.svelte';
  import PlusIcon from '@icons/Plus.svelte';
  import SaveIcon from "@icons/Send.svelte";
  import EditIcon from "@icons/Pencil.svelte";
  import Checkbox from "@components/material/Checkbox.svelte";
  import Select from "@components/material/Select.svelte";
  import { getStatus } from "@helpers/strings";
  import { fromModel, uniqueArray } from "@helpers/object";
  import SearchUser from "../User/SearchUser.svelte";
  import YesNoModal from "@components/modals/YesNoModal.svelte";

  export let name: string = 'new';

  let contest: CONTEST = {
    categories: [],
    contestants: [],
    paidUsers: [],
    solves: [],
    id: '',
    name: '',
    place: '',
    status: 'pending',
    date: '',
    inscriptionEnd: '',
    inscriptionStart: '',
    inscriptionCost: 0,
    visible: false,
  };

  let columns = [
    { key: 'name', column: "Nombre" },
    { key: 'username', column: "Usuario" },
    { key: 'categories', column: "Categorías" },
    { key: '', column: "" },
  ];

  let categories: CATEGORY[] = [];

  let editDialog: HTMLDialogElement;
  let addDialog = false;
  let deleteUserDialog = false;
  let deleteContestDialog = false;
  let deleteUserData = {};
  let selectedUser: CONTESTANT;

  function exit() {
    navigate('/admin/contest');
  }

  function save() {
    let cnt = fromModel(contest, 'CONTEST');

    // console.log("TO_SAVE: ", cnt); return;

    if ( name != 'new' ) {
      updateContest(cnt)
        .then((res) => {
          console.log("GUARDADO", res);
        })
        .catch(err => console.log("ERROR: ", err));
    } else {
      createContest(cnt)
        .then((c: CONTEST) => {
          navigate('/admin/contest/' + c.name);
        })
        .catch(err => console.log("ERROR: ", err));
    }
  }

  function toggleSelect(ct: CATEGORY) {
    let cats = contest.categories;

    for (let i = 0, maxi = cats.length; i < maxi; i += 1) {
      if ( cats[i].id === ct.id ) {
        cats.splice(i, 1);
        contest.categories = cats;
        return;
      }
    }
    
    cats.push(ct);
    contest.categories = cats;
  }

  function toggleSelectUser(ct: CATEGORY) {
    let cats = selectedUser.categories;

    for (let i = 0, maxi = cats.length; i < maxi; i += 1) {
      if ( cats[i].id === ct.id ) {
        cats.splice(i, 1);
        selectedUser.categories = cats;
        return;
      }
    }
    
    cats.push(ct);
    selectedUser.categories = cats;
  }

  function handleUsers(ev: CustomEvent<USER[]>) {
    let current = contest.contestants;
    let newUsers: CONTESTANT[] = ev.detail.map((user) => ({
      user,
      categories: []
    }));

    contest.contestants = uniqueArray([
      ...current, ...newUsers
    ], e => e.user.id);

    console.log("CONTESTANTS: ", contest.contestants);
  }

  function deleteContestant(c: USER) {
    deleteUserDialog = true;
    deleteUserData = c;
  }

  function handleDeleteUser(ev: CustomEvent<{ answer: boolean, data: USER }>) {
    deleteUserDialog = false;
    let data = ev.detail;

    if ( data.answer ) {
      contest.contestants = contest.contestants.filter(ct => {
        return ct.user.id != data.data.id
      });
    }
    console.log("HANDLE_ANSWER: ", ev.detail);
  }
  
  function handleDeleteContest(ev: CustomEvent<{ answer: boolean }>) {
    deleteUserDialog = false;
    let data = ev.detail;

    if ( data.answer ) {
      deleteContestDialog = false;

      removeContest(contest)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    }
  }

  function editUser(u: CONTESTANT) {
    selectedUser = {
      user: { ...u.user },
      categories: u.categories.map(ct => ({ ...ct }))
    };

    editDialog.showModal();
  }

  function handleEditUser() {
    let user = contest.contestants.find(c => c.user.username === selectedUser.user.username) as CONTESTANT;
    user.categories = selectedUser.categories;
    contest = contest;
    editDialog.close();
  }

  onMount(() => {
    name != "new" && getContest(name)
      .then((res) => {
        contest = res;
        contest.date = moment(contest.date).format('YYYY-MM-DDThh:mm');
        contest.inscriptionStart = moment(contest.inscriptionStart).format('YYYY-MM-DD');
        contest.inscriptionEnd = moment(contest.inscriptionEnd).format('YYYY-MM-DD');
        console.log("CONTEST: ", contest);
      })
      .catch(err => console.log("ERROR: ", err));

    getCategories()
      .then((res) => {
        categories = res.results;
      })
      .catch((err) => console.log("ERROR: ", err));
  });
</script>

<div class="card bg-white mt-20 mb-10">
  <h1 class="text-3xl text-center mb-4">
    { name === 'new' ? 'Crear' : 'Editar'} competencia
  </h1>

  <div class="grid gap-4">
    <!-- Nombre -->
    <div class="field">
      <span class="font-bold text-xl">Nombre: </span>
      <Input bind:value={ contest.name }/>
    </div>
    
    <!-- Lugar -->
    <div class="field">
      <span class="font-bold text-xl">Lugar: </span>
      <Input bind:value={ contest.place }/>
    </div>
    
    <!-- Fecha -->
    <div class="field">
      <span class="font-bold text-xl">Fecha: </span>
      <Input type="datetime" bind:value={ contest.date }/>
    </div>
    
    <!-- Inicio de inscripcion -->
    <div class="field">
      <span class="font-bold text-xl">Inscripción (inicio): </span>
      <Input type="date" bind:value={ contest.inscriptionStart }/>
    </div>

    <!-- Fin de inscripcion -->
    <div class="field">
      <span class="font-bold text-xl">Inscripción (fin): </span>
      <Input type="date" bind:value={ contest.inscriptionEnd }/>
    </div>
    
    <!-- Costo de inscripcion -->
    <div class="field">
      <span class="font-bold text-xl">Costo: </span>
      <Input type="number"
        min={0}
        bind:value={ contest.inscriptionCost }/>
    </div>
    
    <!-- Estado -->
    <div class="field">
      <span class="font-bold text-xl">Estado: </span>
      <Select bind:value={ contest.status } class="w-full"
        items={ STATUS_ORDER }
        label={ getStatus }
        transform={ e => e }/>
    </div>
    
    <!-- Categorias -->
    <div class="field">
      <span class="font-bold text-xl">Categorías: </span>
      <div class="category-container w-full">
        {#each categories as ct}
          <Tooltip text={ ct.name } position="top">
            <img
              class="category-img rounded-md transition-all
                duration-100 cursor-pointer"
              on:click={ () => toggleSelect(ct) }
              class:selected={ !!contest.categories.find(cat => cat.id === ct.id) }
              src={ ct.icon } alt={ ct.name }>
          </Tooltip>
        {/each}
      </div>
    </div>

    <!-- Competidores -->
    <div class="grid my-4">
      <div class="w-full">
        <Button class="text-white bg-green-500" on:click={ () => addDialog = true }>
          <PlusIcon size="1.2rem"/> Añadir competidor
        </Button>
      </div>

      {#if contest.contestants.length }
        <div class="table-wrapper rounded-md overflow-x-auto shadow-md my-4">
          <table class="table-auto stripped w-full overflow-hidden cursor-default">
            <thead>
              <tr>
                {#each columns as C}
                  <th>{ C.column }</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each contest.contestants as c (c.user.username)}
                <tr>
                  <td
                    data-cell={ columns[0].column }>
                    { c.user.name }
                  </td>
                  <td
                    data-cell={ columns[1].column }>
                    { c.user.username }
                  </td>
                  <td
                    data-cell={ columns[2].column }>
                    <div class="category-container w-full">
                      {#each c.categories as ct}
                        <Tooltip text={ ct.name } position="top">
                          <img
                            class="category-img rounded-md"
                            src={ ct.icon } alt={ ct.name }>
                        </Tooltip>
                      {/each}
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <Tooltip
                        on:click={ () => editUser(c) }
                        text="Editar" position="top" class="cursor-pointer">
                        <EditIcon size="1.2rem"/>
                      </Tooltip>
  
                      <Tooltip
                        on:click={ () => deleteContestant(c.user) }
                        text="Eliminar" position="top" class="cursor-pointer">
                        <DeleteIcon size="1.2rem"/>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="w-full">
          <Button class="text-white bg-green-500" on:click={ () => addDialog = true }>
            <PlusIcon size="1.2rem"/> Añadir competidor
          </Button>
        </div>
      {/if}
    </div>

    <!-- Visible -->
    <div class="field">
      <span class="font-bold text-xl">Visible: </span>
      <div class="mr-auto">
        <Checkbox bind:checked={ contest.visible }/>
      </div>
    </div>
  </div>

  <div class="flex justify-center gap-2 mt-4">
    {#if name != 'new' }
      <Button class="text-white bg-red-500" on:click={ () => deleteContestDialog = true }>
        <DeleteIcon size="1.2rem"/> Eliminar
      </Button>
    {/if}
    
    <Button class="text-white" on:click={ save }>
      <SaveIcon size="1.2rem"/> { name === 'new' ? 'Crear' : 'Guardar' }
    </Button>
  </div>
</div>

<!-- ADD DIALOG -->
<SearchUser on:user={ handleUsers } bind:show={ addDialog }/>

<!-- EDIT USER DIALOG -->
<dialog data-modal bind:this={ editDialog } class="bg-white text-current shadow-md rounded-md">
  <h2 class="text-2xl text-center">Categorías</h2>
  <h3 class="italic text-center mb-4">Categorías de { selectedUser?.user?.name }</h3>

  <div class="category-container w-full">
    {#each contest.categories as ct}
      <Tooltip text={ ct.name } position="top">
        <img
          on:click={ () => toggleSelectUser(ct) }
          class="category-img rounded-md transition-all
            duration-100 cursor-pointer"
          class:selected={ selectedUser?.categories?.find(cat => ct.id === cat.id) }
          src={ ct.icon } alt={ ct.name }>
      </Tooltip>
    {/each}
  </div>

  <div class="flex mt-4 justify-center gap-4 text-white">
    <Button on:click={ () => editDialog.close() } class="bg-gray-200 text-black">Cancelar</Button>
    <Button on:click={ handleEditUser }>Aceptar</Button>
  </div>
</dialog>

<!-- DELETE USER DIALOG -->
<YesNoModal on:answer={ handleDeleteUser } bind:show={ deleteUserDialog } type="delete"
  data={ deleteUserData } text="¿Desea eliminar este competidor?"
/>

<!-- DELETE CONTEST DIALOG -->
<YesNoModal on:answer={ handleDeleteContest } bind:show={ deleteContestDialog } type="delete"
  text="¿Desea eliminar esta competencia?"
/>

<style lang="postcss">
  .field {
    @apply flex items-center justify-between gap-2;
  }

  .category-img.selected {
    @apply bg-green-200 outline outline-green-400;
  }

  .category-img:not(.selected) {
    @apply opacity-50;
  }
</style>
