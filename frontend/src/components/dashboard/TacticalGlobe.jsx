import { useState, useRef, useEffect } from 'react';
import { Globe, Compass, Shield, Radio, Navigation, Play, Pause, RotateCw, Sparkles, MapPin } from 'lucide-react';
import './TacticalGlobe.css';

// Operational intelligence nodes across global maritime & financial corridors
const TACTICAL_HUBS = [
  { id: 'hub-mumbai', name: 'Mumbai Free Port', lat: 18.94, lon: 72.84, caseId: 'case-102', threat: 'CRITICAL', sector: 'Narcotics & Hawala', status: 'TRANSSHIPMENT SURVEILLANCE' },
  { id: 'hub-dubai', name: 'Dubai Marina / JAFZA', lat: 25.08, lon: 55.14, caseId: 'case-102', threat: 'CRITICAL', sector: 'Offshore Shell Conduits', status: 'PRIMARY SYNDICATE HQ' },
  { id: 'hub-kandla', name: 'Port Kandla / Kutch', lat: 23.00, lon: 70.22, caseId: 'case-102', threat: 'HIGH', sector: 'Coastal Lightering', status: 'INTERCEPT ZONE ACTIVE' },
  { id: 'hub-colombo', name: 'Colombo Anchorage', lat: 6.93, lon: 79.84, caseId: 'case-117', threat: 'HIGH', sector: 'Corporate Smurfing', status: 'ESCROW MONITORING' },
  { id: 'hub-london', name: 'London Bourse Corridor', lat: 51.51, lon: -0.12, caseId: 'case-117', threat: 'MEDIUM', sector: 'Correspondent Banking', status: 'FIU TRACKING' },
  { id: 'hub-panama', name: 'Panama Maritime Canal', lat: 8.98, lon: -79.52, caseId: 'case-143', threat: 'HIGH', sector: 'Flag-of-Convenience Shells', status: 'SPECIAL AUDIT' },
  { id: 'hub-singapore', name: 'Singapore Malacca Strait', lat: 1.35, lon: 103.82, caseId: 'case-102', threat: 'MEDIUM', sector: 'Bunker Smuggling', status: 'AIS RADAR SWEEP' }
];

// Correlated transshipment and illicit wire links
const TACTICAL_ARCS = [
  { from: 'hub-dubai', to: 'hub-kandla', label: 'Hawala & Lightering Corridor', threat: 'CRITICAL' },
  { from: 'hub-dubai', to: 'hub-mumbai', label: 'Beneficial Ownership Flow', threat: 'CRITICAL' },
  { from: 'hub-mumbai', to: 'hub-colombo', label: 'Offshore Shell Mirroring', threat: 'HIGH' },
  { from: 'hub-dubai', to: 'hub-singapore', label: 'Transshipment Bunkering', threat: 'MEDIUM' },
  { from: 'hub-london', to: 'hub-dubai', label: 'SWIFT Correspondent Conduit', threat: 'HIGH' },
  { from: 'hub-panama', to: 'hub-dubai', label: 'Maritime Registry Masking', threat: 'HIGH' }
];

export default function TacticalGlobe({ onSelectHub }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isRotating, setIsRotating] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activeHub, setActiveHub] = useState(TACTICAL_HUBS[0]);
  const [hoveredHub, setHoveredHub] = useState(null);

  // Rotation angles (radians)
  const rotationRef = useRef({
    lon: 1.2, // Initial longitude offset (focused near Arabian Sea / Indian Ocean)
    lat: 0.35 // Initial tilt
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const pulseRef = useRef(0);

  // Convert (lat, lon) on sphere with radius R to 3D Cartesian coords
  const latLonTo3D = (lat, lon, radius, rotLon, rotLat) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180) + rotLon;

    // Standard spherical coordinates
    let x = -radius * Math.sin(phi) * Math.cos(theta);
    let z = radius * Math.sin(phi) * Math.sin(theta);
    let y = radius * Math.cos(phi);

    // Apply tilt around X-axis (rotLat)
    const cosT = Math.cos(rotLat);
    const sinT = Math.sin(rotLat);
    const y2 = y * cosT - z * sinT;
    const z2 = y * sinT + z * cosT;

    return { x, y: y2, z: z2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();

    const render = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Auto-rotation around Y-axis
      if (isRotating && !isDraggingRef.current) {
        rotationRef.current.lon += 0.28 * speed * dt;
      }

      pulseRef.current += dt * 3;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.40;

      ctx.clearRect(0, 0, width, height);

      // ── 1. ATMOSPHERIC HALO GLOW ─────────────────────────────────────────
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // ── 2. GLOBE BACKDROP SPHERE ──────────────────────────────────────────
      const sphereGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      sphereGrad.addColorStop(0, '#0a1410');
      sphereGrad.addColorStop(0.7, '#040807');
      sphereGrad.addColorStop(1, '#020403');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // ── 3. RADAR SWEEP BEAM ───────────────────────────────────────────────
      const sweepAngle = (time * 0.0012) % (Math.PI * 2);
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      sweepGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      sweepGrad.addColorStop(1, 'rgba(16, 185, 129, 0.18)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sweepAngle, sweepAngle + 0.45);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      const rotLon = rotationRef.current.lon;
      const rotLat = rotationRef.current.lat;

      // ── 4. LATITUDE PARALLELS ─────────────────────────────────────────────
      const latSteps = [-60, -40, -20, 0, 20, 40, 60];
      latSteps.forEach(lat => {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const p = latLonTo3D(lat, lon, radius, rotLon, rotLat);
          const px = cx + p.x;
          const py = cy + p.y;
          // Only draw front hemisphere points
          if (p.z > -radius * 0.05) {
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = lat === 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = lat === 0 ? 1 : 0.6;
        ctx.stroke();
      });

      // ── 5. LONGITUDE MERIDIANS (30° intervals) ───────────────────────────
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -85; lat <= 85; lat += 4) {
          const p = latLonTo3D(lat, lon, radius, rotLon, rotLat);
          const px = cx + p.x;
          const py = cy + p.y;
          if (p.z > -radius * 0.05) {
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // ── 6. CURVED 3D ARCS (Transshipment & Hawala Corridors) ───────────────
      TACTICAL_ARCS.forEach(arc => {
        const fromHub = TACTICAL_HUBS.find(h => h.id === arc.from);
        const toHub = TACTICAL_HUBS.find(h => h.id === arc.to);
        if (!fromHub || !toHub) return;

        const p1 = latLonTo3D(fromHub.lat, fromHub.lon, radius, rotLon, rotLat);
        const p2 = latLonTo3D(toHub.lat, toHub.lon, radius, rotLon, rotLat);

        // Only draw arc if at least one node is facing front
        if (p1.z > -radius * 0.2 || p2.z > -radius * 0.2) {
          // Arc elevation: midpoint elevated away from center
          const midLat = (fromHub.lat + toHub.lat) / 2;
          const midLon = (fromHub.lon + toHub.lon) / 2;
          const elevatedR = radius * 1.14;
          const pMid = latLonTo3D(midLat, midLon, elevatedR, rotLon, rotLat);

          const x1 = cx + p1.x;
          const y1 = cy + p1.y;
          const x2 = cx + p2.x;
          const y2 = cy + p2.y;
          const mx = cx + pMid.x;
          const my = cy + pMid.y;

          // Arc path
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(mx, my, x2, y2);
          ctx.strokeStyle = arc.threat === 'CRITICAL' ? 'rgba(239, 68, 68, 0.55)' : 'rgba(16, 185, 129, 0.55)';
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Animated particle traveling along arc
          const tProgress = ((time * 0.0006) + (arc.from.charCodeAt(4) * 0.1)) % 1;
          const ptx = (1 - tProgress) * (1 - tProgress) * x1 + 2 * (1 - tProgress) * tProgress * mx + tProgress * tProgress * x2;
          const pty = (1 - tProgress) * (1 - tProgress) * y1 + 2 * (1 - tProgress) * tProgress * my + tProgress * tProgress * y2;

          ctx.beginPath();
          ctx.arc(ptx, pty, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = arc.threat === 'CRITICAL' ? '#f87171' : '#34d399';
          ctx.shadowColor = arc.threat === 'CRITICAL' ? '#ef4444' : '#10b981';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // ── 7. OPERATIONAL HUBS / PINS ────────────────────────────────────────
      TACTICAL_HUBS.forEach(hub => {
        const p = latLonTo3D(hub.lat, hub.lon, radius, rotLon, rotLat);
        // Visibility: only render if on the front hemisphere
        if (p.z > 0) {
          const px = cx + p.x;
          const py = cy + p.y;
          const isSelected = activeHub?.id === hub.id;
          const isHovered = hoveredHub?.id === hub.id;

          const color = hub.threat === 'CRITICAL' ? '#ef4444' : (hub.threat === 'HIGH' ? '#f59e0b' : '#10b981');
          const pulse = (Math.sin(pulseRef.current + hub.lat) + 1) * 0.5;

          // Pulsing ring
          ctx.beginPath();
          ctx.arc(px, py, 4 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.7 - pulse * 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Center solid dot
          ctx.beginPath();
          ctx.arc(px, py, isSelected || isHovered ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Hub Label
          ctx.font = '600 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(hub.name, px + 8, py - 3);

          ctx.font = '500 8px sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.fillText(`${hub.lat.toFixed(1)}°N, ${hub.lon.toFixed(1)}°E`, px + 8, py + 7);
        }
      });

      // ── 8. ORTHOGRAPHIC RIM HIGHLIGHT ─────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRotating, speed, activeHub, hoveredHub]);

  // Handle Drag to Rotate
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      rotationRef.current.lon += dx * 0.008;
      rotationRef.current.lat = Math.max(-0.8, Math.min(0.8, rotationRef.current.lat - dy * 0.008));
    }

    // Hit test for hubs
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.40;

    let found = null;
    TACTICAL_HUBS.forEach(hub => {
      const p = latLonTo3D(hub.lat, hub.lon, radius, rotationRef.current.lon, rotationRef.current.lat);
      if (p.z > 0) {
        const px = cx + p.x;
        const py = cy + p.y;
        const dist = Math.hypot(mx - px, my - py);
        if (dist < 15) found = hub;
      }
    });

    setHoveredHub(found);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredHub) {
      setActiveHub(hoveredHub);
      if (onSelectHub) onSelectHub(hoveredHub);
    }
  };

  return (
    <div className="tactical-globe-wrapper compact-aesthetic-globe" ref={containerRef}>
      {/* Globe Top Mini HUD */}
      <div className="globe-hud-top">
        <div className="hud-label-cluster">
          <div className="hud-radar-beacon">
            <span className="beacon-ping" />
            <Radio size={11} className="beacon-icon" />
          </div>
          <div>
            <span className="hud-title font-mono">GLOBAL CORRIDORS // 3D</span>
          </div>
        </div>

        <div className="globe-controls-group">
          <button
            className={`globe-ctrl-btn ${isRotating ? 'active' : ''}`}
            onClick={() => setIsRotating(prev => !prev)}
            title={isRotating ? 'Pause rotation' : 'Resume rotation'}
          >
            {isRotating ? <Pause size={10} /> : <Play size={10} />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div
        className="globe-canvas-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={200}
          className="tactical-globe-canvas"
        />

        {/* Minimal Coordinates Overlay */}
        <div className="globe-coords-overlay font-mono">
          <span>{hoveredHub ? hoveredHub.name : (activeHub ? activeHub.name : 'ARABIAN SEA')}</span>
          <span className="drag-hint">DRAG TO ROTATE</span>
        </div>
      </div>
    </div>
  );
}
