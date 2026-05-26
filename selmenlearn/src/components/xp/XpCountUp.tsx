"use client";

import { useEffect, useRef, useState } from "react";

interface XpCountUpProps {
  target:    number;
  duration?: number; // ms
  prefix?:   string;
  className?: string;
}

export function XpCountUp({
  target,
  duration = 1200,
  prefix   = "",
  className,
}: XpCountUpProps) {
  const [count, setCount]  = useState(0);
  const frameRef           = useRef<number>(0);
  const startRef           = useRef<number>(0);

  useEffect(() => {
    startRef.current = 0;
    setCount(0);

    if (target === 0) return;

    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const pct   = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3); // ease-out-cubic
      setCount(Math.round(target * eased));
      if (pct < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}
    </span>
  );
}
