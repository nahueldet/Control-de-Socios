import React, { useMemo } from 'react';
import { getBarcodeBars } from '../utils/finance';

interface BarcodeRendererProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  height = 48,
  barWidth = 1.8,
  showText = true,
  className = '',
}) => {
  const bars = useMemo(() => {
    return getBarcodeBars(value, barWidth);
  }, [value, barWidth]);

  const totalWidth = useMemo(() => {
    if (bars.length === 0) return 180;
    const lastBar = bars[bars.length - 1];
    return lastBar.x + lastBar.width + 10;
  }, [bars]);

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="shape-rendering-crispEdges max-w-full"
      >
        <rect width={totalWidth} height={height} fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={2}
            width={bar.width}
            height={height - 4}
            fill="#0f172a"
          />
        ))}
      </svg>
      {showText && (
        <span className="font-mono text-[10px] tracking-wider text-slate-700 mt-1 font-semibold uppercase">
          {value}
        </span>
      )}
    </div>
  );
};
