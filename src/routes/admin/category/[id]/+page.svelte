<script lang="ts">
  import { onMount } from "svelte";
  import { ICONS } from "@constants";
  import type { CATEGORY, FORMAT } from "@interfaces";
  import {
    createCategory,
    getCategory,
    getFormats,
    removeCategory,
    updateCategory,
  } from "@helpers/API";
  import SaveIcon from "@icons/Send.svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";
  import { twMerge } from "tailwind-merge";
  import { preventDefault } from "@helpers/object";
  import Modal from "@components/Modal.svelte";
  import { CircleAlertIcon, TrashIcon } from "lucide-svelte";
  import { page } from "$app/state";

  let id = "";
  let type: "update" | "create" = "update";
  let category: CATEGORY = {
    id: "",
    name: "",
    scrambler: "333",
    formats: [],
  };
  let formats: FORMAT[] = [];
  let selectedFormats: boolean[] = [];

  let showModal = false;

  function selectIcon(ic: Partial<CATEGORY>) {
    category.scrambler = ic.scrambler || "333";
    category.name = ic.name || "";
  }

  function exit() {
    goto("/admin/category");
  }

  function save() {
    category.formats = formats.filter((_, p) => selectedFormats[p]).map(f => f.name);

    if (type === "update") {
      updateCategory(category)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    } else {
      createCategory(category)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    }
  }

  function deleteCategory() {
    removeCategory(category)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  onMount(() => {
    id = page.params.id;
    type = id != "new" ? "update" : "create";

    formats = getFormats();
    selectedFormats = formats.map(() => false);

    if (id && id != "new") {
      getCategory(id)
        .then(res => {
          category = res;

          for (let i = 0, maxi = category.formats.length; i < maxi; i += 1) {
            for (let j = 0, maxj = formats.length; j < maxj; j += 1) {
              if (formats[j].name === category.formats[i]) {
                selectedFormats[j] = true;
                break;
              }
            }
          }
        })
        .catch(err => console.log("ERROR: ", err));
    }
  });
</script>

<svelte:head>
  <title>
    {type === "create"
      ? (category.name.trim() ? category.name + " - " : "") + "Crear categoría"
      : category.name + " - Editar categoría"}
  </title>
</svelte:head>

<PrivateRouteGuard>
  <div class="card mt-4 max-w-sm mx-auto mb-8 !px-4">
    <h1 class="text-3xl text-center">
      {type === "update" ? `Editar "${category.name}"` : "Crear categoría"}
    </h1>

    <form class="grid gap-2" onsubmit={preventDefault(save)}>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nombre</legend>
        <label class="input">
          <WcaCategory icon="333" size="1.5rem" />
          <input
            bind:value={category.name}
            type="text"
            class="grow"
            placeholder="Nombre"
            required
          />
        </label>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Ícono</legend>

        <div class="flex flex-wrap gap-2">
          {#each ICONS as I}
            <button
              onclick={preventDefault(() => selectIcon(I))}
              id={"ICON-" + I.scrambler}
              type="button"
              class="tooltip"
              data-tip={I.name}
            >
              <WcaCategory
                size="1.5rem"
                icon={I.scrambler}
                selected={I.scrambler === category.scrambler}
              />
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Scrambler</legend>
        <label class="input">
          <WcaCategory icon={category.scrambler} size="1.5rem" />
          <input
            bind:value={category.scrambler}
            type="text"
            class="grow"
            placeholder="Scrambler"
            required
          />
        </label>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Formatos</legend>

        <ul class="flex gap-2">
          {#each formats as f, p}
            <li>
              <button
                class={twMerge(
                  "border px-2 rounded-md cursor-pointer",
                  selectedFormats[p] ? "border-yellow-400 text-yellow-400" : ""
                )}
                onclick={preventDefault(() => {
                  selectedFormats[p] = !selectedFormats[p];
                })}
              >
                {f.name}
              </button>
            </li>
          {/each}
        </ul>
      </fieldset>

      <div class="col-span-full flex flex-wrap gap-2 justify-center mt-4">
        {#if type === "update"}
          <button class="btn btn-error" onclick={preventDefault(() => (showModal = true))}>
            <TrashIcon size="1.2rem" />
            <span class="ml-1">Eliminar</span>
          </button>
        {/if}

        <button class="btn btn-primary" type="submit">
          <SaveIcon size="1.2rem" />
          <span class="ml-1">{type === "update" ? "Guardar" : "Crear"}</span>
        </button>
      </div>
    </form>
  </div>
</PrivateRouteGuard>

<Modal bind:show={showModal}>
  <h2 class="text-xl text-center mb-4">Eliminar categoria</h2>

  <div class="flex flex-col items-center justify-center">
    <CircleAlertIcon size="3rem" />

    <h4 class="text-center">¿Desea eliminar la categoría "{category.name}"?</h4>

    <div class="flex gap-2 mt-4">
      <button class="btn" onclick={() => (showModal = false)}>Cancelar</button>
      <button class="btn btn-error" onclick={deleteCategory}>
        <TrashIcon size="1.2rem" />
        <span class="ml-1">Eliminar</span>
      </button>
    </div>
  </div>
</Modal>
