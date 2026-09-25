import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const WorkspaceContext = createContext(null);

export const CANONICAL_CASES = {
  'case-102': {
    id: 'case-102',
    name: 'Case 102 — Silver Dune',
    genre: 'narcotics',
    genreLabel: 'Narcotics & Trafficking',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    leadInvestigator: 'Officer A. Sharma',
    legalBasis: 'PMLA Sec 3/4 & NDPS Act Sec 21/29',
    lastModified: '14 mins ago',
    progress: 78,
    entitiesCount: 42,
    evidenceCount: 28,
    hypothesesCount: 4,
    description: 'Cross-border maritime narcotics & hawala settlement nexus between UAE and Gujarat.',
    information: {
      people: [
        { id: 'p-1', name: 'Tariq "The Anchor" Merchant', role: 'Syndicate Coordinator', risk: 'Critical', provenance: 'INFERENCE', phone: '+971-50-882-991', location: 'Dubai / Mumbai' },
        { id: 'p-2', name: 'Rajesh Sharma', role: 'Charter Broker', risk: 'High', provenance: 'OBSERVATION', phone: '+91-98201-9921', location: 'Surat, Gujarat' },
        { id: 'p-3', name: 'Captain Al-Sayed', role: 'Vessel Master (MV Sagar Ratna)', risk: 'Medium', provenance: 'RAW DATA', phone: '+968-9122-384', location: 'At Sea' },
      ],
      organizations: [
        { id: 'org-1', name: 'Al-Barakah Logistics FZE', jurisdiction: 'Dubai, UAE', type: 'Shell Logistics', provenance: 'INFERENCE', address: 'JAFZA Zone 4, Dubai' },
        { id: 'org-2', name: 'Vikramaditya Shipping Lines', jurisdiction: 'Mumbai, India', type: 'Maritime Freight', provenance: 'RAW DATA', address: 'Nariman Point, Mumbai' },
      ],
      locations: [
        { id: 'loc-1', name: 'Port of Kandla (Terminal 4)', type: 'Maritime Port', country: 'India', provenance: 'RAW DATA' },
        { id: 'loc-2', name: 'Dubai Marina Al-Sayeed Tower', type: 'Office Suite', country: 'UAE', provenance: 'OBSERVATION' },
      ],
      vehicles: [
        { id: 'veh-1', name: 'MV Sagar Ratna (IMO 921882)', type: 'Bulk Cargo Carrier', flag: 'Panama', provenance: 'RAW DATA' },
      ],
      financial: [
        { id: 'fin-1', name: 'Hawala Node Account #88219', bank: 'Emirates National Mirror Ledger', amount: '₹14.8 Cr split', provenance: 'CORRELATION' },
      ],
      digital: [
        { id: 'dig-1', name: 'Thuraya Satellite IMEI #SAT-992', status: 'Active Pings', provenance: 'RAW DATA' },
      ],
      evidence: [
        { id: 'evd-1', title: 'Bill of Lading #BOL-9921-A', type: 'PDF Document', classification: 'SECRET', hash: '88f29cb1...b19c', provenance: 'RAW DATA' },
        { id: 'evd-2', title: 'CCTV Still: Port Gate 3 Offloading', type: 'Image File', classification: 'CONFIDENTIAL', hash: '32e1c4a2...c4a2', provenance: 'RAW DATA' },
        { id: 'evd-3', title: 'Wire Transfer Ledger (Al-Barakah)', type: 'Encrypted CSV', classification: 'RESTRICTED', hash: '99a7d31f...d31f', provenance: 'RAW DATA' },
      ]
    }
  },
  'case-117': {
    id: 'case-117',
    name: 'Case 117 — Operation Black Tide',
    genre: 'corporate_fraud',
    genreLabel: 'Corporate Fraud & AML',
    status: 'ACTIVE',
    priority: 'HIGH',
    leadInvestigator: 'Inspector K. Varma',
    legalBasis: 'NDPS Act Sec 21/29 & UAPA Sec 15',
    lastModified: '2 hours ago',
    progress: 62,
    entitiesCount: 38,
    evidenceCount: 22,
    hypothesesCount: 3,
    description: 'Offshore corporate shell layering & illicit wire transfers through Colombo and Deira bullion nodes.',
    information: {
      people: [
        { id: 'p-101', name: 'Farhan "Ghost" Qureshi', role: 'AML Smurfing Master', risk: 'Critical', provenance: 'INFERENCE', phone: '+94-77-229-1002', location: 'Colombo / Mumbai' },
      ],
      organizations: [
        { id: 'org-102', name: 'Blue Horizon Marine Exports LLP', jurisdiction: 'Surat SEZ', type: 'Company', provenance: 'EXTRACTED_ENTITY' },
      ],
      evidence: [
        { id: 'evd-103', title: 'SWIFT Wire Transfer Log #FIU-99201', type: 'Financial Record', classification: 'SECRET', hash: '11b9a87c...a87c', provenance: 'EVIDENCE' },
      ]
    }
  },
  'case-143': {
    id: 'case-143',
    name: 'Case 143 — Red Sand Syndicate',
    genre: 'trafficking',
    genreLabel: 'Human Trafficking',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    leadInvestigator: 'Special Agent D. Roy',
    legalBasis: 'BNS Sec 143 (Human Trafficking) & Passports Act',
    lastModified: '5 hours ago',
    progress: 45,
    entitiesCount: 24,
    evidenceCount: 15,
    hypothesesCount: 2,
    description: 'Organized smuggling ring and counterfeit maritime passport broker network across Saurashtra creeks.',
    information: {
      people: [
        { id: 'p-201', name: 'Dinesh "Koli" Patel', role: 'Dhow Master', risk: 'High', provenance: 'OBSERVATION' },
      ],
      locations: [
        { id: 'loc-202', name: 'Porbandar Coastal Creek Berth 9', type: 'Crime Scene', provenance: 'RAW DATA' },
      ]
    }
  },
  'case-108': {
    id: 'case-108',
    name: 'Case 108 — Waterfront Contract Hit',
    genre: 'homicide',
    genreLabel: 'Homicide & Murder',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    leadInvestigator: 'Sr. Inspector R. Deshmukh',
    legalBasis: 'BNS Sec 103 (Murder) & Arms Act',
    lastModified: '45 mins ago',
    progress: 84,
    entitiesCount: 19,
    evidenceCount: 14,
    hypothesesCount: 3,
    description: 'Targeted execution of customs informant at Dock 4. 9mm Glock ballistics match to syndicate hitman.',
    information: {
      people: [
        { id: 'p-301', name: 'Vikram "Blade" Jadhav', role: 'Contract Shooter', risk: 'Critical', provenance: 'OBSERVATION' },
      ],
      evidence: [
        { id: 'evd-302', title: '9mm Glock Ballistics Striation Report', type: 'Forensic Report', classification: 'CRITICAL', hash: 'aa19c344...c344', provenance: 'EVIDENCE' },
      ]
    }
  },
  'case-121': {
    id: 'case-121',
    name: 'Case 121 — Diamond Bourse Vault Breach',
    genre: 'robbery',
    genreLabel: 'Armed Robbery & Heist',
    status: 'ACTIVE',
    priority: 'HIGH',
    leadInvestigator: 'Deputy Commissioner V. Mehta',
    legalBasis: 'BNS Sec 309 (Robbery) & IT Act Sec 66D',
    lastModified: '3 hours ago',
    progress: 58,
    entitiesCount: 29,
    evidenceCount: 18,
    hypothesesCount: 2,
    description: 'Inside-job biometric override and armed breach of Bharat Diamond Bourse subterranean vault.',
    information: {
      people: [
        { id: 'p-401', name: 'Arjun Singhania (Insider)', role: 'Access Controller', risk: 'High', provenance: 'INFERENCE' },
      ],
      evidence: [
        { id: 'evd-402', title: 'CCTV Turnstile Footage #BK-882', type: 'Video File', classification: 'RESTRICTED', hash: 'ee42d910...d910', provenance: 'EVIDENCE' },
      ]
    }
  },
  'case-135': {
    id: 'case-135',
    name: 'Case 135 — Black Pearl Extortion',
    genre: 'blackmail',
    genreLabel: 'Extortion & Blackmail',
    status: 'ACTIVE',
    priority: 'HIGH',
    leadInvestigator: 'ACP S. Kulkarni',
    legalBasis: 'BNS Sec 308 (Extortion) & IT Act Sec 66D',
    lastModified: '6 hours ago',
    progress: 51,
    entitiesCount: 16,
    evidenceCount: 11,
    hypothesesCount: 2,
    description: 'Coercive extortion ring targeting Kandla shipping contractors with VoIP death threats and ransom calls.',
    information: {
      people: [
        { id: 'p-501', name: 'Sameer "Viper" Mir', role: 'Ring Leader', risk: 'High', provenance: 'OBSERVATION' },
      ]
    }
  },
  'case-155': {
    id: 'case-155',
    name: 'Case 155 — Blue Horizon Maritime Dispute',
    genre: 'civil_maritime',
    genreLabel: 'Civil & Maritime Disputes',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    leadInvestigator: 'Maritime Advocate N. Joshi',
    legalBasis: 'Admiralty Act 2017 & UNCLOS Art 110',
    lastModified: '8 hours ago',
    progress: 39,
    entitiesCount: 21,
    evidenceCount: 12,
    hypothesesCount: 1,
    description: 'Arrest warrant for MT Desert Pearl over unpaid bunker fuel claims and flag registry falsification.',
    information: {
      vehicles: [
        { id: 'veh-601', name: 'MT Desert Pearl (Ghost Tanker)', role: 'Sanctions Evasion Tanker', risk: 'High', provenance: 'RAW DATA' },
      ]
    }
  },
  'case-168': {
    id: 'case-168',
    name: 'Case 168 — Darknet Cyber Infiltration',
    genre: 'cyber',
    genreLabel: 'Cyber & Digital Crimes',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    leadInvestigator: 'Cyber Cell Lead T. Nair',
    legalBasis: 'IT Act Sec 66F (Cyber Terrorism)',
    lastModified: '1 hour ago',
    progress: 72,
    entitiesCount: 26,
    evidenceCount: 19,
    hypothesesCount: 3,
    description: 'Encrypted Thuraya packet bursts and command-and-control beaconing off Saurashtra coastal light beacon.',
    information: {
      digital: [
        { id: 'dig-701', name: 'Thuraya Frequency Band 1544.15 MHz', role: 'Encrypted Radio Burst', risk: 'Critical', provenance: 'OBSERVATION' },
      ]
    }
  }
};

const INITIAL_CANVAS_NODES = [
  {
    id: 'p-1',
    name: 'Tariq "The Anchor" Merchant',
    type: 'Person',
    role: 'Syndicate Coordinator',
    threat: 'CRITICAL',
    provenance: 'INFERENCE',
    x: 80,
    y: 80
  },
  {
    id: 'p-2',
    name: 'Rajesh Sharma',
    type: 'Person',
    role: 'Charter Broker',
    threat: 'HIGH',
    provenance: 'OBSERVATION',
    x: 420,
    y: 90
  },
  {
    id: 'org-1',
    name: 'Al-Barakah Logistics FZE',
    type: 'Organization',
    role: 'Shell Charterer (Dubai)',
    threat: 'HIGH',
    provenance: 'INFERENCE',
    x: 180,
    y: 280
  },
  {
    id: 'fin-1',
    name: 'Hawala Account #88219',
    type: 'Financial',
    role: '₹14.8 Cr Settlement Mirror',
    threat: 'CRITICAL',
    provenance: 'CORRELATION',
    x: 480,
    y: 310
  }
];

const INITIAL_CANVAS_EDGES = [
  { id: 'edge-1', source: 'p-1', target: 'org-1', label: 'BENEFICIAL_OWNER', confidence: 0.94 },
  { id: 'edge-2', source: 'p-1', target: 'p-2', label: 'COMMUNICATES_WITH', confidence: 0.88 },
  { id: 'edge-3', source: 'org-1', target: 'fin-1', label: 'FUNDS_TRANSFERRED', confidence: 0.96 },
  { id: 'edge-4', source: 'p-2', target: 'fin-1', label: 'AUTHORIZED_SIGNATORY', confidence: 0.91 }
];

export const DEFAULT_WORKSPACES = [
  {
    id: 'ws-102',
    name: 'Silver Dune — Maritime Narcotics & Hawala Board',
    caseId: 'case-102',
    caseName: 'Case 102 — Silver Dune',
    description: 'Tracing cross-border lightering off Saurashtra coast and Hawala split mirror accounts.',
    genre: 'narcotics',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    lastModified: '14 mins ago',
    nodesCount: 4,
    edgesCount: 4,
    nodes: INITIAL_CANVAS_NODES,
    edges: INITIAL_CANVAS_EDGES
  },
  {
    id: 'ws-117',
    name: 'Operation Black Tide — Corporate Shells & AML',
    caseId: 'case-117',
    caseName: 'Case 117 — Operation Black Tide',
    description: 'Analyzing Farhan Qureshi straw account network and Colombo escrow wire transfers.',
    genre: 'corporate_fraud',
    priority: 'HIGH',
    status: 'ACTIVE',
    lastModified: '2 hours ago',
    nodesCount: 3,
    edgesCount: 2,
    nodes: [
      { id: 'p-101', name: 'Farhan "Ghost" Qureshi', role: 'AML Smurfing Master', type: 'Person', threat: 'CRITICAL', provenance: 'INFERENCE', x: 120, y: 100 },
      { id: 'org-102', name: 'Blue Horizon Marine LLP', role: 'Surat SEZ Front Entity', type: 'Organization', threat: 'HIGH', provenance: 'EXTRACTED_ENTITY', x: 440, y: 120 },
      { id: 'evd-103', name: 'SWIFT Transfer Log #FIU-99201', role: 'Cryptographic SWIFT Trace', type: 'Evidence', threat: 'HIGH', provenance: 'EVIDENCE', x: 280, y: 300 }
    ],
    edges: [
      { id: 'edge-101', source: 'p-101', target: 'org-102', label: 'CONTROLS', confidence: 0.95 },
      { id: 'edge-102', source: 'org-102', target: 'evd-103', label: 'EVIDENCE_OF', confidence: 0.98 }
    ]
  },
  {
    id: 'ws-143',
    name: 'Red Sand Syndicate — Porbandar Creek Smuggling',
    caseId: 'case-143',
    caseName: 'Case 143 — Red Sand Syndicate',
    description: 'Tracking unflagged nocturnal dhow routes and counterfeit passport broker safehouses.',
    genre: 'trafficking',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    lastModified: '5 hours ago',
    nodesCount: 2,
    edgesCount: 1,
    nodes: [
      { id: 'p-201', name: 'Dinesh "Koli" Patel', role: 'Coastal Dhow Master', type: 'Person', threat: 'HIGH', provenance: 'OBSERVATION', x: 140, y: 120 },
      { id: 'loc-202', name: 'Porbandar Coastal Creek Berth 9', role: 'Clandestine Offload Depot', type: 'Location', threat: 'HIGH', provenance: 'RAW_DATA', x: 420, y: 160 }
    ],
    edges: [
      { id: 'edge-201', source: 'p-201', target: 'loc-202', label: 'VISITED', confidence: 0.89 }
    ]
  },
  {
    id: 'ws-108',
    name: 'Waterfront Contract Hit — Ballistics Board',
    caseId: 'case-108',
    caseName: 'Case 108 — Waterfront Contract Hit',
    description: 'Forensic matching of Dock 4 spent casings to syndicate hitman Vikram Jadhav.',
    genre: 'homicide',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    lastModified: '45 mins ago',
    nodesCount: 2,
    edgesCount: 1,
    nodes: [
      { id: 'p-301', name: 'Vikram "Blade" Jadhav', role: 'Shooter / Hitman', type: 'Person', threat: 'CRITICAL', provenance: 'OBSERVATION', x: 150, y: 120 },
      { id: 'evd-302', name: '9mm Glock Ballistics Striation Report', role: 'Forensic Ballistics Proof', type: 'Evidence', threat: 'CRITICAL', provenance: 'EVIDENCE', x: 450, y: 140 }
    ],
    edges: [
      { id: 'edge-301', source: 'p-301', target: 'evd-302', label: 'ACCUSED_OF', confidence: 0.99 }
    ]
  }
];

export function WorkspaceProvider({ children }) {
  const [activeCaseId, setActiveCaseId] = useState('case-102');
  const [activeNavSection, setActiveNavSection] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || params.get('section');
      if (tab) return tab;
    }
    return 'home';
  });

  // Theme Management (Minimal Clean Light / Pure Black Dark)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme) return urlTheme;
    }
    return localStorage.getItem('constellation_theme') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('constellation_theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  // Workspaces Management State
  const [workspaces, setWorkspaces] = useState(DEFAULT_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('ws') || params.get('workspace') || null;
    }
    return null;
  });
  
  // Interactive Canvas Nodes & Roping State
  const [canvasNodes, setCanvasNodes] = useState(INITIAL_CANVAS_NODES);
  const [canvasEdges, setCanvasEdges] = useState(INITIAL_CANVAS_EDGES);

  // Sync workspaces from backend on mount
  useEffect(() => {
    api.listWorkspaces()
      .then(serverWorkspaces => {
        if (serverWorkspaces && serverWorkspaces.length > 0) {
          const formatted = serverWorkspaces.map(sw => {
            const canvas = sw.canvas_state || {};
            const nodes = canvas.nodes && canvas.nodes.length > 0 ? canvas.nodes : [];
            const edges = canvas.edges && canvas.edges.length > 0 ? canvas.edges : [];
            return {
              id: sw.id,
              name: sw.name,
              caseId: sw.case_id || 'case-102',
              caseName: sw.case_id ? (CANONICAL_CASES[sw.case_id]?.name || sw.name) : 'Case 102 — Silver Dune',
              description: sw.description || '',
              genre: CANONICAL_CASES[sw.case_id]?.genre || 'narcotics',
              priority: CANONICAL_CASES[sw.case_id]?.priority || 'HIGH',
              status: 'ACTIVE',
              lastModified: sw.updated_at ? new Date(sw.updated_at).toLocaleTimeString() : 'Recently',
              nodesCount: nodes.length,
              edgesCount: edges.length,
              nodes,
              edges
            };
          });
          setWorkspaces(formatted);
        }
      })
      .catch(err => {
        console.warn('Backend workspaces sync note:', err);
      });
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || null;

  // Open Workspace action
  const openWorkspace = (wsId) => {
    const ws = workspaces.find(w => w.id === wsId);
    if (ws) {
      setActiveWorkspaceId(ws.id);
      setActiveCaseId(ws.caseId || 'case-102');
      if (ws.nodes && ws.nodes.length > 0) {
        setCanvasNodes(ws.nodes);
      } else {
        // If empty, load canonical nodes for case or initial canvas nodes
        setCanvasNodes(INITIAL_CANVAS_NODES);
      }
      if (ws.edges && ws.edges.length > 0) {
        setCanvasEdges(ws.edges);
      } else {
        setCanvasEdges(INITIAL_CANVAS_EDGES);
      }
    }
  };

  // Close Workspace action (return to overview hub & persist canvas)
  const closeWorkspace = () => {
    if (activeWorkspaceId) {
      setWorkspaces(prev => prev.map(w => 
        w.id === activeWorkspaceId 
          ? { ...w, nodes: canvasNodes, edges: canvasEdges, nodesCount: canvasNodes.length, edgesCount: canvasEdges.length, lastModified: 'Just now' }
          : w
      ));

      // Persist canvas state to backend
      api.updateWorkspace(activeWorkspaceId, {
        canvas_state: { nodes: canvasNodes, edges: canvasEdges }
      }).catch(err => console.warn('Could not persist workspace to backend:', err));
    }
    setActiveWorkspaceId(null);
  };

  // Create Workspace action (persists to backend, supports custom case labeling and standalone investigations)
  const createWorkspace = async ({ name, caseId, description, caseType, customLabel }) => {
    const isStandalone = !caseId || caseId === 'none' || caseId === 'standalone';
    const targetCase = !isStandalone ? (CANONICAL_CASES[caseId] || CANONICAL_CASES['case-102']) : null;
    let newId = `ws-${Date.now()}`;
    
    const computedName = name || (customLabel ? `${customLabel} Workspace` : `Investigation Workspace #${workspaces.length + 1}`);
    const computedGenre = caseType || targetCase?.genre || 'narcotics';
    const computedCaseName = targetCase ? targetCase.name : (customLabel || 'Standalone Investigation');
    const computedCaseId = targetCase ? targetCase.id : (caseId || 'case-custom');

    try {
      const created = await api.createWorkspace({
        name: computedName,
        case_id: computedCaseId,
        description: description || `Investigation board for ${computedCaseName}.`
      });
      if (created && created.id) newId = created.id;
    } catch (err) {
      console.warn('Could not create workspace on backend, using local ID:', err);
    }

    const newWs = {
      id: newId,
      name: computedName,
      caseId: computedCaseId,
      caseName: computedCaseName,
      description: description || `Investigation board for ${computedCaseName}.`,
      genre: computedGenre,
      priority: targetCase?.priority || 'HIGH',
      status: 'ACTIVE',
      lastModified: 'Just now',
      nodesCount: 0,
      edgesCount: 0,
      nodes: [],
      edges: []
    };
    setWorkspaces(prev => [newWs, ...prev]);
    setActiveWorkspaceId(newWs.id);
    setActiveCaseId(computedCaseId);
    setCanvasNodes([]);
    setCanvasEdges([]);
    return newWs;
  };

  // Open Workspace for a specific case with fallback
  const openWorkspaceForCase = (caseId) => {
    const matching = workspaces.find(w => w.caseId === caseId);
    if (matching) {
      openWorkspace(matching.id);
    } else if (workspaces.length > 0) {
      openWorkspace(workspaces[0].id);
    }
    setActiveCaseId(caseId);
    setActiveNavSection('workspace');
  };


  // Delete Workspace action (persists to backend)
  const deleteWorkspace = (wsId) => {
    setWorkspaces(prev => prev.filter(w => w.id !== wsId));
    if (activeWorkspaceId === wsId) {
      setActiveWorkspaceId(null);
    }
    api.deleteWorkspace(wsId).catch(err => console.warn('Could not delete workspace on backend:', err));
  };


  // Tabs state for multi-tab views if needed
  const [openTabs, setOpenTabs] = useState([
    { id: 'canvas', title: 'Investigation Board', type: 'canvas', closable: false },
    { id: 'timeline', title: 'Timeline Reconstruction', type: 'timeline', closable: true },
    { id: 'evidence', title: 'Evidence Vault', type: 'evidence', closable: true }
  ]);
  const [activeTabId, setActiveTabId] = useState('canvas');

  // Roping mode state
  const [ropingSource, setRopingSource] = useState(null); // Node ID when dragging or clicking rope
  const [isRopingMode, setIsRopingMode] = useState(false);

  // Tool panels open state
  const [byomkeshOpen, setByomkeshOpen] = useState(true);
  const [dataUploaderOpen, setDataUploaderOpen] = useState(true);
  const [crossCaseOpen, setCrossCaseOpen] = useState(false);
  const [totalExplorerOpen, setTotalExplorerOpen] = useState(false);

  // 3 Floating Windows State (positioning, minimization, maximize)
  const [windowsState, setWindowsState] = useState({
    canvas: { open: true, minimized: false, maximized: false, zIndex: 10, title: 'Investigation Board // Case 102' },
    byomkesh: { open: true, minimized: false, maximized: false, zIndex: 11, title: 'Byomkesh AI // Reasoning Engine' },
    evidence: { open: true, minimized: false, maximized: false, zIndex: 12, title: 'Evidence & Dossier Inspector' }
  });

  const [selectedEntity, setSelectedEntity] = useState(INITIAL_CANVAS_NODES[0]);
  const [selectedFileItem, setSelectedFileItem] = useState({
    type: 'investigation',
    folder: 'INVESTIGATION',
    item: 'Main Investigation'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [canvasFilterType, setCanvasFilterType] = useState('ALL');
  const [showConnectBar, setShowConnectBar] = useState(false);

  // Strictly synchronize activeCase with activeWorkspace if a workspace is loaded
  const activeCase = (activeWorkspace && activeWorkspace.caseId && CANONICAL_CASES[activeWorkspace.caseId])
    ? CANONICAL_CASES[activeWorkspace.caseId]
    : (CANONICAL_CASES[activeCaseId] || CANONICAL_CASES['case-102']);

  const quickSpawnNode = (type) => {
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
    return added;
  };

  const openTab = (tab) => {
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tab.id)) return prev;
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  };

  const closeTab = (tabId) => {
    setOpenTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && filtered.length > 0) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  // Node highlight / flash state
  const [flashNodeId, setFlashNodeId] = useState(null);

  // Live Real-Time Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'HAWALA ANOMALY FLAGGED',
      message: 'FIU-IND flagged recurring ₹4.8Cr split wire transfers to Dubai mirror accounts.',
      time: '2 mins ago',
      urgency: 'CRITICAL',
      read: false,
      caseId: 'case-102',
      targetId: 'fin-1'
    },
    {
      id: 'notif-2',
      title: 'AIS TRANSPONDER BLACKOUT',
      message: 'MV Sagar Ratna transponder inactive for 31 hours in international waters.',
      time: '18 mins ago',
      urgency: 'HIGH',
      read: false,
      caseId: 'case-102',
      targetId: 'veh-1'
    },
    {
      id: 'notif-3',
      title: 'PORT GATE 3 OFFLOAD RECORDED',
      message: 'CCTV captured unmanifested midnight container offload supervised by suspect associate.',
      time: '1 hour ago',
      urgency: 'HIGH',
      read: false,
      caseId: 'case-102',
      targetId: 'loc-1'
    },
    {
      id: 'notif-4',
      title: 'CROSS-CASE LINK VERIFIED',
      message: 'Byomkesh verified beneficial owner nexus between Case 102 and Case 117.',
      time: '3 hours ago',
      urgency: 'MEDIUM',
      read: true,
      caseId: 'case-117',
      targetId: 'p-1'
    }
  ]);

  // Load real notifications from backend and merge
  useEffect(() => {
    api.listNotifications()
      .then(serverNotifs => {
        if (serverNotifs && serverNotifs.length > 0) {
          const backendNotifs = serverNotifs.map(n => ({
            id: n.id,
            title: n.title,
            message: n.body || '',
            time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            urgency: (n.notification_type || 'info').toUpperCase() === 'CRITICAL' ? 'CRITICAL' : (n.notification_type || 'info').toUpperCase() === 'HIGH' ? 'HIGH' : 'MEDIUM',
            read: !!n.is_read,
            caseId: n.link || '',
            targetId: ''
          }));
          // Merge: backend notifications first, then keep canonical ones that don't overlap
          setNotifications(prev => {
            const backendIds = new Set(backendNotifs.map(n => n.id));
            const localOnly = prev.filter(n => !backendIds.has(n.id));
            return [...backendNotifs, ...localOnly];
          });
        }
      })
      .catch(err => console.warn('Backend notifications sync:', err));
  }, []);

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Sync to backend
    api.markAllNotificationsRead().catch(() => {});
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Add entity/file dragged or clicked from File Explorer onto Canvas
  const addNodeToCanvas = (item, x = null, y = null) => {
    if (!item) return;
    
    // Smart cascading placement if coordinates not explicitly provided (min 80px)
    const defaultX = 120 + ((canvasNodes.length * 75) % 450);
    const defaultY = 100 + ((canvasNodes.length * 60) % 320);
    const posX = typeof x === 'number' && Number.isFinite(x) && x >= 30 ? Math.round(x) : defaultX;
    const posY = typeof y === 'number' && Number.isFinite(y) && y >= 30 ? Math.round(y) : defaultY;

    const existingIndex = canvasNodes.findIndex(n => 
      n.id === item.id || (item.name && n.name === item.name) || (item.title && n.name === item.title)
    );

    if (existingIndex !== -1) {
      const existing = canvasNodes[existingIndex];
      // Move to target drop position or keep current safe position (never snap to 0 or 10)
      const curSafeX = Number.isFinite(existing.x) && existing.x >= 30 ? existing.x : defaultX;
      const curSafeY = Number.isFinite(existing.y) && existing.y >= 30 ? existing.y : defaultY;
      const updatedX = typeof x === 'number' && Number.isFinite(x) && x >= 30 ? Math.round(x) : curSafeX;
      const updatedY = typeof y === 'number' && Number.isFinite(y) && y >= 30 ? Math.round(y) : curSafeY;
      
      setCanvasNodes(prev => prev.map((n, idx) => 
        idx === existingIndex ? { ...n, x: updatedX, y: updatedY } : n
      ));
      setSelectedEntity({ ...existing, x: updatedX, y: updatedY });
      setFlashNodeId(existing.id);
      setTimeout(() => setFlashNodeId(null), 3000);
      return { ...existing, x: updatedX, y: updatedY, isExisting: true };
    }

    const newNode = {
      id: item.id || `node-${Date.now().toString(36)}-${canvasNodes.length + 1}`,
      name: item.name || item.title || 'New Entity',
      type: item.type || (item.role ? 'Person' : 'Entity'),
      role: item.role || item.classification || 'Investigative Artifact',
      threat: item.risk || item.threat || 'HIGH',
      provenance: item.provenance || 'INFERENCE',
      x: posX,
      y: posY,
      phone: item.phone,
      location: item.location,
      details: item.details || `Added to active investigation board.`
    };

    setCanvasNodes(prev => [...prev, newNode]);
    setSelectedEntity(newNode);
    setFlashNodeId(newNode.id);
    setTimeout(() => setFlashNodeId(null), 3000);

    // Persist new entity to backend graph
    if (!item.isExisting && item.name) {
      api.createEntity({
        label: item.type || (item.role ? 'Person' : 'Entity'),
        case_id: activeCaseId,
        properties: {
          id: newNode.id,
          name: newNode.name,
          full_name: newNode.name,
          role: newNode.role,
          threat: newNode.threat,
          provenance: newNode.provenance,
          phone: newNode.phone,
          location: newNode.location,
          details: newNode.details
        }
      }).catch(err => console.warn('Backend entity create notice:', err));
    }

    return { ...newNode, isExisting: false };
  };

  // Add Roped Connection Line (persists relationship to backend & HMAC audit chain)
  const addRopeConnection = (sourceId, targetId, label = 'COORDINATES_WITH', options = {}) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const existing = canvasEdges.find(e => 
      (e.source === sourceId && e.target === targetId) || 
      (e.source === targetId && e.target === sourceId)
    );
    const confidence = options.confidence !== undefined ? options.confidence : 0.94;
    const notes = options.notes || '';

    if (existing) {
      const updatedEdges = canvasEdges.map(e => e.id === existing.id ? { ...e, label, confidence, notes } : e);
      setCanvasEdges(updatedEdges);
      setRopingSource(null);
      if (activeWorkspaceId) {
        api.updateWorkspace(activeWorkspaceId, {
          canvas_state: { nodes: canvasNodes, edges: updatedEdges }
        }).catch(() => {});
      }
      return;
    }

    const newEdge = {
      id: `rope-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label,
      confidence,
      notes
    };
    const nextEdges = [...canvasEdges, newEdge];
    setCanvasEdges(nextEdges);
    setRopingSource(null);

    // Real backend persistence into Graph DB & HMAC Audit Ledger!
    api.createRelationship({
      from_id: sourceId,
      to_id: targetId,
      rel_type: label,
      confidence,
      source_ids: [],
      method: 'canvas_bezier_roping',
      properties: { created_via: 'InvestigationCanvas', notes }
    }).catch(err => console.warn('Could not persist relationship to backend:', err));

    // Save updated canvas state to workspace
    if (activeWorkspaceId) {
      api.updateWorkspace(activeWorkspaceId, {
        canvas_state: { nodes: canvasNodes, edges: nextEdges }
      }).catch(() => {});
    }
  };

  // Update an existing edge connection's label, confidence, or notes
  const updateRopeConnection = (edgeId, updates) => {
    if (!edgeId) return;
    const nextEdges = canvasEdges.map(e => e.id === edgeId ? { ...e, ...updates } : e);
    setCanvasEdges(nextEdges);
    if (activeWorkspaceId) {
      api.updateWorkspace(activeWorkspaceId, {
        canvas_state: { nodes: canvasNodes, edges: nextEdges }
      }).catch(err => console.warn('Could not update edge in workspace:', err));
    }
  };

  const removeEdge = (edgeId) => {
    const nextEdges = canvasEdges.filter(e => e.id !== edgeId);
    setCanvasEdges(nextEdges);


    // Persist severance to backend graph and audit ledger
    api.deleteRelationship(edgeId).catch(err => {
      console.warn('Could not sever edge in backend graph:', err);
    });

    if (activeWorkspaceId) {
      api.updateWorkspace(activeWorkspaceId, {
        canvas_state: { nodes: canvasNodes, edges: nextEdges }
      }).catch(() => {});
    }
  };

  const updateNodePosition = useCallback((id, x, y) => {
    setCanvasNodes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const validX = typeof x === 'number' && Number.isFinite(x) && x >= 20 ? Math.round(x) : (n.x >= 20 ? n.x : 80);
      const validY = typeof y === 'number' && Number.isFinite(y) && y >= 20 ? Math.round(y) : (n.y >= 20 ? n.y : 80);
      return { ...n, x: validX, y: validY };
    }));
  }, []);

  const toggleWindow = (winKey) => {
    setWindowsState(prev => ({
      ...prev,
      [winKey]: { ...prev[winKey], open: !prev[winKey].open }
    }));
  };

  const toggleMinimizeWindow = (winKey) => {
    setWindowsState(prev => ({
      ...prev,
      [winKey]: { ...prev[winKey], minimized: !prev[winKey].minimized }
    }));
  };

  const bringToFront = (winKey) => {
    setWindowsState(prev => {
      const maxZ = Math.max(...Object.values(prev).map(w => w.zIndex || 10));
      return {
        ...prev,
        [winKey]: { ...prev[winKey], zIndex: maxZ + 1 }
      };
    });
  };

  // Quick Ingestion Engine
  const ingestArtifact = (artifact) => {
    const assignedCase = CANONICAL_CASES[artifact.caseId] || CANONICAL_CASES['case-102'];
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `Artifact Ingested: ${artifact.title || 'New Dossier'}`,
      desc: `Cryptographic SHA-256 registered into ${assignedCase.name}. Tagged: [${artifact.genre || 'UNCLASSIFIED'}] Tier: [${artifact.tier || 'RAW_DATA'}].`,
      time: 'Just now',
      unread: true,
      caseId: artifact.caseId || 'case-102'
    };
    setNotifications(prev => [newNotif, ...prev]);

    return {
      success: true,
      id: `art-${Date.now()}`,
      caseName: assignedCase.name,
      ...artifact
    };
  };

  return (
    <WorkspaceContext.Provider value={{
      activeCaseId,
      setActiveCaseId,
      activeCase,
      activeNavSection,
      setActiveNavSection,
      canvasNodes,
      setCanvasNodes,
      canvasEdges,
      setCanvasEdges,
      addNodeToCanvas,
      addRopeConnection,
      updateRopeConnection,
      removeEdge,
      openWorkspaceForCase,
      updateNodePosition,
      windowsState,
      setWindowsState,
      toggleWindow,
      toggleMinimizeWindow,
      bringToFront,
      selectedEntity,
      setSelectedEntity,
      selectedFileItem,
      setSelectedFileItem,
      searchQuery,
      setSearchQuery,
      openTabs,
      activeTabId,
      setActiveTabId,
      openTab,
      closeTab,
      ropingSource,
      setRopingSource,
      isRopingMode,
      setIsRopingMode,
      canvasFilterType,
      setCanvasFilterType,
      showConnectBar,
      setShowConnectBar,
      quickSpawnNode,
      flashNodeId,
      notifications,
      markAllNotificationsRead,
      dismissNotification,
      ingestArtifact,
      workspaces,
      setWorkspaces,
      activeWorkspaceId,
      setActiveWorkspaceId,
      activeWorkspace,
      openWorkspace,
      closeWorkspace,
      createWorkspace,
      deleteWorkspace,
      byomkeshOpen,
      setByomkeshOpen,
      dataUploaderOpen,
      setDataUploaderOpen,
      crossCaseOpen,
      setCrossCaseOpen,
      totalExplorerOpen,
      setTotalExplorerOpen,
      theme,
      setTheme,
      toggleTheme
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
