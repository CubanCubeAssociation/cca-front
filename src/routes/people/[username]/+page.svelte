<script lang="ts">
  import { getAvatarRoute, getUserProfile } from "@helpers/API";
  import type { USER_PROFILE } from "@interfaces";
  import { Avatar, Card, Heading } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import UserField from "@components/UserField.svelte";
  import { minRole } from "@helpers/auth";
  import { userStore } from "$lib/stores/user";
  import LocationIcon from "@icons/MapMarkerOutline.svelte";
  import VerifiedIcon from "@icons/CheckDecagramOutline.svelte";
  import Award from "@components/Award.svelte";
  import UnderConstruction from "@components/UnderConstruction.svelte";

  const awardSize = 1.5;
  // let loading = $state(false);
  // let error = $state(false);

  let profile: USER_PROFILE | null = $state(null);

  function getData() {
    // loading = true;
    // error = false;

    getUserProfile($page.params.username).then(p => {
      if (!p) {
        return;
      }

      profile = p;
    });
    // .catch(err => {
    // console.log("ERROR: ", err);
    // error = true;
    // });
    // .finally(() => {
    //   loading = false;
    // });
  }

  onMount(() => {
    getData();
  });
</script>

<Card class="mx-auto mb-8 mt-4 flex w-[calc(100%-2rem)] max-w-6xl flex-col items-center gap-4">
  <section class="grid md:flex gap-4 w-full">
    <aside class="w-full md:max-w-[16rem]">
      <!-- Profile -->
      <section id="profile">
        <Avatar
          size="lg"
          src={getAvatarRoute(profile?.user.username || "")}
          border
          class={"p-0 " +
            (profile?.user.role === "root"
              ? "!ring-purple-500 dark:!ring-purple-400"
              : profile?.user.role === "admin"
                ? "!ring-primary-500 dark:!ring-primary-400"
                : profile?.user.role === "delegate"
                  ? "!ring-green-500 dark:!ring-green-400"
                  : "")}
        />
        <h1 class="font-bold text-lg">
          <UserField user={profile?.user || { username: "", name: "", role: "user" }} />
        </h1>
        <span class="text-sm flex items-center gap-1">
          <LocationIcon size="1.1rem" class="text-yellow-200" />
          {profile?.user.province}
        </span>
        <span class="text-sm flex items-center gap-1">
          <a
            href={`/people/${profile?.user.username || "#"}`}
            class="block truncate text-sm font-medium text-pink-400"
          >
            CCA ID: {profile?.user.username}
          </a>
        </span>
        <span class="text-sm flex items-center gap-1">
          Sexo: {profile?.user ? (profile?.user.sex === "M" ? "Masculino" : "Femenino") : ""}
        </span>
        <span class="text-sm flex items-center gap-1">Edad: {profile?.user.age}</span>

        {#if minRole($userStore, "delegate")}
          <span class="text-sm flex items-center gap-1">Crédito: {profile?.user.credit} CUP</span>
          <span class="text-sm flex items-center gap-1">
            {profile?.user.email}

            {#if profile?.user.isEmailVerified || true}
              <VerifiedIcon class="text-green-300" />
            {/if}
          </span>
        {/if}
      </section>

      <!-- ELO -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">ELO</Heading>
        <UnderConstruction />
      </section>
    </aside>

    <aside>
      <!-- Podium -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">Podios</Heading>
        <!-- <UnderConstruction /> -->

        <ul class="podium-list">
          <li class="border-yellow-300 !shadow-yellow-400">
            <Heading tag="h3" class="text-center text-xl flex items-center justify-center gap-2">
              <Award type="gold" size={awardSize} /> Oro
            </Heading>
            <span>{profile?.podium.first[0]}</span>
          </li>
          <li class="border-gray-300 !shadow-gray-400">
            <Heading tag="h3" class="text-center text-xl flex items-center justify-center gap-2">
              <Award type="silver" size={awardSize} /> Plata
            </Heading>
            <span>{profile?.podium.second[0]}</span>
          </li>
          <li class="border-orange-300 !shadow-orange-400">
            <Heading tag="h3" class="text-center text-xl flex items-center justify-center gap-2">
              <Award type="bronze" size={awardSize} /> Bronce
            </Heading>
            <span>{profile?.podium.third[0]}</span>
          </li>
        </ul>
      </section>

      <!-- Results -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">Resultados</Heading>
        <UnderConstruction />
      </section>

      <!-- Development -->
      <section>
        <Heading tag="h2" class="text-center mb-4 text-2xl">Desempeño</Heading>
        <UnderConstruction />
      </section>
    </aside>
  </section>
</Card>

<style lang="postcss">
  aside {
    @apply grid gap-4 w-full;
  }

  aside > section {
    @apply border border-gray-700 py-4 px-2 rounded-md shadow-md 
      bg-gray-700 text-gray-200 grid place-items-center;
  }

  #profile {
    @apply grid place-items-center gap-2;
  }

  .podium-list {
    @apply flex gap-2 justify-evenly w-full;
  }

  .podium-list li {
    @apply border p-2 rounded-md grid place-items-center w-full shadow-sm;
  }

  .podium-list li span {
    @apply text-2xl;
  }
</style>
