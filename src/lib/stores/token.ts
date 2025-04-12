import type { TOKENS } from "@interfaces";
import { writable } from "svelte/store";

const tokenStore = writable<TOKENS | null>(null);

export { tokenStore };
