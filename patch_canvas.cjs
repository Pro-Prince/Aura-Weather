const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherCanvas.tsx', 'utf8');

if (!code.includes('const [isIntersecting, setIsIntersecting] = useState(true);')) {
  code = code.replace(
    'const globalOpacityRef = useRef(0);\n  const transitionTargetRef = useRef(1);',
    'const globalOpacityRef = useRef(0);\n  const transitionTargetRef = useRef(1);\n  const [isIntersecting, setIsIntersecting] = useState(true);\n\n  useEffect(() => {\n    const observer = new IntersectionObserver(([entry]) => {\n      setIsIntersecting(entry.isIntersecting);\n    }, { threshold: 0 });\n    if (canvasRef.current) observer.observe(canvasRef.current);\n    return () => observer.disconnect();\n  }, []);'
  );
  
  // Also add isIntersecting to the dependency array of the main useEffect
  code = code.replace(
    '}, [visualState.preset, visualState.intensity, visualState.driftAngle]);',
    '}, [visualState.preset, visualState.intensity, visualState.driftAngle, isIntersecting]);'
  );
  
  // And if !isIntersecting, we can stop the loop early, or just let the clearRect happen and not requestAnimationFrame
  // Actually, if we just put it in the dependency array, when isIntersecting becomes false, the effect unmounts and clears the canvas.
  // When it becomes true, it mounts and starts drawing. This is very memory efficient!
  // BUT: we don't want to clear the canvas when it's offscreen? Well, if it's offscreen it doesn't matter if it's cleared.
  // Wait, while swiping, the canvas is partially on screen!
  // IntersectionObserver with threshold: 0 means isIntersecting is true as long as ANY part of it is visible.
  // So it will only become false when FULLY offscreen.
  fs.writeFileSync('src/components/WeatherCanvas.tsx', code);
}
