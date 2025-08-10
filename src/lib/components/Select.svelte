<script lang="ts">
  import WcaCategory from "@components/wca/WCACategory.svelte";
  import { getColorByName } from "@constants";
  import { mod } from "@helpers/math";
  import { preventDefault } from "@helpers/object";
  import { weakRandomUUID } from "@helpers/strings";
  import type { Placement, Side } from "@interfaces";
  import { ChevronDownIcon } from "lucide-svelte";

  import { tick } from "svelte";
  import { twMerge } from "tailwind-merge";

  let cl = "";
  export { cl as class };
  export let type: "color" | "select" = "select";
  export let placeholder: string = "";
  export let value: any = placeholder;
  export let items: readonly any[];
  export let onChange: (item: any, pos: number, arr: readonly any[]) => any = (item: any) => item;
  export let label: (item: any, pos: number) => string = (item: any) => (item || "").toString();
  export let transform: (item: any, pos?: number, arr?: readonly any[]) => any = (item: any) =>
    item.value;
  export let hasIcon: null | ((v: any) => any) = null;
  export let disabled: (item: any, pos: number, arr?: readonly any[]) => boolean = () => false;
  export const placement: Side | Placement = "bottom";
  export const useFixed = false;
  export let iconComponent: any = WcaCategory;
  export let iconKey = "icon";
  export let iconSize: string | null = "1.2rem";
  export let preferIcon = false;
  export let open = () => {};
  export let close = () => {};

  const selectID = "s" + weakRandomUUID().replace(/-/g, "");

  let gridW = 1;
  let focused = 0;
  let dropdown: HTMLDivElement | null = null;

  function findValuePosition() {
    for (let i = 0, maxi = items.length; i < maxi; i += 1) {
      if (transform(items[i], i, items) === value) {
        return i;
      }
    }

    return -1;
  }

  function handleClick() {
    let list = document.querySelector(`#${selectID}`);

    if (!list) return;

    let pos = findValuePosition();

    if (pos > -1) {
      focused = pos;
      list.children[pos].scrollIntoView({ block: "nearest" });
      tick().then(() => focusElement(list));
    }
  }

  function emitStatus(st: boolean) {
    if (st) open();
    if (!st) close();

    if (st) focused = findValuePosition();
  }

  function updateGridW(list: readonly any[]) {
    gridW = Math.ceil(Math.sqrt(list.length));
  }

  function focusElement(list: any) {
    (list.children[focused].children[0] as HTMLButtonElement).focus();
  }

  function handleKeydown(ev: KeyboardEvent) {
    if (!dropdown || !dropdown.matches(":focus-within")) return;
    console.log("handleKeydown");

    if (ev.code === "Escape") {
      (dropdown.children[0] as any).blur();
      return;
    }

    if (ev.code === "Space") {
      ev.stopPropagation();
      ev.preventDefault();
      return;
    }

    if (!/^(Key[A-Z]|ArrowUp|ArrowDown|Digit|Numpat)/.test(ev.code)) return;

    let list = document.querySelector(`#${selectID}`);
    if (!list) {
      console.log("NO LIST");
      return;
    }

    ev.preventDefault();

    if (ev.code === "ArrowUp" || ev.code === "ArrowDown") {
      focused = mod(ev.code === "ArrowUp" ? focused - 1 : focused + 1, list.children.length);

      console.log("FOCUSED: ", focused);

      tick().then(() => focusElement(list));
      return;
    }

    let data = items.map((it, p) => ({
      label: (label(it, p) || "").trim().toLowerCase(),
      disabled: disabled(it, p, items),
      value: transform(it, p, items),
    }));

    if (!data.length) return;

    let letter = /^(Digit|Numpad)/.test(ev.code)
      ? ev.code.slice(-1)
      : ev.code.slice(3).toLowerCase();

    let ini = mod(focused + 1, data.length);

    for (let i = 0, maxi = data.length; i < maxi; i += 1) {
      let p = mod(ini + i, data.length);

      if (data[p].label.startsWith(letter)) {
        focused = p;
        tick().then(() => focusElement(list));
        return;
      }
    }
  }

  // $: emitStatus(showOptions);
  $: updateGridW(items);
</script>

<svelte:window on:keydown|capture={handleKeydown} />

<div class="dropdown" bind:this={dropdown} data-dropdown={selectID}>
  <div
    tabindex={0}
    role="button"
    class={twMerge("btn border border-base-content/20 !rounded-lg gap-1 h-9 py-1 px-2 ", cl)}
    onclick={preventDefault(handleClick)}
    {...$$restProps}
  >
    {#if items.some((a, p, i) => transform(a, p, i) === value)}
      {@const item = items.reduce(
        (acc, e, p, i) => (transform(e, p, i) === value ? [e, p] : acc),
        [null, -1]
      )}

      {#if hasIcon && iconComponent}
        {@const iconProps = Object.assign(iconSize ? { size: iconSize } : {}, {
          [iconKey]: hasIcon(item[0]),
        })}

        <svelte:component this={iconComponent} {...iconProps} noFallback />
      {/if}

      {#if !(hasIcon && iconComponent && preferIcon)}
        {#if type === "color"}
          <div
            class="color w-4 h-4"
            style={"background-color: " + getColorByName(label(item[0], item[1])) + ";"}
          ></div>
        {:else}
          {label(item[0], item[1])}
        {/if}
      {/if}
    {:else}
      {placeholder}
    {/if}

    <ChevronDownIcon size="1.2rem" class="ml-auto" />
  </div>

  <ul
    id={selectID}
    class="dropdown-content max-h-80 overflow-x-hidden overflow-y-auto menu
      bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm grid"
  >
    {#each items as item, pos}
      <li>
        <button
          class={`flex items-center gap-2 py-2 px-2 text-gray-300
          ` +
            (disabled(item, pos, items)
              ? " text-gray-500 [&>div]:opacity-40 pointer-events-none select-none "
              : " ") +
            (transform(item, pos, items) === value
              ? " bg-primary-600 text-gray-100 hover:bg-primary-400 "
              : " ")}
          onclick={preventDefault(e => {
            if (disabled(item, pos, items)) return;

            value = transform(item, pos, items);
            onChange(item, pos, items);
            (dropdown?.children[0] as any).blur();
            (e.target as any).blur();
          })}
        >
          {#if hasIcon && iconComponent}
            {@const iconProps = Object.assign(iconSize ? { size: iconSize } : {}, {
              [iconKey]: hasIcon(item),
            })}
            <svelte:component this={iconComponent} {...iconProps} noFallback />
          {/if}

          {#if label(item, pos).trim()}
            {#if type === "color"}
              <div
                class="color w-4 h-4"
                style={"background-color: " + getColorByName(label(item, pos)) + ";"}
              ></div>
            {:else}
              {label(item, pos)}
            {/if}
          {:else}
            &nbsp;
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>
