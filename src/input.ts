export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  throw: boolean;
  throwPressed: boolean;
};

export function createInput(): InputState {
  return {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    throw: false,
    throwPressed: false,
  };
}

export function bindControls(input: InputState): void {
  const hold = (el: HTMLElement | null, key: "left" | "right" | "jump" | "throw"): void => {
    if (!el) return;
    const set = (on: boolean, ev: Event): void => {
      ev.preventDefault();
      input[key] = on;
      el.classList.toggle("on", on);
      if ((key === "jump" || key === "throw") && on) {
        if (key === "jump") input.jumpPressed = true;
        if (key === "throw") input.throwPressed = true;
      }
    };
    el.addEventListener("pointerdown", (ev) => {
      el.setPointerCapture((ev as PointerEvent).pointerId);
      set(true, ev);
    });
    el.addEventListener("pointerup", (ev) => set(false, ev));
    el.addEventListener("pointercancel", (ev) => set(false, ev));
    el.addEventListener("lostpointercapture", (ev) => set(false, ev));
  };

  hold(document.getElementById("btn-left"), "left");
  hold(document.getElementById("btn-right"), "right");
  hold(document.getElementById("btn-jump"), "jump");
  hold(document.getElementById("btn-throw"), "throw");

  const keyMap: Record<string, "left" | "right" | "jump" | "throw"> = {
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
  };

  window.addEventListener("keydown", (ev) => {
    const k = keyMap[ev.key];
    if (!k) return;
    ev.preventDefault();
    if (k === "jump" && !input.jump) input.jumpPressed = true;
    if (k === "throw" && !input.throw) input.throwPressed = true;
    input[k] = true;
  });
  window.addEventListener("keyup", (ev) => {
    const k = keyMap[ev.key];
    if (!k) return;
    input[k] = false;
  });
}
