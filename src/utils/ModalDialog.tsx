import { useEffect, useRef, type ReactNode } from "react";
import ui from "./ui.module.css";

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  /** Id of the visible heading that names the dialog. */
  labelledBy?: string;
  /** Accessible name when the dialog has no visible heading. */
  label?: string;
  /**
   * The control that opened the dialog, which gets the focus back when it closes. Safari and
   * Firefox on macOS do not focus a link or a button on a click, so the focused element is only
   * the fallback.
   */
  opener?: HTMLElement | null;
  className?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, video[controls], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog built on the native <dialog> element (RGAA 7.1, 12.9 and 12.10):
 * - opened with showModal(), so the rest of the page is inert and focus moves into the dialog;
 * - Tab and Shift+Tab stay inside the dialog (focus guards at both ends);
 * - Escape, the close control of the caller and a click on the backdrop close it; a press that
 *   starts or ends inside the dialog (a text selection, a drag) does not;
 * - focus goes back to the control that opened it.
 * The content is rendered only while the dialog is open (players stop when it closes).
 */
export default function ModalDialog({
  open,
  onClose,
  labelledBy,
  label,
  opener: trigger,
  className,
  children,
}: ModalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const triggerRef = useRef(trigger);
  triggerRef.current = trigger;
  /** Where the current press started and ended: true when on the backdrop. */
  const press = useRef({ down: false, up: false });
  const opening = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const focused = document.activeElement;
      opener.current =
        triggerRef.current ??
        (focused instanceof HTMLElement && focused !== document.body ? focused : null);
      opening.current = true;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      opening.current = false;
      focusables()[0]?.focus();
      const root = document.documentElement;
      const overflow = root.style.overflow;
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = overflow;
      };
    }
    if (!open) {
      if (dialog.open) dialog.close();
      const target = opener.current;
      opener.current = null;
      if (target && target.isConnected) target.focus();
    }
  }, [open]);

  /** Focusable elements of the dialog, without the two focus guards. */
  const focusables = () =>
    Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (element) => !element.hasAttribute("data-focus-guard") && element.offsetParent !== null,
    );

  /**
   * Focus guards at both ends: Tab from the last element (including from inside a third-party
   * player frame, whose key events never reach this page) lands on a guard that sends the focus
   * back to the other end.
   */
  const guard = (edge: "start" | "end") => (
    <span
      data-focus-guard=""
      tabIndex={0}
      className={ui.visuallyHidden}
      onFocus={() => {
        if (opening.current) return;
        const items = focusables();
        (edge === "start" ? items[items.length - 1] : items[0])?.focus();
      }}
    />
  );

  return (
    <dialog
      ref={ref}
      className={`${ui.dialog} ${className ?? ""}`}
      // Set only while open: ids made by useId differ between the server render of the page and
      // the hydration of the island, and React keeps the server's attributes on hydration.
      aria-labelledby={open ? labelledBy : undefined}
      aria-label={open && !labelledBy ? label : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onCloseRef.current();
      }}
      onPointerDown={(event) => {
        press.current = { down: event.target === ref.current, up: false };
      }}
      onPointerUp={(event) => {
        press.current.up = event.target === ref.current;
      }}
      onClick={(event) => {
        const { down, up } = press.current;
        press.current = { down: false, up: false };
        if (down && up && event.target === ref.current) onCloseRef.current();
      }}
    >
      {open && (
        <>
          {guard("start")}
          {children}
          {guard("end")}
        </>
      )}
    </dialog>
  );
}
