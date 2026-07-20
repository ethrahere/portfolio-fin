import React, { useState, useRef, useCallback } from 'react';
import { RotateCcw, Brush, Layers, X } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import BackButton from '../components/BackButton';

// ─── Types ────────────────────────────────────────────────────────────────────

type RegionId = 'frame' | 'background' | 'corners' | 'ring' | 'center';
type Mode = 'template' | 'freehand';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_COLORS: Record<RegionId, string> = {
  frame: '#111111',
  background: '#ffffff',
  corners: '#e8e8e8',
  ring: '#c8c8c8',
  center: '#888888',
};

const REGION_LABELS: Record<RegionId, string> = {
  frame: 'BORDER',
  background: 'BACKGROUND',
  corners: 'CORNERS',
  ring: 'RING',
  center: 'CENTER',
};

const PALETTE = [
  '#000000', '#1a1a2e', '#16213e', '#0f3460',
  '#e94560', '#ff6b35', '#f7c59f', '#efefd0',
  '#004e89', '#1a936f', '#88d498', '#c6dabf',
  '#ffffff', '#f5f5f5', '#cccccc', '#888888',
];

const BRUSH_SIZES = [2, 5, 10, 20];

// SVG card dimensions
const W = 400;
const H = 560;
const FRAME = 30; // border thickness
const CX = W / 2;        // 200
const CY = H / 2;        // 280
const R_OUTER = 110;
const R_INNER = 70;
const DIAMOND = 65;      // diamond half-width (fits inside R_INNER)
const CORNER = 80;       // corner triangle leg

// SVG path for ring annulus (evenodd fill)
const RING_PATH = [
  `M${CX},${CY - R_OUTER}`,
  `A${R_OUTER},${R_OUTER} 0 1 0 ${CX},${CY + R_OUTER}`,
  `A${R_OUTER},${R_OUTER} 0 1 0 ${CX},${CY - R_OUTER} Z`,
  `M${CX},${CY - R_INNER}`,
  `A${R_INNER},${R_INNER} 0 1 0 ${CX},${CY + R_INNER}`,
  `A${R_INNER},${R_INNER} 0 1 0 ${CX},${CY - R_INNER} Z`,
].join(' ');

// Diamond centered at (CX, CY) with half-span DIAMOND
const DIAMOND_POINTS = [
  `${CX},${CY - DIAMOND}`,
  `${CX + DIAMOND},${CY}`,
  `${CX},${CY + DIAMOND}`,
  `${CX - DIAMOND},${CY}`,
].join(' ');

// ─── Component ────────────────────────────────────────────────────────────────

const NFTCanvas = () => {
  const [mode, setMode] = useState<Mode>('template');
  const [colors, setColors] = useState<Record<RegionId, string>>({ ...DEFAULT_COLORS });
  const [selectedColor, setSelectedColor] = useState('#e94560');
  const [brushSize, setBrushSize] = useState(5);
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);
  const [freehandRegion, setFreehandRegion] = useState<RegionId>('background');
  const [showModal, setShowModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // ── Template mode ────────────────────────────────────────────────────────

  const handleRegionClick = (regionId: RegionId) => {
    if (mode !== 'template') return;
    setColors(prev => ({ ...prev, [regionId]: selectedColor }));
  };

  const regionProps = (id: RegionId) => ({
    onClick: () => handleRegionClick(id),
    onMouseEnter: () => setHoveredRegion(id),
    onMouseLeave: () => setHoveredRegion(null),
    style: { cursor: 'crosshair', opacity: hoveredRegion === id ? 0.75 : 1 } as React.CSSProperties,
  });

  // ── Freehand mode ────────────────────────────────────────────────────────

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX: number, clientY: number;
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    },
    []
  );

  // Build a Path2D clipping mask for a given region.
  // 'background' and 'ring' use evenodd to cut holes; others use nonzero.
  const getClipPath = useCallback((regionId: RegionId): Path2D => {
    const p = new Path2D();
    switch (regionId) {
      case 'frame':
        p.rect(0, 0, W, FRAME);
        p.rect(0, H - FRAME, W, FRAME);
        p.rect(0, FRAME, FRAME, H - FRAME * 2);
        p.rect(W - FRAME, FRAME, FRAME, H - FRAME * 2);
        break;
      case 'background':
        // Inner rect, then subtract corners + ring+center via evenodd
        p.rect(FRAME, FRAME, W - FRAME * 2, H - FRAME * 2);
        p.moveTo(FRAME, FRAME); p.lineTo(FRAME + CORNER, FRAME); p.lineTo(FRAME, FRAME + CORNER); p.closePath();
        p.moveTo(W - FRAME - CORNER, FRAME); p.lineTo(W - FRAME, FRAME); p.lineTo(W - FRAME, FRAME + CORNER); p.closePath();
        p.moveTo(FRAME, H - FRAME - CORNER); p.lineTo(FRAME, H - FRAME); p.lineTo(FRAME + CORNER, H - FRAME); p.closePath();
        p.moveTo(W - FRAME - CORNER, H - FRAME); p.lineTo(W - FRAME, H - FRAME); p.lineTo(W - FRAME, H - FRAME - CORNER); p.closePath();
        p.arc(CX, CY, R_OUTER, 0, Math.PI * 2);
        break;
      case 'corners':
        p.moveTo(FRAME, FRAME); p.lineTo(FRAME + CORNER, FRAME); p.lineTo(FRAME, FRAME + CORNER); p.closePath();
        p.moveTo(W - FRAME - CORNER, FRAME); p.lineTo(W - FRAME, FRAME); p.lineTo(W - FRAME, FRAME + CORNER); p.closePath();
        p.moveTo(FRAME, H - FRAME - CORNER); p.lineTo(FRAME, H - FRAME); p.lineTo(FRAME + CORNER, H - FRAME); p.closePath();
        p.moveTo(W - FRAME - CORNER, H - FRAME); p.lineTo(W - FRAME, H - FRAME); p.lineTo(W - FRAME, H - FRAME - CORNER); p.closePath();
        break;
      case 'ring':
        // Outer circle then inner circle — evenodd makes the hole
        p.arc(CX, CY, R_OUTER, 0, Math.PI * 2);
        p.arc(CX, CY, R_INNER, 0, Math.PI * 2);
        break;
      case 'center':
        p.moveTo(CX, CY - DIAMOND);
        p.lineTo(CX + DIAMOND, CY);
        p.lineTo(CX, CY + DIAMOND);
        p.lineTo(CX - DIAMOND, CY);
        p.closePath();
        break;
    }
    return p;
  }, []);

  const drawSegment = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const clip = getClipPath(freehandRegion);
      const fillRule: CanvasFillRule =
        freehandRegion === 'background' || freehandRegion === 'ring' ? 'evenodd' : 'nonzero';
      ctx.save();
      ctx.clip(clip, fillRule);
      ctx.beginPath();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
    },
    [selectedColor, brushSize, freehandRegion, getClipPath]
  );

  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (mode !== 'freehand') return;
      e.preventDefault();
      isDrawing.current = true;
      const pt = getCanvasPoint(e);
      lastPoint.current = pt;
      if (pt) drawSegment(pt, pt);
    },
    [mode, getCanvasPoint, drawSegment]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || mode !== 'freehand') return;
      e.preventDefault();
      const pt = getCanvasPoint(e);
      if (pt && lastPoint.current) {
        drawSegment(lastPoint.current, pt);
        lastPoint.current = pt;
      }
    },
    [mode, getCanvasPoint, drawSegment]
  );

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleReset = () => {
    setColors({ ...DEFAULT_COLORS });
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleCreateNFT = () => {
    if (svgRef.current) {
      try {
        const svgStr = new XMLSerializer().serializeToString(svgRef.current);
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      }
    }
    setShowModal(true);
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend notification list
    setNotifySubmitted(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout sectionLabel="YOUR CANVAS">
      <div className="p-8 md:p-16">
        {/* Header */}
        <header className="mb-12">
          <BackButton />
          <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-4">YOUR CANVAS</h1>
          <p className="text-sm font-mono text-gray-600 leading-relaxed max-w-xl">
            Color the template regions or paint freely on top. Your design becomes a unique NFT
            with shared revenue across the community.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* ── Canvas Area ───────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center">
            <div
              className="relative border border-black w-full"
              style={{ maxWidth: `${W}px`, aspectRatio: `${W}/${H}` }}
            >
              {/* SVG Template */}
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: mode === 'template' ? 'auto' : 'none' }}
              >
                {/* ── Frame (4 border rects) ── */}
                <g fill={colors.frame} {...regionProps('frame')}>
                  <rect x="0" y="0" width={W} height={FRAME} />
                  <rect x="0" y={H - FRAME} width={W} height={FRAME} />
                  <rect x="0" y={FRAME} width={FRAME} height={H - FRAME * 2} />
                  <rect x={W - FRAME} y={FRAME} width={FRAME} height={H - FRAME * 2} />
                </g>

                {/* ── Inner background ── */}
                <rect
                  x={FRAME} y={FRAME}
                  width={W - FRAME * 2} height={H - FRAME * 2}
                  fill={colors.background}
                  {...regionProps('background')}
                />

                {/* ── Corner triangles (all 4 share one region) ── */}
                <g fill={colors.corners} {...regionProps('corners')}>
                  <polygon points={`${FRAME},${FRAME} ${FRAME + CORNER},${FRAME} ${FRAME},${FRAME + CORNER}`} />
                  <polygon points={`${W - FRAME - CORNER},${FRAME} ${W - FRAME},${FRAME} ${W - FRAME},${FRAME + CORNER}`} />
                  <polygon points={`${FRAME},${H - FRAME - CORNER} ${FRAME},${H - FRAME} ${FRAME + CORNER},${H - FRAME}`} />
                  <polygon points={`${W - FRAME - CORNER},${H - FRAME} ${W - FRAME},${H - FRAME} ${W - FRAME},${H - FRAME - CORNER}`} />
                </g>

                {/* ── Ring (annulus, evenodd) ── */}
                <path
                  d={RING_PATH}
                  fill={colors.ring}
                  fillRule="evenodd"
                  {...regionProps('ring')}
                />

                {/* ── Center diamond ── */}
                <polygon
                  points={DIAMOND_POINTS}
                  fill={colors.center}
                  {...regionProps('center')}
                />

                {/* ── Boundary outlines (non-interactive) ── */}
                <g
                  fill="none"
                  stroke="rgba(0,0,0,0.12)"
                  strokeWidth="0.75"
                  style={{ pointerEvents: 'none' }}
                >
                  <rect x={FRAME} y={FRAME} width={W - FRAME * 2} height={H - FRAME * 2} />
                  <polygon points={`${FRAME},${FRAME} ${FRAME + CORNER},${FRAME} ${FRAME},${FRAME + CORNER}`} />
                  <polygon points={`${W - FRAME - CORNER},${FRAME} ${W - FRAME},${FRAME} ${W - FRAME},${FRAME + CORNER}`} />
                  <polygon points={`${FRAME},${H - FRAME - CORNER} ${FRAME},${H - FRAME} ${FRAME + CORNER},${H - FRAME}`} />
                  <polygon points={`${W - FRAME - CORNER},${H - FRAME} ${W - FRAME},${H - FRAME} ${W - FRAME},${H - FRAME - CORNER}`} />
                  <path d={RING_PATH} fillRule="evenodd" />
                  <polygon points={DIAMOND_POINTS} />
                </g>
              </svg>

              {/* Freehand canvas overlay */}
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="absolute inset-0 w-full h-full"
                style={{
                  pointerEvents: mode === 'freehand' ? 'auto' : 'none',
                  cursor: mode === 'freehand' ? 'crosshair' : 'default',
                  touchAction: 'none',
                }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
            </div>

            {hoveredRegion && mode === 'template' && (
              <p className="text-xs font-mono text-gray-400 mt-3 tracking-widest">
                CLICK TO COLOR: {REGION_LABELS[hoveredRegion]}
              </p>
            )}
          </div>

          {/* ── Controls Panel ────────────────────────────────────────────── */}
          <div className="w-full lg:w-64 flex flex-col gap-7">
            {/* Mode toggle */}
            <div>
              <p className="text-xs font-mono tracking-widest text-gray-400 mb-3">MODE</p>
              <div className="flex border border-black">
                <button
                  onClick={() => setMode('template')}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-mono tracking-widest py-3 transition-colors ${
                    mode === 'template' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Layers size={12} />
                  REGIONS
                </button>
                <button
                  onClick={() => setMode('freehand')}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-mono tracking-widest py-3 border-l border-black transition-colors ${
                    mode === 'freehand' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Brush size={12} />
                  FREEHAND
                </button>
              </div>
              <p className="text-xs font-mono text-gray-400 mt-2 leading-relaxed">
                {mode === 'template'
                  ? 'Click any region on the card to fill it with your chosen color.'
                  : 'Select a region below, then draw within it.'}
              </p>
            </div>

            {/* Color picker */}
            <div>
              <p className="text-xs font-mono tracking-widest text-gray-400 mb-3">COLOR</p>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 border border-black flex-shrink-0"
                  style={{ backgroundColor: selectedColor }}
                />
                <input
                  type="color"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  className="flex-1 h-10 border border-black cursor-pointer"
                  title="Custom color"
                />
              </div>
              <div className="grid grid-cols-8 gap-1">
                {PALETTE.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`aspect-square border transition-transform hover:scale-110 ${
                      selectedColor === color ? 'border-black scale-110 ring-1 ring-black' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush size (freehand only) */}
            {mode === 'freehand' && (
              <div>
                <p className="text-xs font-mono tracking-widest text-gray-400 mb-3">BRUSH SIZE</p>
                <div className="flex gap-2">
                  {BRUSH_SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`flex-1 py-2 border text-xs font-mono transition-colors ${
                        brushSize === size
                          ? 'bg-black text-white border-black'
                          : 'border-black hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Regions — fill in template mode, select target in freehand mode */}
            <div>
              <p className="text-xs font-mono tracking-widest text-gray-400 mb-3">
                {mode === 'template' ? 'REGIONS' : 'DRAW ON'}
              </p>
              <div className="flex flex-col gap-1">
                {(Object.keys(DEFAULT_COLORS) as RegionId[]).map(id => {
                  const isActiveFreehand = mode === 'freehand' && freehandRegion === id;
                  return (
                    <button
                      key={id}
                      onClick={() =>
                        mode === 'template'
                          ? setColors(prev => ({ ...prev, [id]: selectedColor }))
                          : setFreehandRegion(id)
                      }
                      className={`flex items-center gap-3 text-xs font-mono px-2 py-2 transition-colors ${
                        isActiveFreehand
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-4 h-4 border flex-shrink-0"
                        style={{
                          backgroundColor: colors[id],
                          borderColor: isActiveFreehand ? 'white' : 'black',
                        }}
                      />
                      <span className="tracking-widest">{REGION_LABELS[id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t border-black">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 text-xs font-mono tracking-widest py-3 border border-black hover:bg-gray-100 transition-colors"
              >
                <RotateCcw size={12} />
                RESET
              </button>
              <button
                onClick={handleCreateNFT}
                className="text-xs font-mono tracking-widest py-4 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                CREATE MY NFT
              </button>
            </div>

            {/* Revenue split */}
            <div className="border border-black p-4">
              <p className="text-xs font-mono tracking-widest text-gray-400 mb-4">REVENUE SPLIT</p>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <span>YOU</span>
                  <span className="font-bold">50%</span>
                </div>
                <div className="w-full h-1 bg-gray-100">
                  <div className="h-full bg-black" style={{ width: '50%' }} />
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>COMMUNITY POOL</span>
                  <span>50%</span>
                </div>
                <div className="pl-3 border-l border-gray-200 space-y-1 text-gray-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>TREASURY</span>
                    <span>20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ALL PARTICIPANTS</span>
                    <span>80%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create NFT Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-sm font-mono max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-black">
              <h2 className="text-xs tracking-widest">YOUR NFT</h2>
              <button onClick={handleCloseModal} className="hover:opacity-60 transition-opacity">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preview */}
              {previewUrl && (
                <div className="border border-black overflow-hidden">
                  <img src={previewUrl} alt="Your NFT design preview" className="w-full" />
                </div>
              )}

              <div>
                <p className="text-sm mb-2 tracking-wide">YOUR DESIGN IS READY.</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  NFT minting is coming soon. We're building the smart contract and wallet
                  infrastructure. Sign up below to be notified when you can mint your piece on-chain
                  and start earning from sales.
                </p>
              </div>

              {/* Revenue reminder */}
              <div className="border border-gray-100 p-4 text-xs text-gray-500 space-y-1 bg-gray-50">
                <p>50% of every sale → your wallet</p>
                <p>40% → all participants (equal share)</p>
                <p>10% → treasury</p>
              </div>

              {/* Notify form */}
              {notifySubmitted ? (
                <div className="border border-black p-4 text-xs tracking-widest text-center">
                  YOU'RE ON THE LIST.
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="space-y-3">
                  <p className="text-xs tracking-widest text-gray-400">NOTIFY ME WHEN MINTING IS LIVE</p>
                  <div className="flex">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={e => setNotifyEmail(e.target.value)}
                      placeholder="YOUR EMAIL"
                      required
                      className="flex-1 border border-black border-r-0 px-3 py-2 text-xs placeholder-gray-300 outline-none focus:bg-gray-50"
                    />
                    <button
                      type="submit"
                      className="border border-black px-4 py-2 text-xs bg-black text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                      NOTIFY
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default NFTCanvas;
