import React from 'react';

interface TempTrendChartProps {
  data: { temp: number }[];
  columnWidth: number;
  height: number;
}

export function TempTrendChart({ data, columnWidth, height }: TempTrendChartProps) {
  if (!data || data.length === 0) return null;

  const minTemp = Math.min(...data.map(d => d.temp));
  const maxTemp = Math.max(...data.map(d => d.temp));
  
  // Prevent division by zero
  const tempRange = Math.max(maxTemp - minTemp, 1);
  
  const paddingY = 15;
  const availableHeight = height - paddingY * 2;

  // Map temp to Y coordinate (higher temp = lower Y)
  const getY = (temp: number) => {
    const normalized = (temp - minTemp) / tempRange;
    return height - paddingY - (normalized * availableHeight);
  };

  const points = data.map((d, i) => {
    const x = i * columnWidth + (columnWidth / 2);
    const y = getY(d.temp);
    return { x, y, temp: d.temp };
  });

  // Create path data
  const createPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      // Smooth curve using cubic bezier
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = curr.x - (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const fullPath = createPath(points);

  return (
    <div className="absolute top-0 left-0" style={{ width: data.length * columnWidth, height }}>
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" /> {/* Red-ish for hot */}
            <stop offset="50%" stopColor="#fde047" /> {/* Yellow for medium */}
            <stop offset="100%" stopColor="#67e8f9" /> {/* Cyan for cold */}
          </linearGradient>
          
          <clipPath id="solidClip">
            {/* The "Now" marker is at columnWidth / 2 */}
            <rect x="0" y="0" width={columnWidth / 2} height="100%" />
          </clipPath>
          <clipPath id="dashedClip">
            <rect x={columnWidth / 2} y="0" width="100%" height="100%" />
          </clipPath>
        </defs>

        {/* Dashed line for forecasted hours */}
        <path
          d={fullPath}
          fill="none"
          stroke="url(#tempGradient)"
          strokeWidth="3"
          strokeDasharray="6 6"
          clipPath="url(#dashedClip)"
        />

        {/* Solid line for elapsed hours (up to Now marker) */}
        <path
          d={fullPath}
          fill="none"
          stroke="url(#tempGradient)"
          strokeWidth="3"
          clipPath="url(#solidClip)"
        />

        {/* Now Marker */}
        {points.length > 0 && (
          <g transform={`translate(${points[0].x}, ${points[0].y})`}>
            {/* Dashed vertical line down from marker */}
            <line x1="0" y1="0" x2="0" y2={height - points[0].y} stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4 4" />
            
            <circle r="12" fill="white" />
            <circle r="4" fill="#10b981" /> {/* Green inner dot */}
            <text x="0" y="4" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">
              {Math.round(points[0].temp)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
