export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  throw: boolean;
  throwPressed: boolean;
  super: boolean;
  superPressed: boolean;
};

export function createInput(): InputState {
  return {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    throw: false,
    throwPressed: false,
    super: false,
    superPressed: false,
  };
}

export function bindControls(input: InputState): void {
  const hold = (el: HTMLElement | null, key: "left" | "right" | "jump" | "throw" | "super"): void => {
    if (!el) return;
    const set = (on: boolean, ev: Event): void => {
      ev.preventDefault();
      input[key] = on;
      el.classList.toggle("on", on);
      if ((key === "jump" || key === "throw" || key === "super") && on) {
        if (key === "jump") input.jumpPressed = true;
        if (key === "throw") input.throwPressed = true;
        if (key === "super") input.superPressed = true;
      }
    };
    el.addEventListener("pointerdown", (ev) => {
      try {
        el.setPointerCapture((ev as PointerEvent).pointerId);
      } catch {
        /* capture is optional; some hosts reject it */
      }
      set(true, ev);
    });
    el.addEventListener("pointerup", (ev) => set(false, ev));
    el.addEventListener("pointercancel", (ev) => set(false, ev));
    el.addEventListener("lostpointercapture", (ev) => set(false, ev));
    el.addEventListener("mousedown", (ev) => set(true, ev));
    el.addEventListener("mouseup", (ev) => set(false, ev));
    el.addEventListener(
      "touchstart",
      (ev) => set(true, ev),
      { passive: false },
    );
    el.addEventListener("touchend", (ev) => set(false, ev));
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (key === "jump") input.jumpPressed = true;
      if (key === "throw") input.throwPressed = true;
      if (key === "super") input.superPressed = true;
    });
  };

  hold(document.getElementById("btn-left"), "left");
  hold(document.getElementById("btn-right"), "right");
  hold(document.getElementById("btn-jump"), "jump");
  hold(document.getElementById("btn-throw"), "throw");
  hold(document.getElementById("btn-super"), "super");

  const keyMap: Record<string, "left" | "right" | "jump" | "throw" | "super"> = {
    ArrowLeft: "left",
    ArrowRight: "right",
    a: "left",
    d: "right",
    A: "left",
    D: "right",
    ArrowUp: "jump",
    w: "jump",
    W: "jump",
    " ": "jump",
    j: "throw",
    J: "throw",
    f: "throw",
    F: "throw",
    k: "throw",
    K: "throw",
    g: "super",
    G: "super",
    Shift: "super",
  };

  const down = (ev: KeyboardEvent): void => {
    const k = keyMap[ev.key];
    if (!k) return;
    ev.preventDefault();
    if (k === "jump" && !input.jump) input.jumpPressed = true;
    if (k === "throw" && !input.throw) input.throwPressed = true;
    if (k === "super" && !input.super) input.superPressed = true;
    input[k] = true;
  };
  const up = (ev: KeyboardEvent): void => {
    const k = keyMap[ev.key];
    if (!k) return;
    input[k] = false;
  };
  window.addEventListener("keydown", down, true);
  window.addEventListener("keyup", up, true);
  document.addEventListener("keydown", down, true);
  document.addEventListener("keyup", up, true);

  const clear = (): void => releaseAll(input);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
}

export function releaseAll(input: InputState): void {
  input.left = false;
  input.right = false;
  input.jump = false;
  input.throw = false;
  input.super = false;
  input.jumpPressed = false;
  input.throwPressed = false;
  input.superPressed = false;
  for (const id of ["btn-left", "btn-right", "btn-jump", "btn-throw", "btn-super"]) {
    document.getElementById(id)?.classList.remove("on");
  }
}
