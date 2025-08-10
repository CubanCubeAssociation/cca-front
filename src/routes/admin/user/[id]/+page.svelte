<script lang="ts">
  import { onMount } from "svelte";
  import { createUser, getAvatarRoute, getUser, removeUser, updateUser } from "@helpers/API";
  import { PROVINCIAS, ROLES } from "@constants";
  import Select from "@components/Select.svelte";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";
  import Cropper from "svelte-easy-crop";
  import { userStore } from "@stores/user";
  import {
    CircleAlertIcon,
    DollarSignIcon,
    IdCardIcon,
    KeyRoundIcon,
    MailIcon,
    SaveIcon,
    TrashIcon,
    UserIcon,
  } from "lucide-svelte";
  import Modal from "@components/Modal.svelte";
  import { createEmptyUser, preventDefault } from "@helpers/object";
  import { page } from "$app/state";
  import LoadingLayout from "@components/LoadingLayout.svelte";

  const WIDTH = 200;
  const HEIGHT = WIDTH;

  let id = $state("");
  let loading = $state(false);
  let error = $state(false);
  let user = $state(createEmptyUser());

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

  function updateData() {
    loading = true;
    error = false;

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
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  onMount(() => {
    id = page.params.id;

    if (!id || !id.trim()) {
      id = "new";
    }

    if (id != "new") {
      updateData();
    }
  });

  $effect(() => updateMunicipalities(user.province));
  $effect(() => {
    user.sex = user.ci.length >= 10 ? (~~(user.ci.at(9) || 0) % 2 === 0 ? "M" : "F") : user.sex;
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
  <LoadingLayout {loading} {error} altError={false} reloadFunction={updateData}>
    {#snippet title()}
      {id === "new" ? "Crear usuario" : `Editar "${user.name}"`}
    {/snippet}

    {#snippet content()}
      <form
        autocomplete="off"
        class="mt-8 grid items-center px-4 gap-2 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2"
        onsubmit={save}
      >
        <!-- <div class="grid">
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
            <p class="inline mb-2 text-xs text-gray-500 w-full px-1">
              Click para subir o arrastre la imagen
            </p>
          {:else}
            <img src={croppedData} class="w-full h-full rounded-full object-contain" alt="" />
          {/if}
        </Dropzone>

        {#if tempAvatar || true}
          <div class="flex gap-2 items-center justify-center mt-2">
            <div class="tooltip" data-tip="Recortar">
              <button class="btn px-3" onclick={preventDefault(() => (showCropModal = true))}>
                <CropIcon size="1.1rem" />
              </button>
            </div>

            <div class="tooltip" data-tip="Eliminar">
              <button
                class="btn btn-error px-3"
                onclick={preventDefault(() => (tempAvatar = croppedData = ""))}
              >
                <DeleteIcon size="1.1rem" />
              </button>
            </div>
          </div>
        {/if}
      </div> -->

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Nombre</legend>
          <label class="input">
            <UserIcon />
            <input bind:value={user.name} type="text" class="grow" placeholder="Nombre" required />
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <label class="input">
            <MailIcon />
            <input
              bind:value={user.email}
              type="email"
              class="grow"
              placeholder="email@email.com"
              required
            />
          </label>
        </fieldset>

        {#if id === "new"}
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Contraseña</legend>
            <label class="input">
              <KeyRoundIcon />
              <input
                bind:value={user.password}
                type="password"
                class="grow"
                placeholder="contraseña"
                autocomplete="off"
                required
              />
            </label>
          </fieldset>
        {/if}

        <fieldset class="fieldset">
          <legend class="fieldset-legend">CI</legend>
          <label class="input">
            <IdCardIcon />
            <input bind:value={user.ci} type="text" class="grow" placeholder="########" required />
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Usuario</legend>
          <label class="input">
            <UserIcon />
            <input
              bind:value={user.username}
              type="text"
              class="grow"
              autocomplete="off"
              required
            />
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Crédito</legend>

          <label class="input">
            <DollarSignIcon />
            <input bind:value={user.credit} min={0} type="number" class="grow" required />
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Sexo</legend>
          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2">
              <input type="radio" class="radio" bind:group={user.sex} value="M" />Masculino
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" class="radio" bind:group={user.sex} value="F" />Femenino
            </label>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Provincia </legend>

          <Select
            items={PROVINCIAS}
            transform={e => e.nombre}
            label={e => e.nombre}
            bind:value={user.province}
            onChange={updateMunicipalities}
            placement="right-start"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Municipio </legend>
          <Select
            items={municipios}
            transform={e => e}
            label={e => e}
            bind:value={user.municipality}
            placement="right-start"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Rol</legend>
          <Select
            items={ROLES.slice(1)}
            transform={e => e.value}
            label={e => e.name}
            bind:value={user.role}
            placement="right-start"
          />
        </fieldset>

        <div class="col-span-full flex flex-wrap gap-2 justify-center mt-4">
          {#if id != "new"}
            <button class="btn btn-error" onclick={preventDefault(() => (showModal = true))}>
              <TrashIcon size="1.2rem" />
              <span class="ml-1">Eliminar</span>
            </button>
          {/if}

          <button type="submit" class="btn btn-primary gap-2">
            <SaveIcon size="1.2rem" />
            {id === "new" ? "Crear" : "Guardar"}
          </button>
        </div>
      </form>
    {/snippet}
  </LoadingLayout>
</PrivateRouteGuard>

<Modal bind:show={showModal}>
  <h2 class="text-xl text-center mb-4">Eliminar usuario</h2>
  <div class="flex flex-col items-center justify-center">
    <CircleAlertIcon size="3rem" />

    <h4 class="text-center">¿Desea eliminar el usuario "{user.name}"?</h4>

    <div class="flex gap-2 mt-4">
      <button class="btn" onclick={() => (showModal = false)}>Cancelar</button>
      <button class="btn btn-error" onclick={deleteUser}>
        <TrashIcon size="1.2rem" />
        <span class="ml-1">Eliminar</span>
      </button>
    </div>
  </div>
</Modal>

<Modal bind:show={showCropModal}>
  <h2 class="text-xl text-center mb-4">Ajustar imagen</h2>
  <div class="relative h-[20rem] w-full">
    <Cropper
      image={tempAvatar}
      zoom={1}
      aspect={1}
      on:cropcomplete={e => (cropData = e.detail.pixels)}
    />
  </div>

  <div class="flex gap-2 mt-4 justify-center">
    <button class="btn" onclick={() => (showCropModal = false)}>Cancelar</button>
    <button class="btn btn-primary" onclick={cropImage}>Recortar</button>
  </div>
</Modal>
