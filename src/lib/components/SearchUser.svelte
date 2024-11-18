<script lang="ts">
  import type { USER } from "@interfaces";
  import { searchUser } from "@helpers/API";
  import SendIcon from "@icons/Send.svelte";
  import DeleteIcon from "@icons/Delete.svelte";
  import AddIcon from "@icons/Plus.svelte";
  import { uniqueArray } from "@helpers/object";
  import {
    Button,
    Dropdown,
    DropdownItem,
    Heading,
    Input,
    Modal,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";

  type Callback = () => void;

  export let show = false;
  export let multiple = false;
  export let type: "dropdown" | "modal" = "modal";
  export let user: (u: USER | USER[]) => any;

  let selected: USER[] = [];
  let userList: USER[] = [];
  let checks: boolean[] = [];
  let checked = 0;
  let input = "";
  // let controller = new AbortController();
  // let { signal } = controller;
  let searching = false;

  function debounce(fn: Callback, pre: Callback = () => {}, pos: Callback = () => {}, time = 500) {
    let timerId: any;
    return () => {
      pre();
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        fn();
        pos();
      }, time);
    };
  }

  const handleInput = debounce(
    () => {
      let str = input.trim();

      if (str) {
        searchUser(str).then(res => {
          userList = res;
          checks = userList.map(() => false);
          checked = 0;
        });
      } else {
        userList.length = 0;
        checks.length = 0;
        checked = 0;
      }
    },
    () => {
      searching = true;
    },
    () => {
      searching = false;
    }
  );

  // function addSelected(ev: MouseEvent) {
  //   ev.stopPropagation();

  //   let temp = [...selected, ...userList.filter((_, p) => checks[p])];

  //   selected = uniqueArray(temp, e => e.username);
  // }

  // function updateChecked() {
  //   checked = checks.reduce((acc, e) => acc + (e ? 1 : 0), 0);
  // }

  function deleteSelected(pos: number) {
    selected.splice(pos, 1);
    selected = selected;
  }

  function sendUsers(u?: USER) {
    if (!multiple) {
      return user(u || userList.filter((_, p) => checks[p]));
    }

    user(u || selected);
  }
</script>

{#if type === "modal"}
  <Modal
    title={`Buscar ${multiple ? "usuarios" : "usuario"}`}
    bind:open={show}
    autoclose
    outsideclose
  >
    <Input
      bind:value={input}
      placeholder="Buscar..."
      on:input={handleInput}
      on:change={handleInput}
    />

    {#if userList.length}
      <Table hoverable shadow divClass="w-full relative overflow-x-auto">
        <TableHead>
          <TableHeadCell></TableHeadCell>
          <TableHeadCell>Nombre</TableHeadCell>
          <TableHeadCell>Usuario</TableHeadCell>
        </TableHead>

        <TableBody>
          {#each userList as c (c.username)}
            <TableBodyRow>
              <TableBodyCell>
                <Button
                  class="px-2 py-2"
                  type="button"
                  on:click={e => {
                    e.stopPropagation();
                    selected = uniqueArray([...selected, c], e => e.username);
                  }}
                >
                  <AddIcon size="1.2rem" class="pointer-events-none" />
                </Button>
              </TableBodyCell>

              <TableBodyCell class="cursor-pointer">
                {c.name}
              </TableBodyCell>

              <TableBodyCell>
                {c.username}
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>
    {/if}

    {#if multiple}
      <!-- {#if checked}
        <Button on:click={addSelected}>Añadir ({checked})</Button>
      {/if} -->

      {#if selected.length}
        <Heading tag="h4" class="text-center">Seleccionados</Heading>

        <Table striped shadow hoverable>
          <TableHead>
            <TableHeadCell>Nombre</TableHeadCell>
            <TableHeadCell>Usuario</TableHeadCell>
            <TableHeadCell></TableHeadCell>
          </TableHead>

          <TableBody>
            {#each selected as c, i (c.username)}
              <TableBodyRow>
                <TableBodyCell on:click={() => (checks[i] = !checks[i])}>
                  {c.name}
                </TableBodyCell>

                <TableBodyCell>
                  {c.username}
                </TableBodyCell>

                <TableBodyCell>
                  <Button type="button" color="red" on:click={() => deleteSelected(i)}
                    ><DeleteIcon size="1.2rem" /></Button
                  >
                </TableBodyCell>
              </TableBodyRow>
            {/each}
          </TableBody>
        </Table>
      {/if}
    {/if}

    <svelte:fragment slot="footer">
      <div class="flex gap-2 justify-center mt-2">
        <Button color="alternative">Cancelar</Button>

        <Button
          on:click={() => sendUsers()}
          disabled={(!multiple && !checked) || (multiple && selected.length === 0)}
        >
          <SendIcon size="1.2rem" /> Aceptar
        </Button>
      </div>
    </svelte:fragment>
  </Modal>
{:else}
  <Dropdown
    placement="bottom"
    bind:open={show}
    class={userList.length === 0 && !searching ? "hidden" : "max-h-[15rem] overflow-y-auto grid"}
    classContainer="rounded-md shadow-md border border-[#fff4]"
  >
    <div slot="header" class="px-4 py-2">
      <Input
        bind:value={input}
        placeholder="Buscar..."
        on:input={handleInput}
        on:change={handleInput}
      />
    </div>

    {#if searching}
      <Spinner size="5" class="mx-auto" />
    {:else}
      {#each userList as user}
        <DropdownItem
          on:click={() => {
            show = false;
            multiple = false;
            sendUsers(user);
          }}>{user.name}</DropdownItem
        >
      {/each}
    {/if}
  </Dropdown>
{/if}
