import React, { useId, useState, useRef, useEffect, useMemo } from 'react';
import { motion, useTransform, useSpring, useMotionValueEvent, MotionValue } from 'motion/react';
import { TempUnit } from '../utils/convertTemp';

interface TempTrendChartProps {
  data: { temp: number }[];
  columnWidth: number;
  height: number;
  unit?: TempUnit;
  resetKey?: string;
  scrollX: MotionValue<number>;
  viewportWidth: number;
}

interface Point {
  x: number;
  y: number;
  temp: number;
}

export function TempTrendChart({ data, columnWidth, height, unit, resetKey, scrollX, viewportWidth }: TempTrendChartProps) {
  const uniqueId = useId().replace(/:/g, '_');
  const curveGradientId = `tempCurveGrad_${uniqueId}`;
  const columnBeamGradId = `columnBeamGrad_${uniqueId}`;
  const columnAuraGradId = `columnAuraGrad_${uniqueId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const minTemp = data.length > 0 ? Math.min(...data.map(d => d.temp)) : 0;
  const maxTemp = data.length > 0 ? Math.max(...data.map(d => d.temp)) : 0;
  const tempRange = Math.max(maxTemp - minTemp, 1);
  const paddingY = 16;
  const availableHeight = height - paddingY * 2;

  const getY = (temp: number) => {
    const normalized = (temp - minTemp) / tempRange;
    return height - paddingY - (normalized * availableHeight);
  };

  const getTempColor = (temp: number) => {
    const fraction = Math.max(0, Math.min(1, tempRange > 0 ? (temp - minTemp) / tempRange : 0.5));
    let r = 0, g = 0, b = 0;
    if (fraction < 0.5) {
      const t2 = fraction * 2;
      // Smooth interpolation from cool cyan (56, 189, 248) to warm amber (251, 191, 36)
      r = Math.round(56 + t2 * (251 - 56));
      g = Math.round(189 + t2 * (191 - 189));
      b = Math.round(248 + t2 * (36 - 248));
    } else {
      const t2 = (fraction - 0.5) * 2;
      // Smooth interpolation from warm amber (251, 191, 36) to hot coral (248, 113, 113)
      r = Math.round(251 + t2 * (248 - 251));
      g = Math.round(191 + t2 * (113 - 191));
      b = Math.round(36 + t2 * (113 - 36));
    }
    return { r, g, b };
  };

  const points: Point[] = useMemo(() => data.map((d, i) => ({
    x: i * columnWidth + (columnWidth / 2),
    y: getY(d.temp),
    temp: d.temp
  })), [data, columnWidth, height, minTemp, tempRange]);

  // Cubic Bezier interpolation logic for MotionValue transform
  const getInterpolatedValueAtX = (x: number): { y: number, temp: number } => {
    if (points.length === 0) return { y: 0, temp: 0 };
    const clampedX = Math.max(points[0].x, Math.min(points[points.length - 1].x, x));
    
    for (let i = 1; i < points.length; i++) {
      if (clampedX <= points[i].x) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const t = (clampedX - p0.x) / (p1.x - p0.x);
        const b0 = (1 - t) ** 3;
        const b1 = 3 * (1 - t) ** 2 * t;
        const b2 = 3 * (1 - t) * t ** 2;
        const b3 = t ** 3;
        const y = b0 * p0.y + b1 * p0.y + b2 * p1.y + b3 * p1.y;
        const temp = p0.temp + t * (p1.temp - p0.temp);
        return { y, temp };
      }
    }
    return { y: points[points.length - 1].y, temp: points[points.length - 1].temp };
  };

  // Traversal Logic: Mapping ScrollX to MarkerX
  const totalWidth = data.length * columnWidth;
  const maxScroll = Math.max(1, totalWidth - viewportWidth);
  const viewportBuffer = 20;
  const availableViewportRange = Math.max(1, viewportWidth - (viewportBuffer * 2));

  // High-performance MotionValue mappings
  const markerX = useTransform(scrollX, (s) => {
    const progress = Math.min(1, Math.max(0, s / maxScroll));
    const viewportX = viewportBuffer + (progress * availableViewportRange);
    return s + viewportX;
  });

  const markerY = useTransform(markerX, (x) => getInterpolatedValueAtX(x).y);
  
  // Smoothing with Spring
  const smoothMarkerX = useSpring(markerX, { stiffness: 200, damping: 30, mass: 0.5 });
  const smoothMarkerY = useSpring(markerY, { stiffness: 200, damping: 30, mass: 0.5 });

  // Reactive state for interpolated temperature
  const [interpolatedTemp, setInterpolatedTemp] = useState<number>(() => {
    return data[0]?.temp || 0;
  });

  // Update temp display state reactively when scrolling
  useMotionValueEvent(smoothMarkerX, "change", (latestX) => {
    const { temp } = getInterpolatedValueAtX(latestX);
    setInterpolatedTemp(temp);
  });

  // Instant reactive update when data, unit, or resetKey changes (e.g. °C -> °F or changing city)
  useEffect(() => {
    if (points.length > 0) {
      const currentX = smoothMarkerX.get() || points[0]?.x || 0;
      const { temp } = getInterpolatedValueAtX(currentX);
      setInterpolatedTemp(temp);
    }
  }, [data, unit, resetKey]);

  // Guaranteed immediate zero-delay display temperature even during rapid toggle renders
  const activeDisplayTemp = useMemo(() => {
    if (points.length === 0) return 0;
    if (interpolatedTemp < minTemp - 2 || interpolatedTemp > maxTemp + 2) {
      const currentX = smoothMarkerX.get() || points[0]?.x || 0;
      return getInterpolatedValueAtX(currentX).temp;
    }
    return interpolatedTemp;
  }, [interpolatedTemp, minTemp, maxTemp, points]);

  // Dynamically computed RGB based on the instantaneous active temperature
  const { r: activeR, g: activeG, b: activeB } = getTempColor(activeDisplayTemp);

  // Create smooth cubic bezier path data
  const createPath = (pts: Point[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
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
    <div 
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-none" 
      style={{ width: data.length * columnWidth, height: 180 }}
    >
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        style={{ overflow: 'visible', pointerEvents: 'none' }}
      >
        <defs>
          {/* Main Temperature Curve Gradient */}
          <linearGradient id={curveGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Atmospheric Vertical Column Beam (Soft vertical falloff, no harsh borders) */}
          <linearGradient id={columnBeamGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgba(${activeR},${activeG},${activeB},0)`} />
            <stop offset="20%" stopColor={`rgba(${activeR},${activeG},${activeB},0.06)`} />
            <stop offset="45%" stopColor={`rgba(${activeR},${activeG},${activeB},0.15)`} />
            <stop offset="75%" stopColor={`rgba(${activeR},${activeG},${activeB},0.06)`} />
            <stop offset="100%" stopColor={`rgba(${activeR},${activeG},${activeB},0)`} />
          </linearGradient>

          {/* Ambient Diffused Aura centered at active temperature point */}
          <radialGradient id={columnAuraGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(${activeR},${activeG},${activeB},0.32)`} />
            <stop offset="40%" stopColor={`rgba(${activeR},${activeG},${activeB},0.12)`} />
            <stop offset="80%" stopColor={`rgba(${activeR},${activeG},${activeB},0.02)`} />
            <stop offset="100%" stopColor={`rgba(${activeR},${activeG},${activeB},0)`} />
          </radialGradient>
        </defs>

        {/* Ethereal Atmospheric Column Pillar - gives the focus column vibe without being a literal box */}
        <motion.rect
          style={{ x: useTransform(smoothMarkerX, x => x - columnWidth / 2) }}
          y={0}
          width={columnWidth}
          height={180}
          fill={`url(#${columnBeamGradId})`}
          rx="18"
          className="pointer-events-none transition-colors duration-300"
        />

        {/* Soft Radiant Ambient Aura around the active temperature position */}
        <motion.ellipse
          style={{ 
            cx: smoothMarkerX, 
            cy: smoothMarkerY 
          }}
          rx={columnWidth * 0.8}
          ry="46"
          fill={`url(#${columnAuraGradId})`}
          className="pointer-events-none transition-colors duration-300"
        />

        {/* Main Solid Temperature Path */}
        <path
          d={fullPath}
          fill="none"
          stroke={`url(#${curveGradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current-Value Marker Circle: Synchronized with scroll and instantly adapting color */}
        {points.length > 0 && (
          <motion.g 
            style={{
              x: smoothMarkerX,
              y: smoothMarkerY
            }}
          >
            {/* Vertical guide line following Y smoothly */}
            <line 
              x1="0" y1="0" x2="0" y2={180 - Math.max(0, getY(activeDisplayTemp))}
              stroke={`rgba(${activeR}, ${activeG}, ${activeB}, 0.65)`} 
              strokeWidth="1.5" 
              strokeDasharray="2 2"
              className="transition-colors duration-300"
            />
            
            {/* Outer glow circle */}
            <circle 
              r="17" 
              fill="none"
              stroke={`rgba(${activeR}, ${activeG}, ${activeB}, 0.4)`} 
              strokeWidth="2.5" 
              className="transition-colors duration-300"
            />

            {/* Marker Circle */}
            <circle 
              r="13" 
              fill="#ffffff" 
              stroke={`rgba(${activeR}, ${activeG}, ${activeB}, 0.95)`} 
              strokeWidth="2" 
              className="transition-colors duration-300"
            />
            
            {/* Temperature Value */}
            <text 
              x="0" y="0" textAnchor="middle" dominantBaseline="central"
              fill="#0f172a" fontSize="11" fontWeight="700" 
              fontFamily="'Space Grotesk', sans-serif"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {Math.round(activeDisplayTemp)}
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
