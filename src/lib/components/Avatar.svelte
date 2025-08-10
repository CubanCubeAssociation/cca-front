<script lang="ts">
  import { getAvatarRoute } from "@helpers/API";
  import type { USER } from "@interfaces";
  import { twMerge } from "tailwind-merge";

  type USER_LIKE = Pick<USER, "name" | "role" | "username"> & { avatar?: string };

  interface IAvatarProps {
    user: USER_LIKE | null | undefined;
    showName?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    class?: string;
  }

  let { user, showName, size, class: _cl = $bindable("") }: IAvatarProps = $props();

  const sizeClasses: Record<IAvatarProps["size"] & string, string> = {
    xs: "w-6",
    sm: "w-8",
    md: "w-10",
    lg: "w-14",
    xl: "w-22",
  };
</script>

<div class={twMerge("avatar", _cl)}>
  <div
    class={twMerge(
      "ring-offset-base-100 rounded-full ring ring-offset-2",
      sizeClasses[size || "sm"],
      user?.role === "root"
        ? "ring-purple-500 "
        : user?.role === "admin"
          ? "ring-primary"
          : user?.role === "delegate"
            ? "ring-green-500"
            : ""
    )}
  >
    <img alt={user?.name} src={getAvatarRoute(user?.username || "")} />
    {#if showName}
      <span class="md:hidden">{user?.name}</span>
    {/if}
  </div>
</div>
