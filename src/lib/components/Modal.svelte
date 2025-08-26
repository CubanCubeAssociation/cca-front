<script lang="ts">
  import { preventDefault } from "@helpers/object";
  import { XIcon } from "lucide-svelte";
  import { twMerge } from "tailwind-merge";

  interface ModalProps {
    show?: boolean;
    cancel?: boolean;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    transitionName?: string;
    class?: string;
    onclose?: (...data: any[]) => any;
    children?: () => any;
  }

  let {
    show = $bindable(false),
    cancel = $bindable(true),
    closeOnClickOutside = $bindable(true),
    closeOnEscape = $bindable(true),
    class: _cl = $bindable(""),
    transitionName = $bindable("none"),
    onclose = () => {},
    children = () => {},
  }: ModalProps = $props();

  let modal: HTMLDialogElement;

  function keyUpHandler(e: KeyboardEvent) {
    if (!show) return;
    e.stopPropagation();
  }

  function keyDownHandler(e: KeyboardEvent) {
    if (!show) return;

    if (e.target === e.currentTarget) {
      e.stopPropagation();
    }

    if (e.code === "Escape") {
      if (closeOnEscape) {
        close(null);
      } else {
        e.preventDefault();
      }
    }
  }

  function handleClick(ev: MouseEvent) {
    let tg = ev.target as HTMLElement | null;
    if (!cancel || !modal || !show || !tg) return;
    if (tg.getAttribute("data-type") != "modal") return;

    let bb = modal.children[0].getBoundingClientRect();
    let x1 = bb.x,
      y1 = bb.y;
    let x2 = x1 + bb.width,
      y2 = y1 + bb.height;
    let cx = ev.x,
      cy = ev.y;

    if (closeOnClickOutside && ((cx - x1) * (cx - x2) > 0 || (cy - y1) * (cy - y2) > 0)) {
      close(null);
    }
  }

  let isCallbackCalled = false;

  function close(data: any) {
    if (onclose) onclose(data || null);
    show = false;
    isCallbackCalled = true;
  }

  $effect(() => {
    if (show) {
      isCallbackCalled = false;
      modal?.showModal();
    } else {
      modal?.close();
      if (!isCallbackCalled) {
        close(null);
        isCallbackCalled = true;
      }
    }
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={modal}
  data-type="modal"
  role="alertdialog"
  onmousedown={handleClick}
  onkeyup={keyUpHandler}
  onkeydown={keyDownHandler}
  oncancel={e => !cancel && e.preventDefault()}
  class="modal mx-auto text-sm rounded-md show p-4 pt-3 overflow-visible backdrop-blur-md"
>
  <div class={twMerge("modal-box border bg-base-200 max-h-[calc(100vh-3rem)]", _cl)}>
    {#if cancel}
      <button
        tabindex="0"
        class="btn btn-ghost !p-1 min-h-[unset] w-6 h-6 rounded-full absolute right-2 top-2 hover:border-primary"
        onclick={preventDefault(close)}
      >
        <XIcon size="1rem" />
      </button>
    {/if}

    {#if show}
      {@render children?.()}
    {/if}
  </div>
</dialog>

<style lang="postcss">
  @keyframes fadeIn {
    from {
      background-color: #0000;
      backdrop-filter: blur(0);
    }

    to {
      background-color: #0003;
      backdrop-filter: blur(0.5rem);
    }
  }

  dialog::backdrop {
    z-index: -1;
    animation: fadeIn 200ms linear 0ms forwards;
    background-color: #0003;
    backdrop-filter: blur(0.5rem);
  }

  .show {
    animation: enter 400ms ease-in 1;
  }
</style>
