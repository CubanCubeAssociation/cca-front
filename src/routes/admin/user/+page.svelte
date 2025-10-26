<script lang="ts">
  import { onMount } from "svelte";
  import type { USER } from "@interfaces";
  import { getUsers, updateAllUserProfiles } from "@helpers/API";

  import PaginatorComponent from "@components/PaginatorComponent.svelte";
  import SearchUser from "$lib/components/SearchUser.svelte";
  import { goto } from "$app/navigation";
  import PrivateRouteGuard from "@components/PrivateRouteGuard.svelte";
  import { page } from "$app/state";
  import UserField from "@components/UserField.svelte";
  import { Paginator } from "@classes/Paginator.svelte";
  import { NotificationService } from "@stores/notification.service";
  import { PlusIcon, UsersIcon } from "lucide-svelte";
  import LoadingLayout from "@components/LoadingLayout.svelte";
  import { SITEMAP } from "@helpers/routing";

  const notification = NotificationService.getInstance();
  const HEADER = "Usuarios";
  const ADD = "Añadir usuario";

  let loading = false;
  let error = false;
  let users: USER[] = [];
  let columns = [
    {
      key: "name",
      column: "Nombre",
      show: true,
    },
    {
      key: "username",
      column: "Usuario",
      show: true,
    },
    {
      key: "ci",
      column: "CI",
      show: true,
    },
    {
      key: "email",
      column: "Email",
      show: true,
    },
    {
      key: "province",
      column: "Provincia",
      show: true,
    },
    {
      key: "municipality",
      column: "Municipio",
      show: true,
    },
    {
      key: "credit",
      column: "Crédito",
      show: true,
    },
  ];
  let pg = new Paginator([], 10);

  function addUser() {
    console.log(SITEMAP.admin.user + "/new");
    goto(SITEMAP.admin.user + "/new");
  }

  function updateUsers() {
    loading = true;
    error = false;

    getUsers({ page: pg.page, limit: pg.limit })
      .then(res => {
        if (!res) {
          error = true;
          return;
        }

        users = res.results;

        pg.setTotal(res.totalResults);
        pg = pg;
        goto(page.url.pathname + `/?page=${pg.page}`, { replaceState: true });

        if (users.length) {
          const HOP = Object.prototype.hasOwnProperty;
          let u = users[0];

          for (let i = 0, maxi = columns.length; i < maxi; i += 1) {
            columns[i].show = HOP.call(u, columns[i].key) && users.some(u => u[columns[i].key]);
          }
        }
      })
      .catch(() => (error = true))
      .finally(() => (loading = false));
  }

  function updatePaginator() {
    updateUsers();
  }

  function handleSearch(user: USER | USER[]) {
    if (Array.isArray(user)) return;
    window.open(`${SITEMAP.admin.user}/${user.id}`, "_blank");
  }

  function updateAllProfiles() {
    updateAllUserProfiles()
      .then(() => {
        notification.addNotification({
          header: "Hecho",
          text: "Datos de los usuarios actualizados.",
          timeout: 2000,
        });
      })
      .catch(err => console.log("ERROR", err));
  }

  onMount(updateUsers);
</script>

<PrivateRouteGuard>
  <LoadingLayout {loading} {error} altError={false} reloadFunction={updateUsers}>
    {#snippet title()}
      <UsersIcon size="1.5rem" class="text-blue-400" />
      {HEADER}
    {/snippet}

    {#snippet content()}
      <div class="actions gap-2">
        <button class="btn btn-primary" onclick={addUser}>
          <PlusIcon size="1.2rem" />
          {ADD}
        </button>

        <SearchUser multiple={false} user={handleSearch} type="dropdown" />

        <button class="btn btn-accent" onclick={updateAllProfiles}>Actualizar perfiles</button>
      </div>

      {#if users.length > 0}
        <PaginatorComponent {pg} update={updatePaginator} class="mb-4" />

        <div class="overflow-x-auto max-w-full rounded-lg border border-base-content/10">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                {#each columns as C}
                  {#if C.show}
                    <th>{C.column}</th>
                  {/if}
                {/each}
              </tr>
            </thead>

            <tbody>
              {#each users as u, pos}
                <tr>
                  <td>{(pg.page - 1) * pg.limit + pos + 1}</td>

                  {#if columns[0].show}
                    <td>
                      <a
                        href={SITEMAP.admin.user + "/" + u.id}
                        class="flex items-center gap-2 text-ellipsis"
                      >
                        <UserField user={u} showAvatar fullName />
                      </a>
                    </td>
                  {/if}

                  {#if columns[1].show}
                    <td>{u.username}</td>
                  {/if}

                  {#if columns[2].show}
                    <td>
                      {u.ci || "-"}
                      <div>{u.sex} / {u.age} años</div>
                    </td>
                  {/if}

                  {#if columns[3].show}
                    <td>{u.email || "-"}</td>
                  {/if}
                  {#if columns[4].show}
                    <td>{u.province || "-"}</td>
                  {/if}
                  {#if columns[5].show}
                    <td>{u.municipality || "-"}</td>
                  {/if}
                  {#if columns[6].show}
                    <td>{u.credit} CUP</td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <PaginatorComponent {pg} update={updatePaginator} class="mt-4" />

        <div class="actions">
          <button class="btn btn-primary" onclick={addUser}>
            <PlusIcon size="1.2rem" />
            {ADD}
          </button>
        </div>
      {:else}
        <span class="text-center">No hay usuarios todavía</span>
      {/if}
    {/snippet}
  </LoadingLayout>
</PrivateRouteGuard>

<style lang="postcss">
  @reference "tailwindcss";
  .actions {
    @apply my-4 flex justify-start;
  }
</style>
