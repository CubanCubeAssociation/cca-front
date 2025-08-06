<script lang="ts">
  import type { USER } from "@interfaces";
  import { searchUser } from "@helpers/API";
  import SendIcon from "@icons/Send.svelte";
  import DeleteIcon from "@icons/Delete.svelte";
  import AddIcon from "@icons/Plus.svelte";
  import { uniqueArray } from "@helpers/object";
  import { UserSearchIcon } from "lucide-svelte";
  import Modal from "./Modal.svelte";

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
    show = false;
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
  <Modal bind:show>
    <h2 class="text-2xl text-center mb-4">Buscar {multiple ? "usuarios" : "usuario"}</h2>

    <label class="input mx-auto w-full mb-4">
      <UserSearchIcon />

      <input bind:value={input} type="search" class="grow" {placeholder} oninput={handleInput} />
    </label>

    {#if searching}
      <div class="dropdown-content menu w-full bg-base-200">
        <span class="loading loading-spinner loading-lg mx-auto"></span>
      </div>
    {:else}
      {#if userList.length}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {#each userList as c (c.username)}
                <tr>
                  <td>
                    <button
                      class="btn btn-secondary px-2 py-2"
                      type="button"
                      onclick={e => {
                        e.stopPropagation();
                        selected = uniqueArray([...selected, c], e => e.username);
                      }}
                    >
                      <AddIcon size="1.2rem" class="pointer-events-none" />
                    </button>
                  </td>

                  <td>{c.name}</td>
                  <td>{c.username} </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      {#if multiple}
        {#if checked}
          <button onclick={addSelected}>Añadir ({checked})</button>
        {/if}

        {#if selected.length}
          <h4 class="text-center text-xl my-2 text-accent">Seleccionados</h4>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {#each selected as c, i (c.username)}
                  <tr>
                    <td onclick={() => (checks[i] = !checks[i])}>
                      {c.name}
                    </td>

                    <td>
                      {c.username}
                    </td>

                    <td>
                      <button type="button" color="red" onclick={() => deleteSelected(i)}>
                        <DeleteIcon size="1.2rem" />
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/if}
    {/if}

    <div class="flex gap-2 justify-center mt-2">
      <button class="btn" onclick={() => (show = false)}>Cancelar</button>

      <button
        class="btn btn-primary"
        onclick={() => sendUsers()}
        disabled={(!multiple && !checked) || (multiple && selected.length === 0)}
      >
        <SendIcon size="1.2rem" /> Aceptar
      </button>
    </div>
  </Modal>
{:else}
  <div class={cl}>
    <label class="input">
      <UserSearchIcon />

      <input bind:value={input} type="search" class="grow" {placeholder} oninput={handleInput} />
    </label>

    {#if searching}
      <div class="dropdown-content menu w-full bg-base-200">
        <span class="loading loading-spinner loading-xs"></span>
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
