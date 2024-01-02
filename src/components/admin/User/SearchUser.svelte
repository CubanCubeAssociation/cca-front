<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { USER } from "@interfaces";
  import { searchUser } from "@helpers/API";
  import Button from "@components/material/Button.svelte";
  import Input from "@components/material/Input.svelte";
  import Checkbox from "@components/material/Checkbox.svelte";
  import SendIcon from "@icons/Send.svelte";
  import DeleteIcon from "@icons/Delete.svelte";
  import { uniqueArray } from "@helpers/object";

  export let show = false;
  export let multiple = false;

  const dispatch = createEventDispatcher();

  let columns = [
    {
      key: '',
      column: "",
      show: true,
    },
    {
      key: 'name',
      column: "Nombre",
      show: true,
    },
    {
      key: 'username',
      column: "Usuario",
      show: true,
    },
    {
      key: '',
      column: "",
      show: true,
    },
  ];

  let dialog: HTMLDialogElement;
  let selected: USER[] = [];
  let userList: USER[] = [];
  let checks: boolean[] = [];
  let checked = 0;
  let input = '';
  let controller = new AbortController();
  let { signal } = controller;

  function showModal() {
    dialog.showModal();
  }

  function hideModal() {
    dialog.close();
    show = false;
    input = '';
    userList.length = 0;
    selected.length = 0;
    checks.length = 0;
    checked = 0;
  }

  function handleShow(s: boolean) {
    if ( dialog ) {
      s && showModal();
      !s && hideModal();
    }
  }

  function handleInput() {
    let str = input.trim();
    
    if ( str ) {
      controller.abort();
      
      searchUser(str, signal).then((res) => {
        userList = res;
        checks = userList.map(_ => false);
        checked = 0;
      });
    } else {
      userList.length = 0;
      checks.length = 0;
      checked = 0;
    }
  }

  function addSelected() {
    let temp = [ ...selected, ...userList.filter(
      (_, p) => checks[p]
    ) ];

    selected = uniqueArray(temp, (e) => e.username);
  }

  function updateChecked() {
    checked = checks.reduce((acc, e) => acc + (e ? 1 : 0), 0);
  }

  function deleteSelected(pos: number) {
    selected.splice(pos, 1);
    selected = selected;
  }

  function sendUsers() {
    dispatch("user", selected);
    hideModal();
  }

  $: handleShow(show);
</script>

<dialog
  bind:this={ dialog }
  class="bg-white text-current shadow-md rounded-md"
  >
  <h3 class="text-2xl mb-4 text-center">Buscar { multiple ? 'usuarios' : 'usuario'}</h3>
 
  <Input
    bind:value={ input }
    on:input={ handleInput }
    on:change={ handleInput }
  />

  {#if userList.length}
    <div class="table-wrapper rounded-md overflow-x-auto shadow-md my-4">
      <table class="table-auto stripped w-full overflow-hidden cursor-default">
        <thead>
          <tr>
            {#each columns.slice(0, -1) as C}
              {#if C.show }
                <th>{ C.column }</th>
              {/if}
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each userList as c, i (c.username)}
            <tr>
              <td>
                <Checkbox bind:checked={ checks[i] } on:change={ updateChecked }/>
              </td>
              <td class="cursor-pointer select-none"
                on:click={ () => checks[i] = !checks[i] }
                data-show={ columns[0].show }
                data-cell="Nombre">
                { c.name }
              </td>
              <td data-show={ columns[1].show } data-cell="Usuario">{ c.username }</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if checked}
    <Button
      class="text-white mx-auto"
      on:click={ addSelected }>Añadir ({checked})</Button>
  {/if}

  {#if selected.length}
    <h2 class="text-lg text-center mt-4">Seleccionados</h2>
    <div class="table-wrapper rounded-md overflow-x-auto shadow-md mb-4">
      <table class="table-auto stripped w-full overflow-hidden cursor-default">
        <thead>
          <tr>
            {#each columns.slice(1) as C}
              {#if C.show }
                <th>{ C.column }</th>
              {/if}
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each selected as c, i (c.username)}
            <tr>
              <td
                data-show={ columns[0].show }
                data-cell="Nombre">
                { c.name }
              </td>
              <td data-show={ columns[1].show } data-cell="Usuario">{ c.username }</td>
              <td class="cursor-pointer" on:click={ () => deleteSelected(i) }>
                <DeleteIcon size="1.2rem"/>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  
  <!-- ACTION BUTTONS -->
  <div class="flex gap-2 justify-center mt-2">
    <Button class="bg-gray-200 text-black"
      on:click={ hideModal }
    >Cancelar</Button>
    
    <Button class="text-white bg-green-500"
      on:click={ sendUsers }
      disabled={ selected.length === 0 }>
      <SendIcon size="1.2rem"/> Aceptar
    </Button>
  </div>
</dialog>

