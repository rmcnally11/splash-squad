export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
};

export function createInput(): InputState {
  return { left: false, right: false, jump: false, jumpPressed: false };
}

export function bindControls(input: InputState): void {
  const hold = (el: HTMLElement | null, key: "left" | "right" | "jump"): void => {
    if (!el) return;
    const set = (on: boolean, ev: Event): void => {
      ev.preventDefault();
      input[key] = on;
      el.classList.toggle("on", on);
      if (key === "jump" && on) input.jumpPressed = true;
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

  const keyMap: Record<string, "left" | "right" | "jump"> = {
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
  };

  window.addEventListener("keydown", (ev) => {
    const k = keyMap[ev.key];
    if (!k) return;
    ev.preventDefault();
    if (k === "jump" && !input.jump) input.jumpPressed = true;
    input[k] = true;
  });
  window.addEventListener("keyup", (ev) => {
    const k = keyMap[ev.key];
    if (!k) return;
    input[k] = false;
  });
}
