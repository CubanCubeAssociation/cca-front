<script lang="ts">
  import type { USER } from "@interfaces";
  import { searchUser } from "@helpers/API";
  import SendIcon from "@icons/Send.svelte";
  import DeleteIcon from "@icons/Delete.svelte";
  import AddIcon from "@icons/Plus.svelte";
  import { uniqueArray } from "@helpers/object";
  import {
    Button,
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

  import { UserSearchIcon } from "lucide-svelte";
  import { twMerge } from "tailwind-merge";

  type Callback = () => void;

  interface SearchUserProps {
    user: (u: any) => any;
    multiple?: boolean;
    show?: boolean;
    placeholder?: string;
    class?: string;
    type?: "dropdown" | "modal";
  }

  let {
    show = $bindable(false),
    multiple = $bindable(false),
    type = "modal",
    placeholder = "Nombre o ID",
    class: cl = "",
    user,
  }: SearchUserProps = $props();

  let selected: USER[] = $state([]);
  let userList: USER[] = $state([]);
  let checks: boolean[] = $state([]);
  let checked = $state(0);
  let input = $state("");
  let searching = $state(false);

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
        searchUser(str)
          .then(res => {
            userList = res;
            checks = userList.map(() => false);
            checked = 0;
          })
          .finally(() => {
            searching = false;
          });
      } else {
        userList.length = 0;
        checks.length = 0;
        checked = 0;
        searching = false;
      }
    },
    () => {
      show = true;
      searching = true;
      userList.length = 0;
      checks.length = 0;
      checked = 0;
    }
  );

  function addSelected(ev: MouseEvent) {
    ev.stopPropagation();
    let temp = [...selected, ...userList.filter((_, p) => checks[p])];
    selected = uniqueArray(temp, e => e.username);
  }

  function deleteSelected(pos: number) {
    selected.splice(pos, 1);
    selected = selected;
  }

  function sendUsers(u?: USER) {
    if (type === "dropdown") {
      if (u) return user(u);
    } else {
      if (!multiple) {
        return user(u || userList.filter((_, p) => checks[p]));
      }

      user(u || selected);
    }
  }
</script>

{#if type === "modal"}
  <Modal
    title={`Buscar ${multiple ? "usuarios" : "usuario"}`}
    bind:open={show}
    autoclose
    outsideclose
  >
    <Input bind:value={input} placeholder="Buscar..." on:input={handleInput} />

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
      {#if checked}
        <Button on:click={addSelected}>Añadir ({checked})</Button>
      {/if}

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
  <div class={cl}>
    <label class="input">
      <UserSearchIcon />

      <input bind:value={input} type="search" class="grow" {placeholder} oninput={handleInput} />
    </label>

    {#if searching}
      <div class="dropdown-content menu w-full bg-base-200">
        <Spinner size="5" class="mx-auto" />
      </div>
    {:else if userList.length > 0 && show}
      <ul
        class="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm
          max-h-52 h-min overflow-auto flex-nowrap"
      >
        {#each userList as user}
          <li>
            <button
              onclick={() => {
                sendUsers(user);
                show = false;
                multiple = false;
                input = "";
              }}>{user.name}</button
            >
          </li>
        {/each}
      </ul>
    {:else if input.trim() != ""}
      <span class="dropdown-content menu w-full bg-base-200"> No se encontraron resultados </span>
    {/if}
  </div>
{/if}
