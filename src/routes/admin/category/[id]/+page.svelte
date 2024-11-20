<script lang="ts">
  import { onMount } from "svelte";
  import { ICONS } from "@constants";
  import type { CATEGORY } from "@interfaces";
  import { createCategory, getCategory, removeCategory, updateCategory } from "@helpers/API";
  import SaveIcon from "@icons/Send.svelte";
  import { Button, Card, Heading, Input, Label, Modal, Span, Tooltip } from "flowbite-svelte";
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { ExclamationCircleOutline, TrashBinSolid } from "flowbite-svelte-icons";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";

  let id = "";
  let type: "update" | "create" = "update";
  let category: CATEGORY = {
    id: "",
    name: "",
    scrambler: "333",
  };

  let showModal = false;

  function selectIcon(ic: CATEGORY) {
    category.scrambler = ic.scrambler;
    category.name = ic.name;
  }

  function exit() {
    goto("/admin/category");
  }

  function save() {
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
    id = $page.params.id;
    type = id != "new" ? "update" : "create";

    if (id && id != "new") {
      getCategory(id).then(cat => {
        if (!cat) return;
        category = cat;
      });
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
  <Card class="mt-4 max-w-sm w-[calc(100%-2rem)] mx-auto mb-8">
    <Heading class="text-3xl text-center"
      >{type === "update" ? `Editar "${category.name}"` : "Crear categoría"}</Heading
    >

    <form class="mt-8 grid gap-2" on:submit|preventDefault={save}>
      <div>
        <Label for="name" class="mb-2">Nombre</Label>
        <Input bind:value={category.name} type="text" id="name" placeholder="Nombre..." required />
      </div>

      <div>
        <Label>Ícono</Label>

        {#each ICONS as I}
          <button on:click={() => selectIcon(I)} id={"ICON-" + I.scrambler} type="button">
            <WcaCategory icon={I.scrambler} selected={I.scrambler === category.scrambler} />
          </button>
          <Tooltip class="!text-white" triggeredBy={"#ICON-" + I.scrambler}>{I.name}</Tooltip>
        {/each}
      </div>

      <div>
        <Label>Scrambler</Label>
        <Input bind:value={category.scrambler} />
      </div>

      <div class="col-span-full flex flex-wrap gap-2 justify-center">
        {#if type === "update"}
          <Button color="red" on:click={() => (showModal = true)}>
            <TrashBinSolid size="sm" />
            <Span class="ml-1">Eliminar</Span>
          </Button>
        {/if}

        <Button class="text-white" type="submit">
          <SaveIcon size="1.2rem" />
          <Span class="ml-1">{type === "update" ? "Guardar" : "Crear"}</Span>
        </Button>
      </div>
    </form>
  </Card>

  <Modal bind:open={showModal} outsideclose autoclose title="Eliminar categoría" size="xs">
    <div class="flex flex-col items-center justify-center">
      <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />

      <Heading tag="h4" class="text-center">¿Desea eliminar la categoría "{category.name}"?</Heading
      >

      <div class="flex gap-2 mt-4">
        <Button color="red" on:click={deleteCategory}>
          <TrashBinSolid size="sm" />
          <Span class="ml-1">Eliminar</Span>
        </Button>
        <Button color="alternative">Cancelar</Button>
      </div>
    </div>
  </Modal>
</PrivateRouteGuard>
