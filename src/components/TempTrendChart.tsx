import React, { useId, useState, useRef, useEffect } from 'react';

interface TempTrendChartProps {
  data: { temp: number }[];
  columnWidth: number;
  height: number;
  resetKey?: string;
}

interface Point {
  x: number;
  y: number;
  temp: number;
}

export function TempTrendChart({ data, columnWidth, height, resetKey }: TempTrendChartProps) {
  const uniqueId = useId().replace(/:/g, '_');
  const gradientId = `tempGrad_${uniqueId}`;
  const solidClipId = `solidClip_${uniqueId}`;
  const dashedClipId = `dashedClip_${uniqueId}`;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [boundary, setBoundary] = useState<'left' | 'right' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const latestClientXRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const tickRef = useRef<() => void>(undefined);

  // Convert screen client coordinates to SVG coordinate space X
  const getSVGX = (clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const xInSvg = clientX - rect.left;
    const viewBoxWidth = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal.width : (points.length * columnWidth);
    const scale = viewBoxWidth / Math.max(rect.width, 1);
    return xInSvg * scale;
  };

  const getIndexFromClientX = (clientX: number): number => {
    const svgX = getSVGX(clientX);
    const index = Math.round((svgX - columnWidth / 2) / columnWidth);
    return Math.max(0, Math.min(points.length - 1, index));
  };

  const getTempColor = (temp: number) => {
    const fraction = tempRange > 0 ? (temp - minTemp) / tempRange : 0.5;
    let r = 0, g = 0, b = 0;
    if (fraction < 0.5) {
      // Interpolate between cool blue (14, 165, 233) and amber yellow (234, 179, 8)
      const t2 = fraction * 2;
      r = Math.round(14 + t2 * (234 - 14));
      g = Math.round(165 + t2 * (179 - 165));
      b = Math.round(233 + t2 * (8 - 233));
    } else {
      // Interpolate between amber yellow (234, 179, 8) and orange/red (239, 68, 68)
      const t2 = (fraction - 0.5) * 2;
      r = Math.round(234 + t2 * (239 - 234));
      g = Math.round(179 + t2 * (68 - 179));
      b = Math.round(8 + t2 * (68 - 8));
    }
    return { r, g, b };
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  if (!data || data.length === 0) return null;

  const minTemp = Math.min(...data.map(d => d.temp));
  const maxTemp = Math.max(...data.map(d => d.temp));
  
  // Prevent division by zero
  const tempRange = Math.max(maxTemp - minTemp, 1);
  
  const paddingY = 16;
  const availableHeight = height - paddingY * 2;

  // Map temp to Y coordinate (higher temp = lower Y)
  const getY = (temp: number) => {
    const normalized = (temp - minTemp) / tempRange;
    return height - paddingY - (normalized * availableHeight);
  };

  const points: Point[] = data.map((d, i) => {
    const x = i * columnWidth + (columnWidth / 2);
    const y = getY(d.temp);
    return { x, y, temp: d.temp };
  });

  // Create path data
  const createPath = (pts: Point[]) => {
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
  const activePoint = points[activeIndex] || points[0];
  const { r: activeR, g: activeG, b: activeB } = getTempColor(activePoint ? activePoint.temp : (minTemp + tempRange / 2));

  const tick = () => {
    if (!isDraggingRef.current) {
      return;
    }

    const scrollContainer = containerRef.current?.closest('.overflow-x-auto') as HTMLDivElement;
    if (scrollContainer && latestClientXRef.current !== null) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const clientX = latestClientXRef.current;
      
      const edgeZone = 60; // Active boundary zone between 40-60px
      const leftDist = clientX - containerRect.left;
      const rightDist = containerRect.right - clientX;
      
      let scrollSpeed = 0;
      if (leftDist < edgeZone && leftDist >= 0) {
        const ratio = 1 - (leftDist / edgeZone);
        scrollSpeed = -Math.max(2, Math.round(ratio * 16));
      } else if (rightDist < edgeZone && rightDist >= 0) {
        const ratio = 1 - (rightDist / edgeZone);
        scrollSpeed = Math.max(2, Math.round(ratio * 16));
      }

      let currentBoundary: 'left' | 'right' | null = null;
      if (scrollSpeed !== 0) {
        const prevScrollLeft = scrollContainer.scrollLeft;
        scrollContainer.scrollLeft += scrollSpeed;
        const currentScrollLeft = scrollContainer.scrollLeft;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        if (scrollSpeed < 0 && currentScrollLeft <= 0) {
          currentBoundary = 'left';
        } else if (scrollSpeed > 0 && currentScrollLeft >= maxScroll - 1) {
          currentBoundary = 'right';
        }
      }
      setBoundary(currentBoundary);

      // Update active index based on pointer X
      const nearestIndex = getIndexFromClientX(clientX);
      if (nearestIndex !== activeIndexRef.current) {
        setActiveIndex(nearestIndex);
      }
    }
  };

  useEffect(() => {
    tickRef.current = tick;
  });

  const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
    e.stopPropagation();
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    
    isDraggingRef.current = true;
    setIsDragging(true);
    latestClientXRef.current = e.clientX;
    setBoundary(null);

    // Initial position snap calculation
    const nearestIndex = getIndexFromClientX(e.clientX);
    if (nearestIndex !== activeIndexRef.current) {
      setActiveIndex(nearestIndex);
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    const runLoop = () => {
      if (isDraggingRef.current) {
        if (tickRef.current) {
          tickRef.current();
        }
        rafIdRef.current = requestAnimationFrame(runLoop);
      }
    };
    rafIdRef.current = requestAnimationFrame(runLoop);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    latestClientXRef.current = e.clientX;

    // Direct, ultra-smooth pointer snapping and tracking inside the move handler
    const nearestIndex = getIndexFromClientX(e.clientX);
    if (nearestIndex !== activeIndexRef.current) {
      setActiveIndex(nearestIndex);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    isDraggingRef.current = false;
    setIsDragging(false);
    latestClientXRef.current = null;
    setBoundary(null);
    
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

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
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" /> {/* Warm tone */}
            <stop offset="50%" stopColor="#fde047" /> {/* Mild tone */}
            <stop offset="100%" stopColor="#67e8f9" /> {/* Cool tone */}
          </linearGradient>

          <linearGradient id="columnHighlightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={boundary ? "rgba(239,68,68,0.02)" : `rgba(${activeR},${activeG},${activeB},0.03)`} />
            <stop offset="40%" stopColor={boundary ? "rgba(239,68,68,0.22)" : `rgba(${activeR},${activeG},${activeB},0.18)`} />
            <stop offset="100%" stopColor={boundary ? "rgba(239,68,68,0.02)" : `rgba(${activeR},${activeG},${activeB},0.03)`} />
          </linearGradient>
          
          <clipPath id={solidClipId}>
            {/* The "Now" marker is at columnWidth / 2 */}
            <rect x="0" y="0" width={columnWidth / 2} height="100%" />
          </clipPath>
          <clipPath id={dashedClipId}>
            <rect x={columnWidth / 2} y="0" width="100%" height="100%" />
          </clipPath>
        </defs>

        {/* Soft translucent vertical column highlight during drag */}
        {isDragging && activePoint && (
          <rect
            x={activePoint.x - columnWidth / 2}
            y={0}
            width={columnWidth}
            height={180}
            fill="url(#columnHighlightGrad)"
            rx="8"
            className={boundary ? "animate-pulse" : ""}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Dashed line for forecasted hours */}
        <path
          d={fullPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeDasharray="6 6"
          clipPath={`url(#${dashedClipId})`}
        />

        {/* Solid line for elapsed hours (up to Now marker) */}
        <path
          d={fullPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          clipPath={`url(#${solidClipId})`}
        />

        {/* Current-Value Marker: Single clean node updating in place */}
        {points.length > 0 && (
          <g 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              transform: `translate(${activePoint.x}px, ${activePoint.y}px)`,
              touchAction: 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
              pointerEvents: 'all',
              transition: isDragging ? 'none' : 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Solid vertical line down from marker spanning full card height with dynamic color */}
            <line 
              x1="0" 
              y1="0" 
              x2="0" 
              y2={180 - activePoint.y} 
              stroke={`rgba(${activeR}, ${activeG}, ${activeB}, 0.6)`} 
              strokeWidth="1.5" 
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Outer dynamic temperature halo glow */}
            <circle 
              r="17" 
              fill="none"
              stroke={`rgba(${activeR}, ${activeG}, ${activeB}, 0.35)`} 
              strokeWidth="2.5" 
              style={{ pointerEvents: 'none' }}
            />

            {/* Marker Circle */}
            <circle 
              r="13" 
              fill="#ffffff" 
              stroke={`rgba(${activeR}, ${activeG}, ${activeB}, 0.85)`} 
              strokeWidth="2" 
              style={{ pointerEvents: 'all', cursor: isDragging ? 'grabbing' : 'grab' }}
            />
            
            {/* Temperature Value */}
            <text 
              x="0" 
              y="0" 
              textAnchor="middle" 
              dominantBaseline="central"
              fill="#0f172a" 
              fontSize="11" 
              fontWeight="700" 
              fontFamily="'Space Grotesk', sans-serif"
              style={{ fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
            >
              {Math.round(activePoint.temp)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
