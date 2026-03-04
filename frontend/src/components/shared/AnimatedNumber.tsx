import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  duration = 800,
}: Props) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    const diff = to - from;
    if (Math.abs(diff) < 0.01) {
      setDisplay(to);
      prevRef.current = to;
      return;
    }

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + diff * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = to;
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted =
    prefix +
    (display < 0 ? "-" : "") +
    (prefix.includes("$") ? "" : "") +
    Math.abs(display)
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    suffix;

  return (
    <span className={`tabular-nums font-mono ${className}`}>{formatted}</span>
  );
}
