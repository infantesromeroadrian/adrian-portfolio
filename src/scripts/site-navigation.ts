const SURFACE_OPEN_EVENT = "portfolio:surface-open";

function mountNavigation(root: HTMLElement): void {
  const toggle = root.querySelector<HTMLButtonElement>("[data-site-navigation-toggle]");
  const panel = root.querySelector<HTMLElement>("[data-site-navigation-panel]");
  if (!toggle || !panel) return;

  let open = false;
  toggle.hidden = false;

  const closeMenu = (returnFocus: boolean): void => {
    if (!open) return;
    open = false;
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open site navigation");
    if (returnFocus) toggle.focus({ preventScroll: true });
  };

  const openMenu = (): void => {
    if (open) return;
    window.dispatchEvent(new CustomEvent(SURFACE_OPEN_EVENT, { detail: "navigation" }));
    open = true;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close site navigation");
    panel.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", () => {
    if (open) closeMenu(true);
    else openMenu();
  });

  panel.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu(false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (open && event.target instanceof Node && !root.contains(event.target)) {
      closeMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu(true);
    }
  });

  window.addEventListener(SURFACE_OPEN_EVENT, (event) => {
    if (event instanceof CustomEvent && event.detail !== "navigation") closeMenu(false);
  });
}

const navigationRoot = document.querySelector<HTMLElement>("[data-site-navigation]");
if (navigationRoot) mountNavigation(navigationRoot);
