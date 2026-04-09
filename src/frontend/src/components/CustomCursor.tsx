import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const CLICKABLE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label, [onClick], [class*='cursor-pointer']";

export default function CustomCursor() {
  const [isTouchDevice] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(hover: none)").matches;
  });

  const dotEl = useRef<HTMLDivElement>(null);
  const ringEl = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isHovering = useRef(false);
  const rafId = useRef<number>(0);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (isTouchDevice) return;

    // Inject cursor-hiding CSS
    const styleTag = document.createElement("style");
    styleTag.textContent =
      "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(styleTag);
    styleTagRef.current = styleTag;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Update dot position immediately (zero lag)
      if (dotEl.current) {
        dotEl.current.style.left = `${e.clientX}px`;
        dotEl.current.style.top = `${e.clientY}px`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const isClickable = !!target.closest(CLICKABLE_SELECTOR);
      if (isClickable !== isHovering.current) {
        isHovering.current = isClickable;
        if (ringEl.current) {
          if (isClickable) {
            ringEl.current.classList.add("cursor-ring--hover");
          } else {
            ringEl.current.classList.remove("cursor-ring--hover");
          }
        }
        if (dotEl.current) {
          if (isClickable) {
            dotEl.current.classList.add("cursor-dot--hover");
          } else {
            dotEl.current.classList.remove("cursor-dot--hover");
          }
        }
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const relatedTarget = e.relatedTarget as Element | null;
      // Only remove hover if we've left the clickable element entirely
      if (relatedTarget && target.closest(CLICKABLE_SELECTOR)) {
        if (!relatedTarget.closest(CLICKABLE_SELECTOR)) {
          isHovering.current = false;
          ringEl.current?.classList.remove("cursor-ring--hover");
          dotEl.current?.classList.remove("cursor-dot--hover");
        }
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      if (ringEl.current) {
        ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.12);
        ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.12);
        ringEl.current.style.left = `${ringPos.current.x}px`;
        ringEl.current.style.top = `${ringPos.current.y}px`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(rafId.current);
      if (styleTagRef.current) {
        document.head.removeChild(styleTagRef.current);
        styleTagRef.current = null;
      }
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return ReactDOM.createPortal(
    <>
      {/* Dot — exact mouse position, zero lag */}
      <div
        ref={dotEl}
        className="cursor-dot"
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9999,
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "oklch(0.72 0.18 198)",
          transform: "translate(-50%, -50%)",
          left: "-100px",
          top: "-100px",
          transition: "transform 0.15s ease, background-color 0.15s ease",
        }}
      />
      {/* Ring — smooth lag follow via RAF */}
      <div
        ref={ringEl}
        className="cursor-ring"
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9998,
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "2px solid oklch(0.65 0.28 285)",
          background: "transparent",
          opacity: 0.75,
          transform: "translate(-50%, -50%) scale(1)",
          left: "-100px",
          top: "-100px",
          transition:
            "transform 0.15s ease, border-color 0.15s ease, opacity 0.15s ease",
        }}
      />
      <style>{`
        .cursor-ring--hover {
          transform: translate(-50%, -50%) scale(1.8) !important;
          border-color: oklch(0.72 0.18 198) !important;
          opacity: 0.9 !important;
        }
        .cursor-dot--hover {
          transform: translate(-50%, -50%) scale(0.5) !important;
        }
      `}</style>
    </>,
    document.body,
  );
}
