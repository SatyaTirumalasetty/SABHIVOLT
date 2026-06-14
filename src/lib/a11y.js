import { useEffect } from "react";

/* Focus trap + Escape-to-close for dialogs */
export function useDialogA11y(containerRef, onClose) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const previouslyFocused = document.activeElement;
    const getFocusables = () =>
      Array.from(
        el.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((n) => !n.disabled && n.offsetParent !== null);

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = getFocusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    el.addEventListener("keydown", onKey);
    const f = getFocusables();
    if (f.length) f[0].focus();

    return () => {
      el.removeEventListener("keydown", onKey);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
