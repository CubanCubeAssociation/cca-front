<script lang="ts">
  import { onMount } from "svelte";
  import moment from "moment";
  import {
    type CATEGORY,
    type CONTEST,
    type USER,
    type CONTESTANT,
    type ROUND,
    type SOLVE,
    PENALTY,
    STATUS_ORDER,
    type CONTEST_CATEGORY,
  } from "@interfaces";

  import {
    createContest,
    getCategories,
    getContest,
    redirectOnUnauthorized,
    removeContest,
    updateContest,
  } from "@helpers/API";

  import DeleteIcon from "@icons/Delete.svelte";
  import PlusIcon from "@icons/Plus.svelte";
  import SaveIcon from "@icons/Send.svelte";
  import EditIcon from "@icons/Pencil.svelte";
  import { getIndicatorColor, getStatus, randomUUID } from "@helpers/strings";
  import { clone, fromModel, uniqueArray } from "@helpers/object";
  import SearchUser from "$lib/components/SearchUser.svelte";
  import {
    Button,
    Card,
    Checkbox,
    Heading,
    Indicator,
    Input,
    Label,
    Modal,
    Span,
    TabItem,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tabs,
    Toggle,
    Tooltip,
  } from "flowbite-svelte";
  import {
    GridSolid,
    UserOutline,
    ReceiptSolid,
    TrashBinSolid,
    ExclamationCircleOutline,
  } from "flowbite-svelte-icons";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { sTimer } from "@helpers/timer";
  import { getRoundsInfo } from "@helpers/statistics";
  import ResultView from "@components/ResultView.svelte";
  import Select from "@components/Select.svelte";
  import { NotificationService } from "@stores/notification.service";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  let name = "";
  const notification = NotificationService.getInstance();
  const debug = false;

  let contest: CONTEST = {
    categories: [],
    contestants: [],
    rounds: [],
    id: "",
    name: "",
    place: "",
    status: "pending",
    date: "",
    inscriptionStart: "",
    inscriptionEnd: "",
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
  let deleteRoundDialog = false;
  let deleteUserData: CONTESTANT | null = null;
  let selectedUser: CONTESTANT | null = null;
  let roundGroup: ROUND[][][] = [];
  let checked: boolean[] = [];
  let bundleAction = "Agregar categoría";
  let bundleCategory: CONTEST_CATEGORY;

  function exit() {
    goto("/admin/contest");
  }

  function save(ev: Event) {
    ev.preventDefault();
    let cnt = fromModel(contest, "CONTEST");

    if (name != "new") {
      updateContest(cnt, contest.id)
        .then(() => {
          notification.addNotification({
            key: randomUUID(),
            header: "Guardado",
            text: "Se guardó la competencia.",
            timeout: 2000,
          });
        })
        .catch(err => {
          if (debug) console.log("ERROR: ", err);
          notification.addNotification({
            key: randomUUID(),
            header: "Error",
            text: "Hubo un error al guardar la competencia.",
            timeout: 2000,
          });
        });
    } else {
      createContest(cnt)
        .then((c: CONTEST) => {
          goto("/admin/contest/" + c.name);
        })
        .catch(err => {
          if (debug) console.log("ERROR: ", err);
        });
    }
  }

  function toggleSelect(ct: CATEGORY) {
    let cats = contest.categories;

    if (cats.some(c => c.category.id === ct.id)) {
      contest.categories = cats.filter(c => c.category.id != ct.id);
    } else {
      contest.categories = [...cats, { category: ct, rounds: 1 }];
    }
  }

  function toggleSelectUser(ct: CATEGORY) {
    if (!selectedUser) return;

    let cats = selectedUser.categories;

    if (cats.some(c => c.id === ct.id)) {
      selectedUser.categories = cats.filter(c => c.id != ct.id);
    } else {
      selectedUser.categories = [...cats, ct];
    }
  }

  function handleUsers(ev: USER | USER[]) {
    if (!Array.isArray(ev)) return;

    let current = contest.contestants;
    let newUsers: CONTESTANT[] = ev.map(user => ({
      user,
      categories: [],
      paid: false,
      paidAmount: 0,
    }));

    contest.contestants = uniqueArray([...current, ...newUsers], e => e.user.id);
  }

  function deleteContestant(c: CONTESTANT) {
    deleteUserDialog = true;
    deleteUserData = c;
  }

  function handleDeleteUser() {
    deleteUserDialog = false;

    contest.contestants = contest.contestants.filter(ct => {
      return ct.user.id != deleteUserData?.user.id;
    });
  }

  function handleDeleteContest() {
    deleteUserDialog = false;
    deleteContestDialog = false;

    removeContest(contest)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  function handleDeleteRound() {
    contest.rounds = contest.rounds.filter(rnd => rnd.id != round.id);
    updateRoundInfo(contest.rounds);
    addResult = false;
    deleteRoundDialog = false;
  }

  function editUser(u: CONTESTANT) {
    selectedUser = {
      user: { ...u.user },
      categories: u.categories.map(ct => ({ ...ct })),
      paid: u.paid,
      paidAmount: u.paidAmount,
    };

    editDialog = true;
  }

  function handleEditUser() {
    if (!selectedUser) return;

    let user = contest.contestants.find(
      c => c.user.username === selectedUser!.user.username
    ) as CONTESTANT;
    user.categories = selectedUser.categories;
    contest = contest;
    editDialog = false;
  }

  function handleEditRound(ev: any) {
    round = { ...ev.detail };
    addResult = true;
  }

  function getRoundLimits(rounds: number) {
    return [Infinity, ...[6, 12, 24, 48].slice(0, rounds - 1).reverse()];
  }

  function prepareResult() {
    if (contest.categories.length === 0) {
      if (debug) console.log("Add some categories");
      return;
    }

    let isCategory = contest.contestants.some(ct => ct.categories.length);

    if (!isCategory) {
      if (debug) console.log("Add category to some user");
      return;
    }

    let { categories } = contest;

    for (let j = 0, maxj = categories.length; j < maxj; j += 1) {
      let cat = categories[j].category.id;

      for (let r = 1, maxr = categories[j].rounds; r <= maxr; r += 1) {
        let contestants = getContestants(cat, r);

        if (contestants.length === 0) continue;
        const cnt = contestants[0];

        round = {
          contestant: cnt.user,
          category: categories[j].category,
          round: r,
          t1: {
            extra: -1,
            isExtra: false,
            penaltyDetails: "",
            reconstruction: "",
            time: "",
            penaltyType: PENALTY.NONE,
          },
          t2: {
            extra: -1,
            isExtra: false,
            penaltyDetails: "",
            reconstruction: "",
            time: "",
            penaltyType: PENALTY.NONE,
          },
          t3: {
            extra: -1,
            isExtra: false,
            penaltyDetails: "",
            reconstruction: "",
            time: "",
            penaltyType: PENALTY.NONE,
          },
          t4: {
            extra: -1,
            isExtra: false,
            penaltyDetails: "",
            reconstruction: "",
            time: "",
            penaltyType: PENALTY.NONE,
          },
          t5: {
            extra: -1,
            isExtra: false,
            penaltyDetails: "",
            reconstruction: "",
            time: "",
            penaltyType: PENALTY.NONE,
          },
          e1: {
            extra: -1,
            isExtra: true,
            penaltyDetails: "",
            reconstruction: "",
            time: "",
            penaltyType: PENALTY.NONE,
          },
          e2: {
            extra: -1,
            isExtra: true,
            penaltyDetails: "",
            reconstruction: "",
            time: "",
            penaltyType: PENALTY.NONE,
          },
          id: "",
          average: 0,
        };

        addResult = true;
        return;
      }
    }
  }

  function getInputColor(s: SOLVE) {
    let t = s.time;

    if (t === "" || /^([1-9]\d*|DNF|DNS)$/.test(t)) {
      s.penaltyType = t === "DNS" ? PENALTY.DNS : t === "DNF" ? PENALTY.DNF : PENALTY.NONE;
      return "base";
    }

    return "red";
  }

  function getRounds(ct: CATEGORY) {
    let cct = contest.categories.find(c => c.category.id === ct.id);
    return new Array(cct ? cct.rounds : 5).fill(0).map((_, p) => p + 1);
  }

  function getContestants(catId: string, roundNum: number): CONTESTANT[] {
    const limit = getRoundLimits(
      contest.categories.filter(ct => ct.category.id === catId)[0].rounds
    )[roundNum - 1];

    if (roundNum === 1) {
      return contest.contestants.filter(
        c =>
          c.categories.some(ct => ct.id === catId) &&
          !roundGroup.some(r =>
            r.some(rnd =>
              rnd.some(
                rres =>
                  rres.category.id === catId &&
                  rres.round === roundNum &&
                  c.user.id === rres.contestant.id
              )
            )
          )
      );
    }

    const flatRounds = roundGroup.flat(5);
    const currentRound = flatRounds.filter(
      rnd => rnd.category.id === catId && rnd.round === roundNum
    );
    const podium = flatRounds
      .filter(rnd => rnd.category.id === catId && rnd.round === roundNum - 1)
      .slice(0, limit)
      .filter(rnd => currentRound.every(round => round.contestant.id != rnd.contestant.id));

    return podium.map(p => contest.contestants.find(cnt => cnt.user.id === p.contestant.id)!);
  }

  function updateRoundInfo(rnds: ROUND[]) {
    let roundInfo = getRoundsInfo(rnds);
    contest.rounds = roundInfo.rounds;
    roundGroup = roundInfo.roundGroup;
  }

  function saveResult() {
    let rnds: ROUND[] = [];

    if (round.id) {
      rnds = contest.rounds.map(rnd => (rnd.id === round.id ? round : rnd));
    } else {
      rnds = [...contest.rounds, clone(round)];
    }

    updateRoundInfo(rnds);
    addResult = false;
  }

  function validateRound(rnd: ROUND) {
    let len = ["666wca", "777wca"].indexOf(rnd.category.scrambler) > -1 ? 3 : 5;
    return [rnd.t1, rnd.t2, rnd.t3, rnd.t4, rnd.t5]
      .slice(0, len)
      .every(t => t.time && getInputColor(t) === "base");
  }

  onMount(() => {
    name = $page.params.name;

    if (name != "new") {
      getContest(name)
        .then(res => {
          if (!res) return;
          contest = res;
          if (debug) console.log("CONTEST: ", res);
          contest.date = moment.utc(contest.date).format("YYYY-MM-DDThh:mm");
          contest.inscriptionStart = moment(contest.inscriptionStart).format("YYYY-MM-DD");
          contest.inscriptionEnd = moment(contest.inscriptionEnd).format("YYYY-MM-DD");
          checked = contest.contestants.map(() => false);

          updateRoundInfo(contest.rounds);
        })
        .catch(err => console.log("ERROR: ", err));
    }

    getCategories()
      .then(res => {
        if (!res) return;
        categories = res.results.sort((a, b) => (a.name < b.name ? -1 : 1));
      })
      .catch(redirectOnUnauthorized);
  });
</script>

<svelte:head>
  <title>{contest.name} - CCA</title>
</svelte:head>

<Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8">
  <Heading class="text-3xl text-center"
    >{name === "new" ? "Crear competencia" : `Editar "${contest.name}"`}</Heading
  >

  <form class="mt-8" onsubmit={save}>
    <Tabs style="underline" contentClass="dark:bg-gray-800 mt-4">
      <!-- Datos -->
      <TabItem open>
        <div slot="title" class="flex items-center gap-2">
          <GridSolid size="sm" /> Datos
        </div>
        <div class="grid gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
          <!-- Nombre -->
          <div>
            <Label for="name" class="mb-2">Nombre</Label>
            <Input
              bind:value={contest.name}
              type="text"
              id="name"
              placeholder="Nombre..."
              required
            />
          </div>

          <!-- Lugar -->
          <div>
            <Label for="place" class="mb-2">Lugar</Label>
            <Input
              bind:value={contest.place}
              type="text"
              id="place"
              placeholder="Lugar..."
              required
            />
          </div>

          <!-- Fecha -->
          <div>
            <Label for="date" class="mb-2">Fecha</Label>
            <Input bind:value={contest.date} type="datetime-local" id="date" required />
          </div>

          <!-- Inicio de inscripcion -->
          <div>
            <Label for="inscription-start" class="mb-2">Inscripción (inicio)</Label>
            <Input
              bind:value={contest.inscriptionStart}
              type="date"
              id="inscription-start"
              required
            />
          </div>

          <!-- Fin de inscripcion -->
          <div>
            <Label for="inscription-end" class="mb-2">Inscripción (fin)</Label>
            <Input bind:value={contest.inscriptionEnd} type="date" id="inscription-end" required />
          </div>

          <!-- Costo de inscripcion -->
          <div>
            <Label for="inscription-cost" class="mb-2">Costo</Label>
            <Input
              bind:value={contest.inscriptionCost}
              type="number"
              min={0}
              id="inscription-cost"
              required
            />
          </div>

          <!-- Estado -->
          <div>
            <Label class="mb-2">Estado</Label>

            <Select
              items={STATUS_ORDER}
              bind:value={contest.status}
              transform={e => e}
              label={e => getStatus(e)}
              hasIcon={e => getIndicatorColor(e)}
              iconComponent={Indicator}
              iconKey="color"
              iconSize={null}
            />
          </div>

          <!-- Categorias -->
          <div>
            <Label class="mb-2">Categorías</Label>

            <div class="w-full flex flex-wrap gap-2">
              {#each categories as ct}
                <button onclick={() => toggleSelect(ct)}>
                  <WcaCategory
                    icon={ct.scrambler}
                    class="cursor-pointer"
                    selected={!!contest.categories.find(cat => cat.category.id === ct.id)}
                  />
                </button>
                <Tooltip>{ct.name}</Tooltip>
              {/each}
            </div>
          </div>

          <!-- Visible -->
          <div class="flex items-center gap-2">
            <Label for="visible" class="cursor-pointer select-none">Visible</Label>
            <Toggle class="cursor-pointer" bind:checked={contest.visible} />
          </div>

          <!-- Rondas -->
          <div class="col-span-full grid place-items-center">
            <Label class="mb-2">Rondas</Label>

            <div class="w-full flex flex-wrap gap-4 justify-center">
              {#each contest.categories as ct}
                <div class="grid place-items-center">
                  <div>
                    <WcaCategory icon={ct.category.scrambler} size="3rem" />
                    <Tooltip>{ct.category.name}</Tooltip>
                  </div>

                  <div class="flex items-center justify-between border gap-2 rounded-md">
                    <button
                      class="p-1"
                      type="button"
                      onclick={() => (ct.rounds = Math.max(1, ct.rounds - 1))}>-</button
                    >
                    <Span>{ct.rounds}</Span>
                    <button
                      class="p-1"
                      type="button"
                      onclick={() => (ct.rounds = Math.min(5, ct.rounds + 1))}>+</button
                    >
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </TabItem>

      <!-- Competidores -->
      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <UserOutline size="sm" /> Competidores
        </div>

        <div class="w-full mb-4 flex items-center gap-2">
          <Button on:click={() => (addDialog = true)}>
            <PlusIcon /> Añadir competidor
          </Button>

          {#if checked.some(e => e)}
            <Select
              bind:value={bundleAction}
              items={["Agregar categoría", "Remover categoría"]}
              transform={e => e}
            />
            <Select
              bind:value={bundleCategory}
              items={contest.categories}
              transform={e => e}
              label={e => e.category.name}
            />
            <Button
              color="purple"
              on:click={() => {
                let users = contest.contestants.filter((_, p) => checked[p]);

                if (bundleAction.startsWith("Agregar")) {
                  users.forEach(user => {
                    user.categories = [
                      ...user.categories.filter(cat => cat.id != bundleCategory.category.id),
                      bundleCategory.category,
                    ];
                  });
                } else {
                  users.forEach(user => {
                    user.categories = user.categories.filter(
                      cat => cat.id != bundleCategory.category.id
                    );
                  });
                }

                contest = contest;
              }}>Aplicar</Button
            >
          {/if}
        </div>

        {#if contest.contestants.length}
          <Table hoverable shadow divClass="w-full relative overflow-x-auto">
            <TableHead>
              <TableHeadCell></TableHeadCell>
              <TableHeadCell>Nombre</TableHeadCell>
              <TableHeadCell>Usuario</TableHeadCell>
              <TableHeadCell>Categorías</TableHeadCell>
              <TableHeadCell>Pagó</TableHeadCell>
              <TableHeadCell>Inscripción</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableHead>

            <TableBody>
              {#each contest.contestants as c, p (c.user.username)}
                <TableBodyRow>
                  <TableBodyCell
                    ><Checkbox
                      bind:checked={checked[p]}
                      on:change={() => (checked = checked)}
                    /></TableBodyCell
                  >
                  <TableBodyCell>{c.user.name}</TableBodyCell>
                  <TableBodyCell>{c.user.username}</TableBodyCell>
                  <TableBodyCell>
                    <div class="w-full flex flex-wrap gap-2">
                      {#each c.categories as ct}
                        <WcaCategory icon={ct.scrambler} />
                        <Tooltip>{ct.name}</Tooltip>
                      {/each}
                    </div>
                  </TableBodyCell>
                  <TableBodyCell>
                    <Toggle bind:checked={c.paid} />
                  </TableBodyCell>
                  <TableBodyCell>
                    <Input class="w-[4rem]" bind:value={c.paidAmount} />
                  </TableBodyCell>
                  <TableBodyCell>
                    <Button class="p-2" on:click={() => editUser(c)}><EditIcon /></Button>
                    <Tooltip>Editar categorías</Tooltip>
                    <Button class="p-2" on:click={() => deleteContestant(c)} color="red"
                      ><DeleteIcon /></Button
                    >
                    <Tooltip>Eliminar</Tooltip>
                  </TableBodyCell>
                </TableBodyRow>
              {/each}
            </TableBody>
          </Table>

          <div class="w-full mt-4">
            <Button on:click={() => (addDialog = true)}>
              <PlusIcon /> Añadir competidor
            </Button>
          </div>
        {/if}
      </TabItem>

      <!-- Resultados -->
      {#if name != "new"}
        <TabItem>
          <div slot="title" class="flex items-center gap-2">
            <ReceiptSolid size="sm" /> Resultados
          </div>

          <div class="w-full mb-4">
            <Button on:click={prepareResult}>
              <PlusIcon /> Agregar resultado
            </Button>
          </div>

          {#if roundGroup.length > 0}
            <ResultView {roundGroup} on:edit={handleEditRound} allowEdit />

            <div class="w-full mt-4">
              <Button on:click={prepareResult}>
                <PlusIcon /> Agregar resultado
              </Button>
            </div>
          {/if}
        </TabItem>
      {/if}
    </Tabs>

    <div class="col-span-full flex justify-center gap-2 mt-16">
      {#if name != "new"}
        <Button color="red" on:click={() => (deleteContestDialog = true)}>
          <TrashBinSolid size="sm" />
          <Span class="ml-1">Eliminar</Span>
        </Button>
      {/if}

      <Button type="submit">
        <SaveIcon size="1rem" />
        <Span class="ml-1">{name === "new" ? "Crear" : "Guardar"}</Span>
      </Button>
    </div>
  </form>
</Card>

<!-- ADD DIALOG -->
<SearchUser multiple={true} user={handleUsers} bind:show={addDialog} />

<!-- EDIT USER DIALOG -->
<Modal title={`Categorías de ${selectedUser?.user?.name}`} bind:open={editDialog}>
  <div class="w-full flex flex-wrap items-center justify-center gap-2">
    {#each contest.categories as ct}
      <button onclick={() => toggleSelectUser(ct.category)}>
        <WcaCategory
          class="cursor-pointer"
          icon={ct.category.scrambler}
          selected={!!selectedUser?.categories?.find(cat => cat.id === ct.category.id)}
        />
      </button>
      <Tooltip>{ct.category.name}</Tooltip>
    {/each}
  </div>

  <svelte:fragment slot="footer">
    <div class="flex mx-auto justify-center gap-4">
      <Button on:click={() => (editDialog = false)} color="alternative">Cancelar</Button>
      <Button on:click={handleEditUser}>Aceptar</Button>
    </div>
  </svelte:fragment>
</Modal>

<!-- ADD RESULT -->
<Modal title="Agregar resultado" bind:open={addResult}>
  <div class="flex items-center justify-center gap-2">
    {#if round.id}
      <Button color="alternative" class={"gap-1 h-9 py-1 px-2"} disabled>
        {round.category.name}
      </Button>
      <Button color="alternative" class={"gap-1 h-9 py-1 px-2"} disabled>
        {round.round}
      </Button>
      <Button color="alternative" class={"gap-1 h-9 py-1 px-2"} disabled>
        {round.contestant.name}
      </Button>
    {:else}
      <Select
        bind:value={round.category}
        items={contest.categories}
        hasIcon={ct => ct.category.scrambler}
        transform={ct => ct.category}
        label={ct => ct.category.name}
        onChange={() => (round.round = 1)}
      />

      <Select
        bind:value={round.round}
        items={getRounds(round.category)}
        transform={e => e}
        label={r => `Ronda ${r}`}
      />

      {#if getContestants(round.category.id, round.round).length > 0}
        <Select
          bind:value={round.contestant}
          items={getContestants(round.category.id, round.round)}
          transform={cnt => cnt.user}
          label={cnt => cnt.user.name}
        />
      {/if}
    {/if}
  </div>

  <Table hoverable shadow divClass="w-full relative overflow-x-auto">
    <TableHead>
      <TableHeadCell>T1</TableHeadCell>
      <TableHeadCell>T2</TableHeadCell>
      <TableHeadCell>T3</TableHeadCell>

      {#if ["666wca", "777wca"].indexOf(round.category.scrambler) < 0}
        <TableHeadCell>T4</TableHeadCell>
        <TableHeadCell>T5</TableHeadCell>
      {/if}
    </TableHead>
    <TableBody>
      <TableBodyRow>
        {#each [round.t1, round.t2, round.t3, round.t4, round.t5].slice(0, ["666wca", "777wca"].indexOf(round.category.scrambler) < 0 ? 5 : 3) as s}
          <TableBodyCell>
            <div class="grid place-items-center gap-2">
              <Input bind:value={s.time} class="w-[4rem]" color={getInputColor(s)} />
              {sTimer(s, true, true)}
            </div>
          </TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>

  <svelte:fragment slot="footer">
    <div class="flex mx-auto justify-center gap-4">
      {#if round.id}
        <Button on:click={() => (deleteRoundDialog = true)} color="red">Eliminar</Button>
      {/if}

      <Button on:click={() => (addResult = false)} color="alternative">Cancelar</Button>
      <Button disabled={!validateRound(round)} on:click={saveResult}>Aceptar</Button>
    </div>
  </svelte:fragment>
</Modal>

<!-- DELETE CONTESTANT -->
<Modal bind:open={deleteUserDialog} title="Eliminar competidor" size="xs">
  <Heading tag="h4" class="text-center">¿Desea eliminar a {deleteUserData?.user.name}?</Heading>

  <div class="flex mx-auto justify-center gap-4">
    <Button on:click={() => (deleteUserDialog = false)} color="alternative">Cancelar</Button>
    <Button color="red" on:click={handleDeleteUser}>
      <TrashBinSolid size="sm" />
      <Span class="ml-1">Eliminar</Span>
    </Button>
  </div>
</Modal>

<!-- DELETE CONTEST -->
<Modal
  bind:open={deleteContestDialog}
  outsideclose
  autoclose
  title="Eliminar competencia"
  size="xs"
>
  <div class="flex flex-col items-center justify-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />

    <Heading tag="h4" class="text-center">¿Desea eliminar la competencia "{contest.name}"?</Heading>

    <div class="flex gap-2 mt-4">
      <Button color="red" on:click={handleDeleteContest}>
        <TrashBinSolid size="sm" />
        <Span class="ml-1">Eliminar</Span>
      </Button>
      <Button color="alternative">Cancelar</Button>
    </div>
  </div>
</Modal>

<!-- DELETE ROUND -->
<Modal bind:open={deleteRoundDialog} title="Eliminar ronda" size="xs">
  <Heading tag="h4" class="text-center">¿Desea eliminar la ronda?</Heading>

  <div class="flex mx-auto justify-center gap-4">
    <Button on:click={() => (deleteRoundDialog = false)} color="alternative">Cancelar</Button>
    <Button color="red" on:click={handleDeleteRound}>
      <TrashBinSolid size="sm" />
      <Span class="ml-1">Eliminar</Span>
    </Button>
  </div>
</Modal>
