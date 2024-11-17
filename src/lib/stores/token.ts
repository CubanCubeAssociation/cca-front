import type { TOKENS } from "src/interfaces";
import { writable } from "svelte/store";

const tokenStore = writable<TOKENS | null>(null);

export { tokenStore };
