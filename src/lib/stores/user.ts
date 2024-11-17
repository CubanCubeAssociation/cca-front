import type { USER } from "@interfaces";
import { writable } from "svelte/store";

const userStore = writable<USER | null>(null);

export { userStore };
