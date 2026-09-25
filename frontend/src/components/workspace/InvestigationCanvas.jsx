import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import { MASTER_CATEGORIES } from '../../constants/masterModel';
import {
  User, Building2, MapPin, Car, DollarSign, Cpu,
  ShieldAlert, Link2, ExternalLink, Filter, Plus,
  Layers, CheckCircle2, AlertTriangle, ArrowRight, X,
  GripHorizontal, Move, Scissors, Zap, GitCommit, Check,
  Sparkles, FileText
} from 'lucide-react';
import './InvestigationCanvas.css';

export default function InvestigationCanvas() {
  const {
    activeCase,
    canvasNodes,
    setCanvasNodes,
    canvasEdges,
    addNodeToCanvas,
    addRopeConnection,
    updateRopeConnection,
    removeEdge,
    updateNodePosition,
    selectedEntity,
    setSelectedEntity,
    ropingSource,
    setRopingSource,
    flashNodeId,
    openTab,
    canvasFilterType,
    setCanvasFilterType,
    showConnectBar,
    setShowConnectBar
  } = useWorkspace();

  const canvasRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingNode, setDraggingNode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Double-click / Double-tap spawn menu state
  const [doubleClickMenu, setDoubleClickMenu] = useState(null); // { x: number, y: number }
  const [quickNodeName, setQuickNodeName] = useState('');
  const lastTapRef = useRef(0);

  // Interactive Relationship Builder State (for new links)
  const [pendingLink, setPendingLink] = useState(null);
  // Interactive Relationship Editor State (for existing links)
  const [editingEdge, setEditingEdge] = useState(null);

  // Manual connection state
  const [connectFrom, setConnectFrom] = useState('');
  const [connectTo, setConnectTo] = useState('');
  const [connectRel, setConnectRel] = useState('COORDINATES_WITH');

  // Trigger temporary toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const dragStateRef = useRef({
    id: null,
    startX: 0,
    startY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
    isDragging: false
  });

  // Cancel roping on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (ropingSource) {
          setRopingSource(null);
          triggerToast('Roping cancelled');
        }
        dragStateRef.current = { id: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0, isDragging: false };
        setDraggingNode(null);
        setDoubleClickMenu(null);
        setShowConnectBar(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ropingSource, setShowConnectBar]);

  // Complete roping connection between two nodes - opens interactive relationship modal
  const completeRoping = (targetNodeId) => {
    dragStateRef.current = { id: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0, isDragging: false };
    setDraggingNode(null);

    if (!ropingSource || ropingSource === targetNodeId) {
      setRopingSource(null);
      return;
    }
    const srcNode = canvasNodes.find(n => n.id === ropingSource);
    const dstNode = canvasNodes.find(n => n.id === targetNodeId);
    
    // Open relationship creation dialog so the user can define the connection
    setPendingLink({
      sourceId: ropingSource,
      targetId: targetNodeId,
      sourceName: srcNode?.name || 'Entity A',
      targetName: dstNode?.name || 'Entity B',
      relType: connectRel || 'COORDINATES_WITH',
      customType: '',
      confidence: 0.94,
      notes: ''
    });
    setRopingSource(null);
  };

  const handleConfirmPendingLink = (e) => {
    if (e) e.preventDefault();
    if (!pendingLink) return;
    const finalRel = (pendingLink.relType === 'CUSTOM' ? pendingLink.customType.trim() : pendingLink.relType) || 'COORDINATES_WITH';
    addRopeConnection(pendingLink.sourceId, pendingLink.targetId, finalRel, {
      confidence: Number(pendingLink.confidence) || 0.94,
      notes: pendingLink.notes || ''
    });
    triggerToast(`Connected ${pendingLink.sourceName} ➔ ${pendingLink.targetName} [${finalRel}]`);
    setPendingLink(null);
  };

  const handleSaveEditingEdge = (e) => {
    if (e) e.preventDefault();
    if (!editingEdge) return;
    const finalRel = (editingEdge.label === 'CUSTOM' ? editingEdge.customType.trim() : editingEdge.label) || editingEdge.label;
    updateRopeConnection(editingEdge.id, {
      label: finalRel,
      confidence: Number(editingEdge.confidence) || 0.94,
      notes: editingEdge.notes || ''
    });
    triggerToast(`Updated relationship: ${finalRel}`);
    setEditingEdge(null);
  };

  const handleSeverEditingEdge = () => {
    if (!editingEdge) return;
    removeEdge(editingEdge.id);
    triggerToast(`Severed connection: ${editingEdge.label}`);
    setEditingEdge(null);
  };

  // Dragging node on canvas with delta displacement & threshold
  const handleNodeMouseDown = (e, node) => {
    // If clicked on an interactive control (button, anchor, input, select), let that element handle it
    if (
      e.target.closest('button') ||
      e.target.closest('.card-rope-anchor') ||
      e.target.closest('input') ||
      e.target.closest('select')
    ) {
      return;
    }
    e.stopPropagation();

    // Select this entity
    setSelectedEntity(node);

    // If currently roping and clicked a different node, establish connection immediately
    if (ropingSource) {
      if (ropingSource !== node.id) {
        completeRoping(node.id);
      } else {
        setRopingSource(null);
      }
      return;
    }

    const curX = Number.isFinite(node.x) && node.x >= 20 ? node.x : 100;
    const curY = Number.isFinite(node.y) && node.y >= 20 ? node.y : 100;

    dragStateRef.current = {
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: curX,
      nodeStartY: curY,
      isDragging: false
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: Math.round(e.clientX - rect.left),
          y: Math.round(e.clientY - rect.top)
        });
      }

      const drag = dragStateRef.current;
      if (!drag || !drag.id || !canvasRef.current) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      // Drag threshold: require at least 4px motion to initiate dragging (prevents static clicks from moving node)
      if (!drag.isDragging) {
        if (Math.hypot(dx, dy) < 4) return;
        drag.isDragging = true;
        setDraggingNode(drag.id);
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(25, Math.min(rect.width - 240, drag.nodeStartX + dx));
      const newY = Math.max(25, Math.min(rect.height - 160, drag.nodeStartY + dy));
      updateNodePosition(drag.id, Math.round(newX), Math.round(newY));
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.id) {
        dragStateRef.current = { id: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0, isDragging: false };
        setDraggingNode(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateNodePosition]);

  // Handle Drop from FileExplorer or CrossCaseImporter
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    let item = null;
    const rawJson = e.dataTransfer.getData('application/json');
    const rawText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');

    if (rawJson) {
      try { item = JSON.parse(rawJson); } catch (err) {}
    }
    if (!item && rawText) {
      try { item = JSON.parse(rawText); } catch (err) {}
    }
    if (!item && window.__CONSTELLATION_DRAGGED_ITEM__) {
      item = window.__CONSTELLATION_DRAGGED_ITEM__;
    }

    if (!item) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = Math.max(20, Math.min(rect.width - 240, e.clientX - rect.left - 100));
    const dropY = Math.max(20, Math.min(rect.height - 180, e.clientY - rect.top - 40));

    const result = addNodeToCanvas(item, Math.round(dropX), Math.round(dropY));
    triggerToast(result.isExisting ? `Repositioned ${result.name} on Board` : `Added ${result.name} to Board`);
    window.__CONSTELLATION_DRAGGED_ITEM__ = null;
  };

  const startRopingFrom = (e, nodeId) => {
    e.stopPropagation();
    dragStateRef.current = { id: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0, isDragging: false };
    setDraggingNode(null);

    if (ropingSource) {
      if (ropingSource !== nodeId) {
        completeRoping(nodeId);
      } else {
        setRopingSource(null);
      }
    } else {
      setRopingSource(nodeId);
      const srcNode = canvasNodes.find(n => n.id === nodeId);
      triggerToast(`Roping from ${srcNode?.name || 'entity'}. Click any destination card or anchor to complete link.`);
    }
  };

  const handleManualConnect = () => {
    if (!connectFrom || !connectTo || connectFrom === connectTo) {
      triggerToast('Please select two distinct entities to connect.');
      return;
    }
    const n1 = canvasNodes.find(n => n.id === connectFrom);
    const n2 = canvasNodes.find(n => n.id === connectTo);
    setPendingLink({
      sourceId: connectFrom,
      targetId: connectTo,
      sourceName: n1?.name || 'Entity A',
      targetName: n2?.name || 'Entity B',
      relType: connectRel || 'COORDINATES_WITH',
      customType: '',
      confidence: 0.94,
      notes: ''
    });
    setShowConnectBar(false);
  };

  // Double-Click on Canvas to Spawn Node at Position
  const handleCanvasDoubleClick = (e) => {
    if (
      e.target.closest('.canvas-entity-card') ||
      e.target.closest('button') ||
      e.target.closest('.inline-connect-bar') ||
      e.target.closest('.double-tap-spawn-popover')
    ) {
      return;
    }
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft || 0;
    const scrollTop = canvasRef.current.scrollTop || 0;
    const posX = Math.max(20, Math.min(rect.width - 250, e.clientX - rect.left + scrollLeft - 110));
    const posY = Math.max(20, Math.min(rect.height - 210, e.clientY - rect.top + scrollTop - 40));

    setDoubleClickMenu({ x: posX, y: posY });
    setQuickNodeName('');
  };

  // Double-Tap on Canvas for Touch Devices
  const handleCanvasTouchEnd = (e) => {
    if (e.target.closest('.canvas-entity-card') || e.target.closest('button') || e.target.closest('.double-tap-spawn-popover')) return;
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < 320 && delta > 40) {
      const touch = e.changedTouches?.[0];
      if (touch && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scrollLeft = canvasRef.current.scrollLeft || 0;
        const scrollTop = canvasRef.current.scrollTop || 0;
        const posX = Math.max(20, Math.min(rect.width - 250, touch.clientX - rect.left + scrollLeft - 110));
        const posY = Math.max(20, Math.min(rect.height - 210, touch.clientY - rect.top + scrollTop - 40));
        setDoubleClickMenu({ x: posX, y: posY });
        setQuickNodeName('');
      }
    }
    lastTapRef.current = now;
  };

  // Spawn node at double-tap position
  const handleSpawnAtPosition = (type, customTitle = null) => {
    if (!doubleClickMenu) return;
    const nodeSeq = canvasNodes.length + 1;
    const id = `node-${Date.now().toString(36)}-${nodeSeq}`;
    const name = customTitle && customTitle.trim() ? customTitle.trim() : null;

    let item;
    if (type === 'Person') {
      const names = ['Kareem Merchant', 'Imran Malik', 'Suresh Varma', 'Zoya Chen', 'Deepak Mehta'];
      const pick = names[canvasNodes.length % names.length];
      item = {
        id,
        name: name || `${pick} (Op-${nodeSeq})`,
        role: 'Person of Interest / Operative',
        type: 'Person',
        threat: 'HIGH',
        provenance: 'EXTRACTED_ENTITY'
      };
    } else if (type === 'Organization') {
      const orgs = ['Apex Horizon FZE', 'Caspian Freight Lines', 'Diamond Port Logistics', 'Gulf Stream Bullion LLC'];
      const pick = orgs[canvasNodes.length % orgs.length];
      item = {
        id,
        name: name || `${pick}`,
        role: 'Corporate Entity / Shell',
        type: 'Organization',
        threat: 'CRITICAL',
        provenance: 'ANALYTICAL_INFERENCE'
      };
    } else if (type === 'Vehicle') {
      const boats = ['MV Sagar Priya', 'Dhow Bahr-al-Noor', 'Speedcraft Falcon-9', 'Cargo Vessel Al-Rayyan'];
      const pick = boats[canvasNodes.length % boats.length];
      item = {
        id,
        name: name || `${pick}`,
        role: 'Vessel / Transport Craft',
        type: 'Vehicle',
        threat: 'HIGH',
        provenance: 'RAW_DATA'
      };
    } else if (type === 'Financial') {
      item = {
        id,
        name: name || `Hawala Ledger #${seed}`,
        role: 'Settlement Account Mirror',
        type: 'Financial',
        threat: 'CRITICAL',
        provenance: 'VERIFIED_RELATIONSHIP'
      };
    } else {
      item = {
        id,
        name: name || `Evidence Artifact #${seed}`,
        role: 'Chain-of-Custody Document',
        type: 'Evidence',
        threat: 'HIGH',
        provenance: 'EVIDENCE'
      };
    }

    addNodeToCanvas(item, doubleClickMenu.x, doubleClickMenu.y);
    triggerToast(`Added ${item.name} at cursor position`);
    setDoubleClickMenu(null);
  };

  // Quick Spawn Handlers with guaranteed unique names
  const handleQuickAdd = (type) => {
    const nodeSeq = canvasNodes.length + 1;
    const id = `node-${Date.now().toString(36)}-${nodeSeq}`;
    let item;
    if (type === 'Person') {
      const names = ['Kareem Merchant', 'Imran Malik', 'Suresh Varma', 'Zoya Chen', 'Deepak Mehta'];
      const pick = names[canvasNodes.length % names.length];
      item = { id, name: `${pick} (Op-${nodeSeq})`, role: 'Syndicate Operative / Proxy', type: 'Person', threat: 'HIGH', provenance: 'EXTRACTED_ENTITY' };
    } else if (type === 'Organization') {
      const orgs = ['Apex Horizon FZE', 'Caspian Freight Lines', 'Diamond Port Logistics', 'Gulf Stream Bullion LLC'];
      const pick = orgs[canvasNodes.length % orgs.length];
      item = { id, name: `${pick}`, role: 'Offshore Trading Shell', type: 'Organization', threat: 'CRITICAL', provenance: 'ANALYTICAL_INFERENCE' };
    } else if (type === 'Vehicle') {
      const boats = ['MV Sagar Priya', 'Dhow Bahr-al-Noor', 'Speedcraft Falcon-9', 'Cargo Vessel Al-Rayyan'];
      const pick = boats[canvasNodes.length % boats.length];
      item = { id, name: `${pick}`, role: 'Lightering & Transshipment Vessel', type: 'Vehicle', threat: 'HIGH', provenance: 'RAW_DATA' };
    } else {
      item = { id, name: `Hawala Mirror Ledger #${nodeSeq}`, role: 'Split Tranche Clearing Mirror', type: 'Financial', threat: 'CRITICAL', provenance: 'VERIFIED_RELATIONSHIP' };
    }
    const added = addNodeToCanvas(item);
    triggerToast(`Created & Pinned ${type}: ${added.name}`);
  };

  const filteredNodes = (canvasFilterType || 'ALL') === 'ALL'
    ? canvasNodes
    : canvasNodes.filter(n => (n.type || '').toUpperCase() === canvasFilterType);

  const getEntityIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'person': return <User size={12} className="type-icon" />;
      case 'organization': return <Building2 size={12} className="type-icon" />;
      case 'vehicle': return <Car size={12} className="type-icon" />;
      case 'financial': return <DollarSign size={12} className="type-icon" />;
      case 'location': return <MapPin size={12} className="type-icon" />;
      default: return <ShieldAlert size={12} className="type-icon" />;
    }
  };

  return (
    <div className="canvas-workspace-container">

      {/* ── INLINE CONNECTION BUILDER BAR ───────────────────────── */}
      {showConnectBar && (
        <div className="inline-connect-bar">
          <div className="connect-bar-inner">
            <span className="connect-bar-label">ROPE CONNECTION:</span>
            <select
              className="connect-select"
              value={connectFrom}
              onChange={(e) => setConnectFrom(e.target.value)}
            >
              <option value="">Select Source Node...</option>
              {canvasNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
              ))}
            </select>

            <span className="connect-arrow">➔</span>

            <select
              className="connect-select"
              value={connectTo}
              onChange={(e) => setConnectTo(e.target.value)}
            >
              <option value="">Select Target Node...</option>
              {canvasNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
              ))}
            </select>

            <select
              className="connect-select rel-select"
              value={connectRel}
              onChange={(e) => setConnectRel(e.target.value)}
            >
              {MASTER_CATEGORIES['16_RELATIONSHIPS'].types.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>

            <button className="connect-execute-btn" onClick={handleManualConnect}>
              <Check size={11} /> Connect
            </button>
            <button className="connect-cancel-btn" onClick={() => setShowConnectBar(false)}>
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {/* ── ROPING ACTIVE BANNER ─────────────────────────────────── */}
      {ropingSource && (
        <div className="roping-instruction-strip">
          <Zap size={13} className="roping-pulse-glyph" />
          <span>
            ROPING ACTIVE: Click any destination card to connect with <strong>{canvasNodes.find(n => n.id === ropingSource)?.name}</strong>
          </span>
          <button className="roping-dismiss-btn" onClick={() => setRopingSource(null)}>
            Cancel Roping
          </button>
        </div>
      )}

      {/* ── TOAST CONFIRMATION NOTIFICATION ─────────────────────── */}
      {toastMessage && (
        <div className="canvas-toast-pill">
          <CheckCircle2 size={13} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Interactive Pinboard / Canvas Area ──────────────────── */}
      <div
        ref={canvasRef}
        className={`canvas-board-viewport ${isDragOver ? 'drag-over-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDoubleClick={handleCanvasDoubleClick}
        onTouchEnd={handleCanvasTouchEnd}
      >
        {/* Drop Highlight Overlay */}
        {isDragOver && (
          <div className="canvas-drop-hint">
            <Plus size={24} />
            <span>Drop Entity onto Investigation Board</span>
          </div>
        )}

        {/* ── DOUBLE-CLICK / DOUBLE-TAP QUICK SPAWN POPOVER ─────── */}
        {doubleClickMenu && (
          <div
            className="double-tap-spawn-popover"
            style={{
              transform: `translate3d(${doubleClickMenu.x}px, ${doubleClickMenu.y}px, 0)`
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <div className="popover-header">
              <div className="popover-title-row">
                <Sparkles size={12} className="popover-icon" />
                <span className="popover-title">ADD NODE AT POSITION</span>
              </div>
              <button
                className="popover-close-btn"
                onClick={() => setDoubleClickMenu(null)}
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>

            {/* Quick Name Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSpawnAtPosition('Person', quickNodeName);
              }}
              className="popover-form"
            >
              <input
                type="text"
                className="popover-input"
                placeholder="Entity name... (Enter to add)"
                value={quickNodeName}
                onChange={(e) => setQuickNodeName(e.target.value)}
                autoFocus
              />
            </form>

            {/* Fast Type Spawn Buttons */}
            <div className="popover-type-grid">
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Person', quickNodeName)}
                title="Add Person"
              >
                <User size={12} />
                <span>Person</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Organization', quickNodeName)}
                title="Add Organization"
              >
                <Building2 size={12} />
                <span>Org</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Vehicle', quickNodeName)}
                title="Add Vehicle / Vessel"
              >
                <Car size={12} />
                <span>Vessel</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Financial', quickNodeName)}
                title="Add Financial / Hawala Account"
              >
                <DollarSign size={12} />
                <span>Hawala</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Evidence', quickNodeName)}
                title="Add Evidence Artifact"
              >
                <FileText size={12} />
                <span>Evidence</span>
              </button>
            </div>
          </div>
        )}

        {/* ── SVG Bezier Ropes Layer ────────────────────────────── */}
        <svg className="canvas-ropes-svg">
          {/* Active Live Rubber-Band Line when Roping */}
          {ropingSource && (() => {
            const src = canvasNodes.find(n => n.id === ropingSource);
            if (!src) return null;
            const sx = Number.isFinite(src.x) ? src.x : 80;
            const sy = Number.isFinite(src.y) ? src.y : 80;
            const tx = Number.isFinite(mousePos.x) && mousePos.x > 0 ? mousePos.x : (sx + 160);
            const ty = Number.isFinite(mousePos.y) && mousePos.y > 0 ? mousePos.y : (sy + 60);

            // Connect from right port if mouse is to the right, left port otherwise
            const x1 = tx >= sx + 110 ? sx + 220 : sx;
            const y1 = sy + 55;
            const x2 = tx;
            const y2 = ty;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const cx1 = x1 + dx * 0.5;
            const cy1 = y1 - 20;
            const cx2 = x1 + dx * 0.5;
            const cy2 = y2 + 20;

            return (
              <g className="live-rubberband-group">
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="6, 4"
                  fill="none"
                  className="live-rope-pulse"
                />
                <circle cx={x2} cy={y2} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              </g>
            );
          })()}

          {/* Established Canvas Edges */}
          {canvasEdges.map(edge => {
            const src = canvasNodes.find(n => n.id === edge.source);
            const dst = canvasNodes.find(n => n.id === edge.target);
            if (!src || !dst) return null;

            const sx = Number.isFinite(src.x) ? src.x : 80;
            const sy = Number.isFinite(src.y) ? src.y : 80;
            const dx = Number.isFinite(dst.x) ? dst.x : 400;
            const dy = Number.isFinite(dst.y) ? dst.y : 200;

            // Connect from right port of left card to left port of right card
            const x1 = dx >= sx ? sx + 220 : sx;
            const y1 = sy + 55;
            const x2 = dx >= sx ? dx : dx + 220;
            const y2 = dy + 55;

            // Curvature control points
            const dist = x2 - x1;
            const cx1 = x1 + dist * 0.5;
            const cy1 = y1 - 25;
            const cx2 = x1 + dist * 0.5;
            const cy2 = y2 + 25;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={edge.id} className="rope-curve-group">
                {/* Glow shadow */}
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Main animated dashed rope line */}
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeDasharray="6, 4"
                  fill="none"
                  className="rope-path"
                />
                {/* Midpoint Interactive Relationship Badge */}
                <foreignObject
                  x={midX - 75}
                  y={midY - 13}
                  width="150"
                  height="26"
                  className="rope-foreign-object"
                >
                  <div
                    className="rope-label-pill"
                    title={`Click to edit or sever connection: ${edge.label} (Confidence: ${edge.confidence || 0.94})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const src = canvasNodes.find(n => n.id === edge.source);
                      const dst = canvasNodes.find(n => n.id === edge.target);
                      setEditingEdge({
                        id: edge.id,
                        sourceId: edge.source,
                        targetId: edge.target,
                        sourceName: src?.name || edge.source,
                        targetName: dst?.name || edge.target,
                        label: edge.label || 'COORDINATES_WITH',
                        customType: '',
                        confidence: edge.confidence || 0.94,
                        notes: edge.notes || ''
                      });
                    }}
                  >
                    <span className="rope-text">{edge.label}</span>
                    <button
                      className="rope-sever-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEdge(edge.id);
                        triggerToast(`Severed connection: ${edge.label}`);
                      }}
                      title="Sever / Cut Rope"
                    >
                      <Scissors size={10} />
                    </button>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* ── Interactive Draggable Node Cards ──────────────────── */}
        {filteredNodes.map(node => {
          const isSelected = selectedEntity?.id === node.id;
          const isRopingTarget = ropingSource && ropingSource !== node.id;
          const isRopingSelf = ropingSource === node.id;
          const isFlashed = flashNodeId === node.id;

          const renderX = Number.isFinite(node.x) ? node.x : 80;
          const renderY = Number.isFinite(node.y) ? node.y : 80;

          return (
            <div
              key={node.id}
              className={`canvas-entity-card ${isSelected ? 'selected' : ''} ${isRopingSelf ? 'roping-source-node' : ''} ${isRopingTarget ? 'roping-target-candidate' : ''} ${isFlashed ? 'flash-highlight' : ''}`}
              style={{
                transform: `translate3d(${renderX}px, ${renderY}px, 0)`
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onClick={() => {
                if (ropingSource && ropingSource !== node.id) {
                  completeRoping(node.id);
                } else {
                  setSelectedEntity(node);
                }
              }}
            >
              {/* Left & Right Connection Anchors */}
              <div
                className="card-rope-anchor anchor-left"
                onClick={(e) => startRopingFrom(e, node.id)}
                title={ropingSource && ropingSource !== node.id ? "Click to connect link here" : "Click to rope from this node"}
              />
              <div
                className="card-rope-anchor anchor-right"
                onClick={(e) => startRopingFrom(e, node.id)}
                title={ropingSource && ropingSource !== node.id ? "Click to connect link here" : "Click to rope from this node"}
              />

              {/* Roping Target Hint */}
              {isRopingTarget && (
                <div className="roping-target-hint font-mono">
                  <Link2 size={11} />
                  <span>CLICK TO LINK</span>
                </div>
              )}

              {/* Card Header */}
              <div className="card-drag-header">
                <div className="card-type-tag">
                  {getEntityIcon(node.type)}
                  <span>{(node.type || 'ENTITY').toUpperCase()}</span>
                </div>
                <div className="card-header-actions">
                  <ProvenanceBadge level={node.provenance || 'RAW DATA'} size="sm" />
                  <button
                    className={`card-rope-btn ${isRopingSelf ? 'active' : ''}`}
                    onClick={(e) => startRopingFrom(e, node.id)}
                    title={isRopingSelf ? "Cancel Roping" : "Rope / Connect to another node"}
                  >
                    <Link2 size={11} />
                  </button>
                </div>
              </div>

              {/* Entity Title */}
              <div className="card-node-title">
                {node.name}
              </div>

              {/* Role / Subtitle */}
              <div className="card-node-role">
                {node.role}
              </div>

              {/* Threat & Link Indicators */}
              <div className="card-node-footer">
                <span className={`threat-indicator threat-${(node.threat || 'HIGH').toLowerCase()}`}>
                  {node.threat || 'HIGH'}
                </span>
                <span className="node-drag-grip" title="Drag to move card">
                  <GripHorizontal size={12} />
                </span>
              </div>
            </div>
          );
        })}
        {/* ── Dialog 1: Define New Forensic Relationship Modal ── */}
        {pendingLink && (
          <div className="canvas-modal-overlay" onClick={() => setPendingLink(null)}>
            <div className="canvas-modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="canvas-modal-header">
                <div className="modal-title-row">
                  <Link2 size={15} className="modal-title-icon" />
                  <span className="modal-title-text font-mono">DEFINE FORENSIC RELATIONSHIP</span>
                </div>
                <button className="canvas-modal-close" onClick={() => setPendingLink(null)}>
                  <X size={14} />
                </button>
              </div>

              <div className="modal-entity-preview">
                <div className="entity-preview-box">
                  <span className="preview-label font-mono">SOURCE</span>
                  <span className="preview-name">{pendingLink.sourceName}</span>
                </div>
                <span className="preview-arrow font-mono">➔</span>
                <div className="entity-preview-box">
                  <span className="preview-label font-mono">TARGET</span>
                  <span className="preview-name">{pendingLink.targetName}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmPendingLink} className="canvas-modal-form">
                <div className="modal-form-section">
                  <label className="modal-field-label font-mono">RELATIONSHIP TYPE / CLASSIFICATION</label>
                  <div className="rel-type-chips">
                    {[
                      'COORDINATES_WITH',
                      'FINANCES',
                      'OWNS_VESSEL',
                      'CONTROLS',
                      'SMURF_WIRE_TO',
                      'COMMUNICATES_WITH',
                      'TRANSFERS_FUNDS_TO',
                      'SUPPLIES_CONTRABAND',
                      'CUSTOM'
                    ].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`rel-chip ${pendingLink.relType === type ? 'active' : ''}`}
                        onClick={() => setPendingLink(prev => ({ ...prev, relType: type }))}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {pendingLink.relType === 'CUSTOM' && (
                    <input
                      type="text"
                      className="modal-custom-rel-input"
                      placeholder="Type custom relationship (e.g. SATELLITE_UPLINK_TO)..."
                      value={pendingLink.customType}
                      onChange={e => setPendingLink(prev => ({ ...prev, customType: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                      autoFocus
                      required
                    />
                  )}
                </div>

                <div className="modal-form-section">
                  <div className="slider-label-row font-mono">
                    <span>EVIDENTIARY CONFIDENCE:</span>
                    <span className="confidence-number">{Math.round(pendingLink.confidence * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.01"
                    value={pendingLink.confidence}
                    onChange={e => setPendingLink(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                    className="modal-range-slider"
                  />
                </div>

                <div className="modal-form-section">
                  <label className="modal-field-label font-mono">INVESTIGATIVE NOTES / EVIDENCE CORROBORATION (OPTIONAL)</label>
                  <input
                    type="text"
                    className="modal-notes-input"
                    placeholder="e.g. Inferred from Hawala mirror ledger entry #88219"
                    value={pendingLink.notes}
                    onChange={e => setPendingLink(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="modal-actions-bar">
                  <button type="button" className="btn-cancel" onClick={() => setPendingLink(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm-link">
                    <Check size={13} /> Establish Relationship
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Dialog 2: Edit Existing Relationship Modal ── */}
        {editingEdge && (
          <div className="canvas-modal-overlay" onClick={() => setEditingEdge(null)}>
            <div className="canvas-modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="canvas-modal-header">
                <div className="modal-title-row">
                  <Zap size={15} className="modal-title-icon" />
                  <span className="modal-title-text font-mono">EDIT RELATIONSHIP &amp; EVIDENCE LINK</span>
                </div>
                <button className="canvas-modal-close" onClick={() => setEditingEdge(null)}>
                  <X size={14} />
                </button>
              </div>

              <div className="modal-entity-preview">
                <div className="entity-preview-box">
                  <span className="preview-label font-mono">SOURCE</span>
                  <span className="preview-name">{editingEdge.sourceName}</span>
                </div>
                <span className="preview-arrow font-mono">➔</span>
                <div className="entity-preview-box">
                  <span className="preview-label font-mono">TARGET</span>
                  <span className="preview-name">{editingEdge.targetName}</span>
                </div>
              </div>

              <form onSubmit={handleSaveEditingEdge} className="canvas-modal-form">
                <div className="modal-form-section">
                  <label className="modal-field-label font-mono">RELATIONSHIP TYPE</label>
                  <div className="rel-type-chips">
                    {[
                      'COORDINATES_WITH',
                      'FINANCES',
                      'OWNS_VESSEL',
                      'CONTROLS',
                      'SMURF_WIRE_TO',
                      'COMMUNICATES_WITH',
                      'TRANSFERS_FUNDS_TO',
                      'SUPPLIES_CONTRABAND',
                      'CUSTOM'
                    ].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`rel-chip ${editingEdge.label === type ? 'active' : ''}`}
                        onClick={() => setEditingEdge(prev => ({ ...prev, label: type }))}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {editingEdge.label === 'CUSTOM' && (
                    <input
                      type="text"
                      className="modal-custom-rel-input"
                      placeholder="Type custom relationship..."
                      value={editingEdge.customType}
                      onChange={e => setEditingEdge(prev => ({ ...prev, customType: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                      autoFocus
                      required
                    />
                  )}
                </div>

                <div className="modal-form-section">
                  <div className="slider-label-row font-mono">
                    <span>EVIDENTIARY CONFIDENCE:</span>
                    <span className="confidence-number">{Math.round(editingEdge.confidence * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.01"
                    value={editingEdge.confidence}
                    onChange={e => setEditingEdge(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                    className="modal-range-slider"
                  />
                </div>

                <div className="modal-form-section">
                  <label className="modal-field-label font-mono">INVESTIGATIVE NOTES</label>
                  <input
                    type="text"
                    className="modal-notes-input"
                    placeholder="e.g. Corroborated with AIS transponder trace"
                    value={editingEdge.notes}
                    onChange={e => setEditingEdge(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="modal-actions-bar split-actions">
                  <button
                    type="button"
                    className="btn-sever-link"
                    onClick={handleSeverEditingEdge}
                    title="Sever and delete this link"
                  >
                    <Scissors size={13} /> Sever Connection
                  </button>

                  <div className="modal-right-buttons">
                    <button type="button" className="btn-cancel" onClick={() => setEditingEdge(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-confirm-link">
                      <Check size={13} /> Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
