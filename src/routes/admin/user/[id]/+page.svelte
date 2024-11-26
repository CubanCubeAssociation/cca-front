<script lang="ts">
  import { onMount } from "svelte";
  import {
    Button,
    Card,
    Dropzone,
    Heading,
    Input,
    Label,
    Modal,
    Radio,
    Span,
    Tooltip,
  } from "flowbite-svelte";
  import { ExclamationCircleOutline, TrashBinSolid } from "flowbite-svelte-icons";
  import { createUser, getAvatarRoute, getUser, removeUser, updateUser } from "@helpers/API";
  import type { USER } from "@interfaces";
  import { PROVINCIAS, ROLES } from "@constants";
  import SaveIcon from "@icons/Send.svelte";
  import Select from "@components/Select.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";
  import Cropper from "svelte-easy-crop";
  import UploadIcon from "@icons/CloudUpload.svelte";
  import DeleteIcon from "@icons/Delete.svelte";
  import CropIcon from "@icons/Crop.svelte";
  import { userStore } from "@stores/user";

  const WIDTH = 200;
  const HEIGHT = WIDTH;

  let id = $state("");

  let user: USER = $state({
    name: "",
    email: "",
    password: "",
    ci: "",
    sex: "M",
    username: "",
    province: "",
    municipality: "",
    credit: 0,
    avatar: "",
    role: "user",
    isEmailVerified: false,
    age: 0,
    id: "",
  });

  let municipios: string[] = $state([]);
  let showModal = $state(false);
  let cropData = {
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
  };

  function exit() {
    if (user.id === $userStore?.id) {
      $userStore = user;
    }

    goto("/admin/user");
  }

  function save(ev: Event) {
    ev.preventDefault();

    user.avatar = croppedData;

    if (id != "new") {
      updateUser(user)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    } else {
      createUser(user)
        .then(exit)
        .catch(err => console.log("ERROR: ", err));
    }
  }

  // dev-only
  // function createGroup() {
  //   const names = [
  //     "Angel",
  //     "Carmen",
  //     "Pedro",
  //     "Juan",
  //     "Andrea",
  //     "Paco",
  //     "Lucía",
  //     "Ramiro",
  //     "Abraham",
  //     "Carlos",
  //     "Edgar",
  //     "Lucio",
  //     "Pascual",
  //     "Ana",
  //     "Lidia",
  //     "Rosa",
  //   ];

  //   for (let i = 1; i <= 10; i += 1) {
  //     let nm = names[Math.floor(Math.random() * names.length)];
  //     let lnm = "A" + Math.random().toString().split(".")[1].slice(0, 5);
  //     let username = Math.random().toString().split(".")[1];
  //     let p = Math.floor(Math.random() * PROVINCIAS.length);
  //     let m = Math.floor(Math.random() * PROVINCIAS[p].municipios.length);

  //     createUser({
  //       name: nm + " " + lnm,
  //       email: username + "@gmail.com",
  //       password: "Alfa123Perro",
  //       ci:
  //         "970413" +
  //         new Array(5)
  //           .fill(0)
  //           .map(_ => Math.random().toString()[4])
  //           .join(""),
  //       sex: "M",
  //       username,
  //       province: PROVINCIAS[p].nombre,
  //       municipality: PROVINCIAS[p].municipios[m],
  //       credit: 0,
  //       avatar: "",
  //       role: "user",
  //       isEmailVerified: false,
  //       age: 0,
  //       id: "",
  //     });
  //   }
  // }

  function deleteUser() {
    showModal = false;

    removeUser(user)
      .then(exit)
      .catch(err => console.log("ERROR: ", err));
  }

  function updateMunicipalities(province: string) {
    municipios = (PROVINCIAS.filter(p => p.nombre === province)[0] || {}).municipios || [];
  }

  let tempAvatar = $state("");
  let croppedData = $state("");
  let showCropModal = $state(false);

  function readImageFile(f: File) {
    let reader = new FileReader();
    let img = new Image();

    reader.onload = () => {
      img.onload = () => {
        let cnv = document.createElement("canvas");
        let ctx = cnv.getContext("2d");

        cnv.width = img.width;
        cnv.height = img.height;

        ctx?.drawImage(img, 0, 0, img.width, img.height);

        tempAvatar = cnv.toDataURL();
        croppedData = tempAvatar;
        showCropModal = true;
      };

      img.src = reader.result?.toString() || "";
    };

    reader.readAsDataURL(f);
  }

  function dropHandle(event: any) {
    tempAvatar = "";
    event.preventDefault();

    if (event.dataTransfer.items) {
      [...event.dataTransfer.items].forEach(item => {
        if (item.kind === "file") {
          readImageFile(item.getAsFile() as File);
        }
      });
    }
  }

  function handleChange(event: any) {
    const files = event.target.files;

    if (files.length > 0) {
      readImageFile(files[0]);
    }
  }

  function cropImage() {
    let img = new Image(WIDTH, HEIGHT);

    img.onload = () => {
      let cnv = document.createElement("canvas");
      let ctx = cnv.getContext("2d");

      cnv.width = WIDTH;
      cnv.height = HEIGHT;

      ctx?.drawImage(
        img,
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height,
        0,
        0,
        WIDTH,
        HEIGHT
      );

      croppedData = cnv.toDataURL();
    };

    img.src = tempAvatar;
  }

  onMount(() => {
    id = $page.params.id;

    if (!id || !id.trim()) {
      id = "new";
    }

    if (id != "new") {
      getUser(id)
        .then(u => {
          if (!u) {
            return goto("/login");
          }
          user = u;
          tempAvatar = getAvatarRoute(u.username || "");
          croppedData = getAvatarRoute(u.username || "");
          municipios = PROVINCIAS.find(p => p.nombre === u.province)?.municipios || [];
        })
        .catch(err => console.log("ERROR: ", err));
    }
  });

  $effect(() => {
    updateMunicipalities(user.province);
  });
</script>

<svelte:head>
  <title>
    {id === "new"
      ? (user.name.trim() ? user.name + " - " : "") + "Crear usuario"
      : user.name + " - Editar usuario"}
  </title>
</svelte:head>

<PrivateRouteGuard>
  <Card class="mt-4 max-w-6xl w-[calc(100%-2rem)] mx-auto mb-8">
    <Heading class="text-3xl text-center">
      {id === "new" ? "Crear usuario" : `Editar "${user.name}"`}
    </Heading>

    <form
      autocomplete="off"
      class="mt-8 grid items-center gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2"
      onsubmit={save}
    >
      <div class="grid">
        <Dropzone
          id="dropzone"
          on:drop={dropHandle}
          on:dragover={event => {
            event.preventDefault();
          }}
          on:change={handleChange}
          class="w-[7rem] h-[7rem] rounded-full relative mx-auto"
          multiple={false}
          accept="image/*"
        >
          {#if !tempAvatar}
            <UploadIcon size="3rem" />
            <p class="inline mb-2 text-xs text-gray-500 dark:text-gray-400 w-full px-1">
              Click para subir o arrastre la imagen
            </p>
          {:else}
            <img src={croppedData} class="w-full h-full rounded-full object-contain" alt="" />
          {/if}
        </Dropzone>

        {#if tempAvatar || true}
          <div class="flex gap-2 items-center justify-center mt-2">
            <Button class="px-3" on:click={() => (showCropModal = true)}>
              <CropIcon size="1.1rem" />
            </Button>
            <Tooltip>Recortar</Tooltip>

            <Button
              class="px-3"
              color="red"
              on:click={() => {
                tempAvatar = croppedData = "";
              }}
            >
              <DeleteIcon size="1.1rem" />
            </Button>
            <Tooltip>Eliminar</Tooltip>
          </div>
        {/if}
      </div>

      <div>
        <Label for="name" class="mb-2">Nombre</Label>
        <Input bind:value={user.name} type="text" id="name" placeholder="Nombre..." required />
      </div>

      <div>
        <Label for="email" class="mb-2">Email</Label>
        <Input
          bind:value={user.email}
          type="email"
          id="email"
          placeholder="email@email.com"
          required
        />
      </div>

      {#if id === "new"}
        <div>
          <Label for="password" class="mb-2">Contraseña</Label>
          <Input
            bind:value={user.password}
            type="password"
            name="password"
            id="password"
            placeholder="contraseña"
            autocomplete="off"
            required
          />
        </div>
      {/if}

      <div>
        <Label for="ci" class="mb-2">CI</Label>
        <Input bind:value={user.ci} type="text" id="ci" placeholder="########" required />
      </div>

      <div>
        <Label for="sex" class="mb-2">Sexo</Label>
        <div class="flex flex-wrap">
          <Radio class="p-2 gap-1" bind:group={user.sex} value="M">Masculino</Radio>
          <Radio class="p-2 gap-1" bind:group={user.sex} value="F">Femenino</Radio>
        </div>
      </div>

      <div>
        <Label for="username" class="mb-2">Usuario</Label>
        <Input bind:value={user.username} type="text" id="username" required autocomplete="off" />
      </div>

      <div>
        <Label class="mb-2">Provincia</Label>
        <Select
          items={PROVINCIAS}
          transform={e => e.nombre}
          label={e => e.nombre}
          bind:value={user.province}
          onChange={updateMunicipalities}
          placement="right-start"
        />
      </div>

      <div>
        <Label class="mb-2">Municipio</Label>
        <Select
          items={municipios}
          transform={e => e}
          label={e => e}
          bind:value={user.municipality}
          placement="right-start"
        />
      </div>

      <div>
        <Label for="credit" class="mb-2">Crédito</Label>
        <Input bind:value={user.credit} type="number" min={0} id="credit" required />
      </div>

      <div>
        <Label class="mb-2">Rol</Label>
        <Select
          items={ROLES.slice(1)}
          transform={e => e.value}
          label={e => e.name}
          bind:value={user.role}
          placement="right-start"
        />
      </div>

      <div class="col-span-full flex flex-wrap gap-2 justify-center mt-4">
        {#if id != "new"}
          <Button color="red" on:click={() => (showModal = true)}>
            <TrashBinSolid size="sm" />
            <Span class="ml-1">Eliminar</Span>
          </Button>
        {/if}

        <Button type="submit" class="gap-2"
          ><SaveIcon size="1.2rem" /> {id === "new" ? "Crear" : "Guardar"}</Button
        >
      </div>
    </form>

    <!-- <Button class="w-fit mx-auto mt-4" on:click={ createGroup }>Crear grupo</Button> -->
  </Card>
</PrivateRouteGuard>

<Modal bind:open={showModal} outsideclose autoclose title="Eliminar usuario" size="xs">
  <div class="flex flex-col items-center justify-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />

    <Heading tag="h4" class="text-center">¿Desea eliminar el usuario "{user.name}"?</Heading>

    <div class="flex gap-2 mt-4">
      <Button color="red" on:click={deleteUser}>
        <TrashBinSolid size="sm" />
        <Span class="ml-1">Eliminar</Span>
      </Button>
      <Button color="alternative">Cancelar</Button>
    </div>
  </div>
</Modal>

<Modal bind:open={showCropModal} outsideclose autoclose title="Ajustar imagen" size="sm">
  <div class="relative h-[20rem] w-full">
    <Cropper
      image={tempAvatar}
      zoom={1}
      aspect={1}
      on:cropcomplete={e => (cropData = e.detail.pixels)}
    />
  </div>

  <div class="flex gap-2 mt-4 justify-center">
    <Button color="alternative">Cancelar</Button>
    <Button color="primary" on:click={cropImage}>Recortar</Button>
  </div>
</Modal>
