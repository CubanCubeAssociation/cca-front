import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // const accessToken = event.cookies.get("access_token");
  // const refreshToken = event.cookies.get("refresh_token");

  return await resolve(event);
};
