import type { USER } from 'src/interfaces';
import { writable } from 'svelte/store';

const userStore = writable<USER | null>(null);

export { userStore };