<script lang="ts">
  import {
    BadgeCheckIcon,
    ClockIcon,
    FingerprintIcon,
    HandCoinsIcon,
    IdCardIcon,
    KeyRoundIcon,
    LockKeyholeIcon,
    MailIcon,
    MapPinIcon,
    MarsIcon,
    SaveIcon,
    SendIcon,
    SigmaIcon,
    VenusIcon,
  } from "lucide-svelte";
  import Avatar from "./Avatar.svelte";
  import UserField from "./UserField.svelte";
  import { SITEMAP } from "@helpers/routing";
  import { minRole } from "@helpers/auth";
  import { clone, createEmptyUser, preventDefault } from "@helpers/object";
  import type { USER } from "@interfaces";
  import { userStore } from "$lib/stores/user";
  import Select from "./Select.svelte";
  import { PROVINCIAS } from "@constants";
  import Modal from "./Modal.svelte";
  import { updateUser } from "@helpers/API";
  import { NotificationService } from "@stores/notification.service";

  let { user }: { user: USER | null } = $props();

  const size = "1.1rem";
  const notification = NotificationService.getInstance();

  let editMode = $state(false);
  let tempUser = $state(createEmptyUser());
  let municipios: string[] = $state([]);
  let showUpdatePasswordModal = $state(false);
  let tempPassword = $state("");
  let tempConfirmPassword = $state("");
  let loading = $state(false);

  function updateMunicipalities(province: string) {
    municipios = (PROVINCIAS.filter(p => p.nombre === province)[0] || {}).municipios || [];
  }

  function saveUser() {
    loading = true;

    updateUser(tempUser)
      .then(() => {
        notification.addNotification({
          header: "Guardado",
          text: "Se han guardado los cambios correctamente",
        });

        editMode = false;
      })
      .catch(err => {
        console.dir(err);

        notification.addNotification({
          header: "Error",
          text: "Ha ocurrido un error al guardar los datos",
        });
      })
      .finally(() => (loading = false));
  }

  $effect(() => {
    if (user) tempUser = clone($state.snapshot(user));
  });
  $effect(() => tempUser && (updateMunicipalities(tempUser.province) as any));
  $effect(() => {
    if (!tempUser) return;
    tempUser.sex =
      tempUser.ci.length >= 10 ? (~~(tempUser.ci.at(9) || 0) % 2 === 0 ? "M" : "F") : tempUser.sex;
  });
</script>

<div class="w-full grid">
  <Avatar size="xl" user={tempUser} class="mx-auto" />
  <h1 class="font-bold text-lg mx-auto">
    <UserField
      fullName
      class="w-fit! text-center font-bold"
      user={tempUser || { username: "", name: "", role: "user" }}
    />
  </h1>

  {#if editMode && tempUser}
    <form onsubmit={preventDefault(saveUser)} class="grid sm:grid-cols-2 md:grid-cols-1 gap-2">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Provincia </legend>

        <Select
          items={PROVINCIAS}
          transform={e => e.nombre}
          label={e => e.nombre}
          bind:value={tempUser.province}
          onChange={updateMunicipalities}
          placement="right-start"
          class="w-full"
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Municipio </legend>
        <Select
          items={municipios}
          transform={e => e}
          label={e => e}
          bind:value={tempUser.municipality}
          placement="right-start"
          class="w-full"
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Sexo</legend>
        <div class="flex gap-2">
          <label class="flex items-center gap-2">
            <input type="radio" class="radio" bind:group={tempUser.sex} value="M" />Masculino
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" class="radio" bind:group={tempUser.sex} value="F" />Femenino
          </label>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">CI</legend>
        <label class="input w-full">
          <IdCardIcon />
          <input
            bind:value={tempUser.ci}
            oninput={e => (tempUser.ci = (e as any).target.value.replace(/\D/g, ""))}
            type="text"
            class="grow text-sm"
            placeholder="########"
            pattern={`[0-9]{11}`}
            required
          />
        </label>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Email</legend>
        <label class="input w-full">
          <MailIcon />
          <input
            bind:value={tempUser.email}
            type="email"
            class="grow text-sm"
            placeholder="email@email.com"
            required
          />
        </label>
      </fieldset>

      <div
        class="grid sm:grid-cols-3 grid-cols-1 md:grid-cols-1 gap-2 w-full justify-center col-span-full"
      >
        <button
          class="btn btn-primary order-1 md:order-1 sm:order-3"
          type="submit"
          disabled={loading}
        >
          {#if loading}
            <span class="loading loading-spinner loading-lg mx-auto"></span>
          {:else}
            <SendIcon {size} />
            Guardar
          {/if}
        </button>
        <button
          class="btn btn-warning order-2 md:order-2 sm:order-2"
          onclick={preventDefault(() => (showUpdatePasswordModal = true))}
        >
          <LockKeyholeIcon {size} />
          Cambiar contraseña
        </button>
        <button
          class="btn btn-ghost order-3 md:order-3 sm:order-1"
          onclick={() => (editMode = false)}
        >
          Cancelar
        </button>
      </div>
    </form>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
      <span class="text-sm flex items-center gap-1 text-yellow-200">
        <MapPinIcon {size} />
        {tempUser?.province}
      </span>
      <span class="text-sm flex items-center gap-1">
        <a
          href={`${SITEMAP.people}/${tempUser?.username || "#"}`}
          class="flex items-center gap-1 truncate text-sm font-medium text-pink-400"
        >
          <FingerprintIcon {size} />
          CCA-ID: {tempUser?.username}
        </a>
      </span>
      <span class="text-sm flex items-center gap-1">
        <SigmaIcon {size} />
        SoR: {tempUser?.sor}
      </span>
      <span class="text-sm flex items-center gap-1">
        {#if tempUser?.sex === "F"}
          <VenusIcon {size} />
        {:else}
          <MarsIcon {size} />
        {/if}
        Sexo: {tempUser ? (tempUser.sex === "F" ? "Femenino" : "Masculino") : ""}
      </span>
      <span class="text-sm flex items-center gap-1">
        <ClockIcon {size} />
        Edad: {tempUser?.age}
      </span>

      {#if minRole($userStore, "delegate") || ($userStore && tempUser && $userStore.id === tempUser.id)}
        <span class="text-sm flex items-center gap-1">
          <FingerprintIcon {size} />
          CI: {tempUser?.ci}
        </span>
        <span class="text-sm flex items-center gap-1">
          <HandCoinsIcon {size} />
          Crédito: {tempUser?.credit} CUP
        </span>
        <span class="text-sm flex items-center gap-1">
          <MailIcon {size} />

          {tempUser?.email}

          {#if tempUser?.isEmailVerified}
            <BadgeCheckIcon {size} class="text-green-300" />
          {/if}
        </span>

        <div class="flex gap-2 w-full justify-center col-span-full">
          <button
            class="btn btn-primary w-full max-w-40"
            onclick={() => {
              if (!tempUser) return;
              tempUser = { ...tempUser };
              editMode = true;
            }}
          >
            Editar
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<Modal
  bind:show={showUpdatePasswordModal}
  onclose={() => {
    tempPassword = "";
    tempConfirmPassword = "";
  }}
>
  <h2 class="text-xl text-center mb-4">Cambiar contraseña</h2>
  <form
    onsubmit={() => {
      if (!tempUser) return;
      tempUser.password = tempPassword;
      showUpdatePasswordModal = false;
    }}
    class="grid justify-center gap-2 mx-auto"
  >
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Nueva contraseña</legend>
      <label class="input validator">
        <KeyRoundIcon />
        <input
          bind:value={tempPassword}
          type="password"
          class="grow"
          placeholder="Contraseña"
          autocomplete="off"
          pattern={`(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}`}
          required
        />
      </label>
      <p class="validator-hint">
        {#if tempPassword.length < 8}
          La contraseña debe tener al menos 8 caracteres
        {:else if !tempPassword.match(/\d/) || !tempPassword.match(/[a-zA-Z]/)}
          La contraseña debe tener al nenos una letra y un número
        {/if}
      </p>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Confirmar contraseña</legend>
      <label class="input">
        <KeyRoundIcon />
        <input
          bind:value={tempConfirmPassword}
          type="password"
          class="grow"
          placeholder="Confirmar contraseña"
          autocomplete="off"
          minlength="8"
          required
        />
      </label>
    </fieldset>

    <div class="flex gap-2 mt-4">
      <button class="btn" onclick={() => (showUpdatePasswordModal = false)}>Cancelar</button>
      <button
        class="btn btn-primary"
        disabled={!tempPassword || tempPassword != tempConfirmPassword}
        type="submit"
      >
        <SaveIcon size="1.2rem" />
        <span class="ml-1">Actualizar</span>
      </button>
    </div>
  </form>
</Modal>
