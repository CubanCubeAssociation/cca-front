<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import { navigate } from "svelte-routing";
  import { STATUS_ORDER, type CATEGORY, type CONTEST, type USER, type CONTESTANT, type CONTEST_CATEGORY, type ROUND, type SOLVE, PENALTY } from "@interfaces";

  import { createContest, getCategories, getContest, removeContest, searchUser as searchUsers, updateContest } from "@helpers/API";

  import DeleteIcon from '@icons/Delete.svelte';
  import PlusIcon from '@icons/Plus.svelte';
  import SaveIcon from "@icons/Send.svelte";
  import EditIcon from "@icons/Pencil.svelte";
  import { getIndicatorColor, getStatus } from "@helpers/strings";
  import { clone, fromModel, uniqueArray } from "@helpers/object";
  import SearchUser from "../User/SearchUser.svelte";
  import { Button, Card, Checkbox, Dropdown, DropdownItem, Heading, Indicator, Input, Label, Modal, Span, TabItem, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Tabs, Toggle, Tooltip } from "flowbite-svelte";
  import { GridSolid, UserOutline, ReceiptSolid, TrashBinSolid, ExclamationCircleOutline, PenSolid, SearchSolid } from 'flowbite-svelte-icons';
  import ChevronDown from '@icons/ChevronDown.svelte';
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { sTimer, timer } from "@helpers/timer";
  import { getContestAverage } from "@helpers/statistics";

  export let name: string = 'new';

  let contest: CONTEST = {
    categories: [],
    contestants: [],
    rounds: [],
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

  let round: ROUND;

  let categories: CATEGORY[] = [];

  let editDialog = false;
  let addDialog = false;
  let addResult = false;
  let deleteUserDialog = false;
  let deleteContestDialog = false;
  let deleteUserData: CONTESTANT | null = null;
  let selectedUser: CONTESTANT | null = null;
  let dropdownOpen = false;
  let dropdownCategories = false;
  let dropdownRounds = false;
  let dropdownUsers = false;
  let roundGroup: ROUND[][] = [];

  function exit() {
    navigate('/admin/contest');
  }

  function save() {
    // console.log("CONTEST: ", contest);

    let cnt = fromModel(contest, 'CONTEST');

    console.log("CNT: ", cnt);
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

  function prepareResult() {
    let isCategory = contest.contestants.some(ct => ct.categories.length);

    if ( !isCategory ) {
      console.log('Add category to some user');
      return;
    }

    round = {
      contestant: contest.contestants.find(c =>
        c.categories.some(ct => ct.id === contest.categories[0].category.id)
      )!.user,
      category: contest.categories[0].category,
      round: 1,
      t1: { extra: -1, isExtra: false, penaltyDetails: '', reconstruction: '', time: 'DNS', penaltyType: PENALTY.NONE },
      t2: { extra: -1, isExtra: false, penaltyDetails: '', reconstruction: '', time: 'DNS', penaltyType: PENALTY.NONE },
      t3: { extra: -1, isExtra: false, penaltyDetails: '', reconstruction: '', time: 'DNS', penaltyType: PENALTY.NONE },
      t4: { extra: -1, isExtra: false, penaltyDetails: '', reconstruction: '', time: 'DNS', penaltyType: PENALTY.NONE },
      t5: { extra: -1, isExtra: false, penaltyDetails: '', reconstruction: '', time: 'DNS', penaltyType: PENALTY.NONE },
      e1: { extra: -1, isExtra: true, penaltyDetails: '', reconstruction: '', time: 'DNS', penaltyType: PENALTY.NONE },
      e2: { extra: -1, isExtra: true, penaltyDetails: '', reconstruction: '', time: 'DNS', penaltyType: PENALTY.NONE },
      average: 0
    };

    addResult = true;
  }

  function getInputColor(s: SOLVE) {
    let t = s.time;

    if ( t === '' || /^([1-9]\d*|DNF|DNS)$/.test(t) ) {
      s.penaltyType = t === 'DNS' ? PENALTY.DNS : t === 'DNF' ? PENALTY.DNF : PENALTY.NONE;
      return 'base';
    }
    
    return 'red';
  }

  function getRounds(ct: CATEGORY) {
    let cct = contest.categories.find(c => c.category.id === ct.id);
    return new Array( cct ? cct.rounds : 5 ).fill(0).map((_, p) => p + 1);
  }

  function sortSolves(rnd: ROUND[]) {
    return rnd.sort((a, b) => {
      if ( a.category.id != b.category.id ) {
        return a.category.name < b.category.name ? -1 : 1;
      }
      
      if ( a.round != b.round ) {
        return a.round - b.round;
      }

      if ( a.average != b.average ) {
        return a.average - b.average;
      }

      return a.contestant.name < b.contestant.name ? -1 : 1;
    });
  }

  function setRounds(rnds: ROUND[]) {
    rnds.forEach((rnd) => {
      rnd.average = getContestAverage(
        [rnd.t1, rnd.t2, rnd.t3, rnd.t4, rnd.t5, rnd.e1, rnd.e2],
        (rnd.category.scrambler === '666wca' || rnd.category.scrambler === '777wca') ? 'Mo3' : 'Ao5'
      );
    });

    contest.rounds = sortSolves(rnds);
    roundGroup.length = 0;

    for (let i = 0, p = -1, maxi = rnds.length; i < maxi; i += 1) {
      if ( i === 0 || (i > 0 && rnds[i].category.id != rnds[i - 1].category.id ) ) {
        p += 1;
        roundGroup[p] = [];
      }

      roundGroup[p].push( rnds[i] );
    }

    roundGroup = roundGroup;
  }

  function saveResult() {
    let rnds = ([ ...contest.rounds, clone(round) ] as ROUND[]);
    setRounds(rnds);
    addResult = false;
  }

  function validateRound(rnd: ROUND) {
    let len = ['666wca', '777wca'].indexOf( rnd.category.scrambler ) > -1 ? 3 : 5;
    return [ rnd.t1, rnd.t2, rnd.t3 ,rnd.t4, rnd.t5 ].slice(0, len).every(t => t.time && getInputColor(t) === 'base');
  }

  onMount(() => {
    name != "new" && getContest(name)
      .then((res) => {
        if ( !res ) return;
        contest = res;
        contest.date = moment(contest.date).format('YYYY-MM-DDThh:mm');
        contest.inscriptionStart = moment(contest.inscriptionStart).format('YYYY-MM-DD');
        contest.inscriptionEnd = moment(contest.inscriptionEnd).format('YYYY-MM-DD');
        
        setRounds( sortSolves(contest.rounds) );

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

<Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8">
  <Heading class="text-3xl text-center">{ name === 'new' ? 'Crear competencia' : `Editar "${ contest.name }"`}</Heading>

  <form class="mt-8" on:submit|preventDefault={ save }>
    <!-- Datos / Competidores / Resultados -->
    <Tabs style="underline">
      <TabItem open>
        <div slot="title" class="flex items-center gap-2">
          <GridSolid size="sm"/> Datos
        </div>
        <div class="grid gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
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
            <!-- <Checkbox class="cursor-pointer" bind:checked={ contest.visible }/> -->
            <Toggle class="cursor-pointer" bind:checked={ contest.visible }/>
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
                    <Button class="p-2" on:click={ () => editUser(c) }><EditIcon /></Button>
                    <Tooltip>Editar categorías</Tooltip>
                    <Button class="p-2" on:click={ () => deleteContestant(c) } color="red"><DeleteIcon /></Button>
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
      {#if name != 'new'}
        <TabItem>
          <div slot="title" class="flex items-center gap-2">
            <ReceiptSolid size="sm"/> Resultados
          </div>
          
          <div class="w-full mb-4">
            <Button on:click={ prepareResult }>
              <PlusIcon /> Agregar resultado
            </Button>
          </div>

          {#if roundGroup.length > 0 }
            {#each roundGroup as rounds}
              <Heading tag="h2" class="flex items-center justify-center gap-2 my-4">
                <WcaCategory icon={ rounds[0].category.scrambler } size="1.5rem"/> { rounds[0].category.name }
              </Heading>

              <Table striped hoverable shadow>
                <TableHead>
                  <TableHeadCell>Nombre</TableHeadCell>
                  <TableHeadCell>Categoría</TableHeadCell>
                  <TableHeadCell>Ronda</TableHeadCell>
                  <TableHeadCell>T1</TableHeadCell>
                  <TableHeadCell>T2</TableHeadCell>
                  <TableHeadCell>T3</TableHeadCell>
                  
                  {#if ['666wca', '777wca'].indexOf(rounds[0].category.scrambler) > -1 }
                    <TableHeadCell>Mo3</TableHeadCell>
                  {:else}
                    <TableHeadCell>T4</TableHeadCell>
                    <TableHeadCell>T5</TableHeadCell>
                    <TableHeadCell>Ao5</TableHeadCell>
                  {/if}
                </TableHead>
  
                <TableBody>
                  {#each rounds as rnd, p}
                    <TableBodyRow>
                      <TableBodyCell>{ rnd.contestant.name }</TableBodyCell>
                      <TableBodyCell>
                        <div class="flex items-center gap-2">
                          <WcaCategory icon={ rnd.category.scrambler } size="1rem"/> { rnd.category.name }
                        </div>
                      </TableBodyCell>
                      <TableBodyCell>{ rnd.round }</TableBodyCell>
                      
                      <TableBodyCell>{ sTimer(rnd.t1, true) }</TableBodyCell>
                      <TableBodyCell>{ sTimer(rnd.t2, true) }</TableBodyCell>
                      <TableBodyCell>{ sTimer(rnd.t3, true) }</TableBodyCell>

                      {#if ['666wca', '777wca'].indexOf(rounds[0].category.scrambler) < 0}
                        <TableBodyCell>{ sTimer(rnd.t4, true) }</TableBodyCell>
                        <TableBodyCell>{ sTimer(rnd.t5, true) }</TableBodyCell>
                      {/if}
  
                      <TableBodyCell>{ timer(rnd.average, true) }</TableBodyCell>
                    </TableBodyRow>
                  {/each}
                </TableBody>
              </Table>
            {/each}

            <div class="w-full mt-4">
              <Button on:click={ prepareResult }>
                <PlusIcon /> Agregar resultado
              </Button>
            </div>
          {/if}
        </TabItem>
      {/if}
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
<SearchUser multiple={ true } on:user={ handleUsers } bind:show={ addDialog }/>

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

<!-- ADD RESULT -->
<Modal title="Agregar resultado" bind:open={ addResult }>
  <div class="flex items-center justify-center gap-2">
    <Button color="alternative" class="gap-2">
      <WcaCategory size="1rem" icon={round.category.scrambler}/> { round.category.name }
    </Button>
  
    <Dropdown placement="right" bind:open={ dropdownCategories }>
      {#each contest.categories as ct}
        <DropdownItem on:click={ () => {
          dropdownCategories = false;
          round.category = ct.category;
        } }>
          <div class="flex gap-2 items-center"><WcaCategory size="1rem" icon={ ct.category.scrambler }/> { ct.category.name }</div>
        </DropdownItem>
      {/each}
    </Dropdown>
  
    <Button color="alternative" class="gap-2">
      Ronda: { round.round }
    </Button>
  
    <Dropdown placement="right" bind:open={ dropdownRounds }>
      {#each getRounds(round.category) as r}
        <DropdownItem on:click={ () => {
          dropdownRounds = false;
          round.round = r;
        } }> { r } </DropdownItem>
      {/each}
    </Dropdown>

    <Button color="alternative" class="gap-2">
      Competidor: { round.contestant.name }
    </Button>
  
    <Dropdown placement="bottom" bind:open={ dropdownUsers }>
      {#each contest.contestants.filter(c => c.categories.some(ct => ct.id === round.category.id)) as cnt}
        <DropdownItem on:click={ () => {
          dropdownUsers = false;
          round.contestant = cnt.user;
        } }> { cnt.user.name } </DropdownItem>
      {/each}
    </Dropdown>
  </div>

  <Table shadow>
    <TableHead>
      <TableHeadCell>T1</TableHeadCell>
      <TableHeadCell>T2</TableHeadCell>
      <TableHeadCell>T3</TableHeadCell>

      {#if ['666wca', '777wca'].indexOf(round.category.scrambler) < 0 }
        <TableHeadCell>T4</TableHeadCell>
        <TableHeadCell>T5</TableHeadCell>
      {/if}
    </TableHead>
    <TableBody>
      <TableBodyRow>
        {#each [ round.t1, round.t2, round.t3, round.t4, round.t5 ].slice(
          0, ['666wca', '777wca'].indexOf(round.category.scrambler) < 0 ? 5 : 3
        ) as s }
          <TableBodyCell>
            <div class="grid place-items-center gap-2">
              <Input bind:value={ s.time } class="w-[4rem]" color={ getInputColor(s) }/>
              { sTimer(s, true, true) }
            </div>
          </TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>

  <svelte:fragment slot="footer">
    <div class="flex mx-auto justify-center gap-4">
      <Button on:click={ () => addResult = false } color="alternative">Cancelar</Button>
      <Button disabled={ !validateRound(round) } on:click={ saveResult }>Aceptar</Button>
    </div>
  </svelte:fragment>
</Modal>

<!-- DELETE CONTESTANT -->
<Modal bind:open={ deleteUserDialog } title="Eliminar competidor" size="xs">
  <Heading tag="h4" class="text-center">¿Desea eliminar a { deleteUserData?.user.name }?</Heading>

  <div class="flex mx-auto justify-center gap-4">
    <Button on:click={ () => deleteUserDialog = false } color="alternative">Cancelar</Button>
    <Button color="red" on:click={ handleDeleteUser }>
      <TrashBinSolid size="sm"/> <Span class="ml-1">Eliminar</Span>
    </Button>
  </div>
</Modal>

<!-- DELETE CONTEST -->
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