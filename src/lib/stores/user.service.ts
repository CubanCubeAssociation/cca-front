import { browser } from "$app/environment";
import { userStore } from "$lib/stores/user";
import { tokenStore } from "$lib/stores/token";
import { get } from "svelte/store";
import { clearSessionStores, refreshToken } from "@helpers/API";
import { isAuth } from "@helpers/auth";

const debug = false;

export async function checkAuth() {
  if (!isAuth(get(userStore))) {
    if (debug) console.log("Token does not exist or expired");

    if (await refreshToken()) {
      if (debug) console.log("Token updated app");
      location.reload();
    } else {
      if (debug) console.log("clearSessionData");
      clearSessionStores();
    }
  } else if (debug) console.log("IS AUTH");
}

export async function initializeUserService() {
  if (!browser) return;
  // console.log(
  //   `LOCAL_STORAGE: <${localStorage.getItem("tokens")}> <${localStorage.getItem("user")}>`
  // );

  if (localStorage.getItem("tokens") && localStorage.getItem("user")) {
    tokenStore.set(JSON.parse(localStorage.getItem("tokens")!));
    userStore.set(JSON.parse(localStorage.getItem("user")!));
    if (debug) console.log("Tokens initialized");
  } else {
    if (debug) console.log("clearSessionStores (localStorage not found)");
    clearSessionStores();
  }

  if (debug) console.log("Checking auth...");
  await checkAuth();
}
