<script lang="ts">
  import { ripple } from './actions/ripple';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let flat = false;
  export let rp = true;
  export let file: boolean = false;
  export let tabindex = 0;
  export let ariaLabel = '';
  export let disabled = false;
  let cl = "";
  export { cl as class };

  function handleClick(e: MouseEvent) {
    if ( disabled ) return;

    dispatch('click', e);

    if ( file ) {
      let f = document.createElement('input');
      f.type = 'file';
      f.style.display = 'none';
      f.addEventListener('change', (e) => {
        dispatch('files', f.files);
        f.remove();
      });
      document.body.appendChild(f);
      f.click();
    }
  }
</script>

<button {tabindex} on:click={handleClick} use:ripple={ rp } aria-label={ ariaLabel }
  class={` bg-blue-500
    border px-4 py-2 rounded-md shadow-md flex items-center justify-center border-none
    relative uppercase transition-all duration-200

    hover:shadow-lg
  ` + (flat ? ' shadow-none px-2 py-1 ' : '') + (cl || ' hover:bg-blue-400 hover:bg-opacity-90 ')}
  aria-disabled={ disabled } {disabled}
>
  <slot />
</button>

<style lang="postcss">
  button {
    @apply outline-transparent
  }

  button[disabled] {
    @apply bg-gray-200 text-gray-400 pointer-events-none;
  }
</style>