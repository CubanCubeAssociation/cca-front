<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { navigate } from "svelte-routing";
  import { STATUS_ORDER, type CATEGORY, type CONTEST, type USER, type CONTESTANT, type CONTEST_CATEGORY } from "@interfaces";

  import { createContest, getCategories, getContest, removeContest, searchUser as searchUsers, updateContest } from "@helpers/API";

  import DeleteIcon from '@icons/Delete.svelte';
  import PlusIcon from '@icons/Plus.svelte';
  import SaveIcon from "@icons/Send.svelte";
  import EditIcon from "@icons/Pencil.svelte";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { fromModel, uniqueArray } from "@helpers/object";
  import SearchUser from "../User/SearchUser.svelte";
  import { Button, Card, Checkbox, Dropdown, DropdownItem, Heading, Indicator, Input, Label, Modal, Span, TabItem, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Tabs, Toggle, Tooltip } from "flowbite-svelte";
  import { GridSolid, UserOutline, ParagraphOutline, ReceiptSolid, TrashBinSolid, ExclamationCircleOutline } from 'flowbite-svelte-icons';
  import ChevronDown from '@icons/ChevronDown.svelte';
  import WcaCategory from "@components/wca/WCACategory.svelte";

  export let name: string = 'new';

  let contest: CONTEST = {
    categories: [],
    contestants: [],
    solves: [],
    id: '',
    name: 'Open Ciego de Ávila Enero 2024',
    place: 'Ciego de Ávila',
    status: 'pending',
    date: '2024-01-20T09:00',
    inscriptionStart: '2024-01-02',
    inscriptionEnd: '2024-01-19',
    inscriptionCost: 0,
    visible: false,
  };

  let categories: CATEGORY[] = [];

  let editDialog = false;
  let addDialog = false;
  let deleteUserDialog = false;
  let deleteContestDialog = false;
  let deleteUserData: CONTESTANT | null = null;
  let selectedUser: CONTESTANT | null = null;
  let dropdownOpen = false;

  function exit() {
    navigate('/admin/contest');
  }

  function save() {
    let cnt = fromModel(contest, 'CONTEST');

    // console.log("CNT: ", cnt);
    // return;

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

    if ( cats.some(c => c.category.id === ct.id) ) {
      contest.categories = cats.filter(c => c.category.id != ct.id);
    } else {
      contest.categories = [ ...cats, { category: ct, rounds: 1 } ];
    }
  }

  function toggleSelectUser(ct: CATEGORY) {
    if ( !selectedUser ) return;

    let cats = selectedUser.categories;

    if ( cats.some(c => c.id === ct.id) ) {
      selectedUser.categories = cats.filter(c => c.id != ct.id);
    } else {
      selectedUser.categories = [...cats, ct];
    }
  }

  function handleUsers(ev: CustomEvent<USER[]>) {
    let current = contest.contestants;
    let newUsers: CONTESTANT[] = ev.detail.map((user) => ({
      user,
      categories: [],
      paid: false,
      paidAmount: 0
    }));

    contest.contestants = uniqueArray([
      ...current, ...newUsers
    ], e => e.user.id);
  }

  function deleteContestant(c: CONTESTANT) {
    deleteUserDialog = true;
    deleteUserData = c;
  }

  function handleDeleteUser() {
    deleteUserDialog = false;

    contest.contestants = contest.contestants.filter(ct => {
      return ct.user.id != deleteUserData?.user.id
    });
  }
  
  function handleDeleteContest() {
    deleteUserDialog = false;
    deleteContestDialog = false;

    removeContest(contest)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  function editUser(u: CONTESTANT) {
    selectedUser = {
      user: { ...u.user },
      categories: u.categories.map(ct => ({ ...ct })),
      paid: u.paid,
      paidAmount: u.paidAmount
    };

    editDialog = true;
  }

  function handleEditUser() {
    if ( !selectedUser ) return;

    let user = contest.contestants.find(c => c.user.username === selectedUser!.user.username) as CONTESTANT;
    user.categories = selectedUser.categories;
    contest = contest;
    editDialog = false;
  }

  onMount(() => {
    name != "new" && getContest(name)
      .then((res) => {
        if ( !res ) return;
        contest = res;
        contest.date = moment(contest.date).format('YYYY-MM-DDThh:mm');
        contest.inscriptionStart = moment(contest.inscriptionStart).format('YYYY-MM-DD');
        contest.inscriptionEnd = moment(contest.inscriptionEnd).format('YYYY-MM-DD');
        console.log("CONTEST: ", contest);
      })
      .catch(err => console.log("ERROR: ", err));

    getCategories()
      .then((res) => {
        if ( !res ) return;
        categories = res.results;
      })
      .catch((err) => console.log("ERROR: ", err));
  });
</script>

<Card class="mt-4 max-w-4xl w-[calc(100%-2rem)] mx-auto mb-8">
  <Heading class="text-3xl text-center">{ name === 'new' ? 'Crear competencia' : `Editar "${ contest.name }"`}</Heading>

  <form class="mt-8" on:submit|preventDefault={ save }>
    <!-- Datos / Competidores / Resultados -->
    <Tabs style="underline">
      <TabItem open>
        <div slot="title" class="flex items-center gap-2">
          <GridSolid size="sm"/> Datos
        </div>
        <div class="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
          <!-- Nombre -->
          <div>
            <Label for="name" class="mb-2">Nombre</Label>
            <Input bind:value={ contest.name } type="text" id="name" placeholder="Nombre..." required />
          </div>
          
          <!-- Lugar -->
          <div>
            <Label for="place" class="mb-2">Lugar</Label>
            <Input bind:value={ contest.place } type="text" id="place" placeholder="Lugar..." required />
          </div>
          
          <!-- Fecha -->
          <div>
            <Label for="date" class="mb-2">Fecha</Label>
            <Input bind:value={ contest.date } type="datetime-local" id="date" required />
          </div>
          
          <!-- Inicio de inscripcion -->
          <div>
            <Label for="inscription-start" class="mb-2">Inscripción (inicio)</Label>
            <Input bind:value={ contest.inscriptionStart } type="date" id="inscription-start" required />
          </div>
  
          <!-- Fin de inscripcion -->
          <div>
            <Label for="inscription-end" class="mb-2">Inscripción (fin)</Label>
            <Input bind:value={ contest.inscriptionEnd } type="date" id="inscription-end" required />
          </div>
          
          <!-- Costo de inscripcion -->
          <div>
            <Label for="inscription-cost" class="mb-2">Costo</Label>
            <Input bind:value={ contest.inscriptionCost } type="number" min={0} id="inscription-cost" required />
          </div>
  
          <!-- Estado -->
          <div>
            <Label class="mb-2">Estado</Label>
  
            <Button color="alternative" class="gap-2">
              <Indicator color={ getIndicatorColor(contest.status) }/> { getStatus(contest.status) } <ChevronDown />
            </Button>
            <Dropdown bind:open={ dropdownOpen }>
              {#each STATUS_ORDER as st}
                <DropdownItem on:click={ () => {
                  contest.status = st;
                  dropdownOpen = false;
                } }>
                  <div class="flex items-center gap-2"> <Indicator color={ getIndicatorColor(st) }/> { getStatus(st) } </div>
                </DropdownItem>
              {/each}
            </Dropdown>
          </div>
  
          <!-- Categorias -->
          <div>
            <Label class="mb-2">Categorías</Label>
  
            <div class="w-full flex flex-wrap gap-2">
              {#each categories as ct }
                <WcaCategory icon={ ct.scrambler } on:click={ () => toggleSelect(ct) } class="cursor-pointer"
                  selected={ !!contest.categories.find(cat => cat.category.id === ct.id) }/>
                <Tooltip>{ ct.name }</Tooltip>
              {/each}
            </div>
          </div>
  
          <!-- Visible -->
          <div class="flex items-center gap-2">
            <Label for="visible" class="cursor-pointer select-none">Visible</Label>
            <Checkbox class="cursor-pointer" id="visible" bind:checked={ contest.visible }/>
          </div>
  
          <!-- Rondas -->
          <div class="col-span-full grid place-items-center">
            <Label class="mb-2">Rondas</Label>
  
            <div class="w-full flex flex-wrap gap-4 justify-center">
              {#each contest.categories as ct }
                <div class="grid place-items-center">
                  <div>
                    <WcaCategory icon={ ct.category.scrambler } size="3rem"/>
                    <Tooltip>{ ct.category.name }</Tooltip>
                  </div>
  
                  <div class="flex items-center justify-between border gap-2 rounded-md">
                    <button class="p-1" type="button" on:click={ () => ct.rounds = Math.max(1, ct.rounds - 1) }>-</button>
                    <Span>{ ct.rounds }</Span>
                    <button class="p-1" type="button" on:click={ () => ct.rounds = Math.min(5, ct.rounds + 1) }>+</button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </TabItem>
      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <UserOutline size="sm"/> Competidores
        </div>

        <div class="w-full mb-4">
          <Button on:click={ () => addDialog = true }>
            <PlusIcon /> Añadir competidor
          </Button>
        </div>
  
        {#if contest.contestants.length }
          <Table hoverable striped shadow>
            <TableHead>
              <TableHeadCell>Nombre</TableHeadCell>
              <TableHeadCell>Usuario</TableHeadCell>
              <TableHeadCell>Categorías</TableHeadCell>
              <TableHeadCell>Pagó</TableHeadCell>
              <TableHeadCell>Inscripción</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableHead>
  
            <TableBody>
              {#each contest.contestants as c (c.user.username)}
                <TableBodyRow>
                  <TableBodyCell>{ c.user.name }</TableBodyCell>
                  <TableBodyCell>{ c.user.username }</TableBodyCell>
                  <TableBodyCell>
                    <div class="w-full flex flex-wrap gap-2">
                      {#each c.categories as ct}
                        <WcaCategory icon={ ct.scrambler }/>
                        <Tooltip>{ ct.name }</Tooltip>
                      {/each}
                    </div>
                  </TableBodyCell>
                  <TableBodyCell> <Toggle bind:checked={ c.paid }/> </TableBodyCell>
                  <TableBodyCell> <Input class="w-[4rem]" bind:value={ c.paidAmount }/> </TableBodyCell>
                  <TableBodyCell>
                    <Button on:click={ () => editUser(c) }><EditIcon /></Button>
                    <Tooltip>Editar categorías</Tooltip>
                    <Button on:click={ () => deleteContestant(c) } color="red"><DeleteIcon /></Button>
                    <Tooltip>Eliminar</Tooltip>
                  </TableBodyCell>
                </TableBodyRow>
              {/each}
            </TableBody>
          </Table>
  
          <div class="w-full mt-4">
            <Button on:click={ () => addDialog = true }>
              <PlusIcon /> Añadir competidor
            </Button>
          </div>
        {/if}
      </TabItem>
      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <ReceiptSolid size="sm"/> Resultados
        </div>
        Hola perros. Nada aún por aquí.
      </TabItem>
    </Tabs>

    <div class="col-span-full flex justify-center gap-2 mt-4">
      {#if name != 'new' }
        <Button color="red" on:click={ () => deleteContestDialog = true }>
          <TrashBinSolid size="sm"/> <Span class="ml-1">Eliminar</Span>
        </Button>
      {/if}
      
      <Button type="submit">
        <SaveIcon size="1rem"/> <Span class="ml-1">{ name === 'new' ? 'Crear' : 'Guardar' }</Span>
      </Button>
    </div>
  </form>
</Card>

<!-- ADD DIALOG -->
<SearchUser on:user={ handleUsers } bind:show={ addDialog }/>

<!-- EDIT USER DIALOG -->
<Modal title={`Categorías de ${ selectedUser?.user?.name }`} bind:open={ editDialog }>
  <div class="w-full flex flex-wrap items-center justify-center gap-2">
    {#each contest.categories as ct}
      <WcaCategory class="cursor-pointer" on:click={ () => toggleSelectUser(ct.category) } icon={ ct.category.scrambler }
        selected={ !!selectedUser?.categories?.find(cat => cat.id === ct.category.id) }/>
      <Tooltip>{ ct.category.name }</Tooltip>
    {/each}
  </div>

  <svelte:fragment slot="footer">
    <div class="flex mx-auto justify-center gap-4">
      <Button on:click={ () => editDialog = false } color="alternative">Cancelar</Button>
      <Button on:click={ handleEditUser }>Aceptar</Button>
    </div>
  </svelte:fragment>
</Modal>

<Modal bind:open={ deleteUserDialog } title="Eliminar competidor" size="xs">
  <Heading tag="h4" class="text-center">¿Desea eliminar a { deleteUserData?.user.name }?</Heading>

  <div class="flex mx-auto justify-center gap-4">
    <Button on:click={ () => deleteUserDialog = false } color="alternative">Cancelar</Button>
    <Button color="red" on:click={ handleDeleteUser }>
      <TrashBinSolid size="sm"/> <Span class="ml-1">Eliminar</Span>
    </Button>
  </div>
</Modal>

<Modal bind:open={ deleteContestDialog } outsideclose autoclose title="Eliminar Competencia" size="xs">
  <div class="flex flex-col items-center justify-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />

    <Heading tag="h4" class="text-center">¿Desea eliminar la competencia "{ contest.name }"?</Heading>

    <div class="flex gap-2 mt-4">
      <Button color="red" on:click={ handleDeleteContest }>
        <TrashBinSolid size="sm"/> <Span class="ml-1">Eliminar</Span>
      </Button>
      <Button color="alternative">Cancelar</Button>
    </div>
  </div>
</Modal>