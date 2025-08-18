import { userStore } from "$lib/stores/user";
import { get } from "svelte/store";
import { clearSessionStores, getOwnUser, refreshToken } from "@helpers/API";

const debug = false;

function checkCookies(name: string) {
  return document.cookie.split("; ").filter(e => e.startsWith(name + "="));
}

export function checkAuth() {
  let checkingAuth = false;
  let waitForUser = false;

  const cb = async () => {
    if (checkingAuth || waitForUser) return;
    checkingAuth = true;

    if (
      !window.cookieStore ||
      !(await window.cookieStore.get("accessToken")) ||
      checkCookies("accessToken").length === 0
    ) {
      clearSessionStores();
    }

    if (!get(userStore)) {
      if (debug) console.log("Token does not exist or expired");

      if (await refreshToken()) {
        const user = await getOwnUser();

        if (user) {
          if (debug) console.log("IS AUTH");
          userStore.set(user);
        } else {
          clearSessionStores();
        }
      } else {
        waitForUser = true;

        const ubsubs = userStore.subscribe(newUser => {
          if (!newUser) return;
          waitForUser = false;
          ubsubs();
        });
      }
    } else if (debug) console.log("IS AUTH");

    checkingAuth = false;
  };

  cb();
  return setInterval(() => cb(), 60_000);
}
