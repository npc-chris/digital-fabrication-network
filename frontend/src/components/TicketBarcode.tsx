'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface TicketBarcodeProps {
  value: string;
  className?: string;
}

export default function TicketBarcode({ value, className = '' }: TicketBarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        lineColor: '#0f172a',
        background: 'transparent',
        width: 2,
        height: 36,
        margin: 0,
        displayValue: false,
      });
    } catch {
      // Fallback: leave SVG empty if value cannot be encoded
    }
  }, [value]);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={`Code 128 barcode for ${value}`}
      className={`block h-9 w-full ${className}`.trim()}
    />
  );
}
