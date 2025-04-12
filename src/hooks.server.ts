import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get("access_token");
  const refreshToken = event.cookies.get("refresh_token");

  console.log("ACCESS_TOKEN: ", accessToken, refreshToken);

  return await resolve(event);
};
