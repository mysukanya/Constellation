import { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import {
  Folder, FolderPlus, FileText, Users, Building2, Car, DollarSign,
  Search, X, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight,
  ChevronDown, ChevronLeft, ExternalLink, Filter, Layers, Database, Lock, Eye, Plus,
  LayoutGrid, List, ArrowLeft, ArrowUp, HardDrive, ShieldCheck, Check,
  Clock, Hash, FileCode, Archive, Sparkles, AlertTriangle, Monitor,
  Laptop, RefreshCw, Scissors, Copy, Trash2, Edit3, Share2, Info, Star
} from 'lucide-react';
import './TotalFileExplorer.css';

// ══════════════════════════════════════════════════════════════════════════════
// WINDOWS FILE EXPLORER DEFAULT REPOSITORY DIRECTORY TREE
// ══════════════════════════════════════════════════════════════════════════════

const INITIAL_DIRECTORY_TREE = {
  id: 'root',
  name: 'This PC',
  type: 'root',
  children: [
    {
      id: 'drive-c',
      name: 'Bureau Vault (C:)',
      type: 'drive',
      children: [
        {
          id: 'dir-active',
          name: 'Active Investigations',
          type: 'folder',
          isSystem: true,
          status: 'ACTIVE',
          children: [
            {
              id: 'case-102',
              name: 'Case 102 — Silver Dune',
              type: 'case_folder',
              caseId: 'case-102',
              status: 'ACTIVE',
              genre: 'Narcotics & Trafficking',
              lead: 'Officer A. Sharma',
              children: [
                {
                  id: 'c102-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-102-1', name: 'Bill_of_Lading_BOL-9921-A.pdf', type: 'file', fileType: 'PDF Document', size: '2.4 MB', date: '2026-09-21', hash: '0x88f29cb19c4d32e1', tier: 'RAW_DATA', admissibility: 'Admissible under BNSS Sec 63' },
                    { id: 'f-102-2', name: 'CCTV_Gate3_Nocturnal_Drop.mp4', type: 'file', fileType: 'CCTV Video', size: '48.2 MB', date: '2026-09-22', hash: '0x32e1c4a28891f9b3', tier: 'RAW_DATA', admissibility: 'Tamper Evident Timestamp' },
                    { id: 'f-102-3', name: 'Al_Barakah_Seized_Ledger.enc.csv', type: 'file', fileType: 'Encrypted Ledger', size: '614 KB', date: '2026-09-23', hash: '0x99a7d31fe102b48a', tier: 'EVIDENCE', admissibility: 'Forensic Duplicate Verified' },
                    { id: 'f-102-4', name: 'Terminal_Panchnama_Spot4.docx', type: 'file', fileType: 'Word Document', size: '1.2 MB', date: '2026-09-20', hash: '0x77ba1192e8812cba', tier: 'EVIDENCE', admissibility: 'Signed by Panchas' }
                  ]
                },
                {
                  id: 'c102-ppl',
                  name: '02_PERSONS_OF_INTEREST',
                  type: 'folder',
                  children: [
                    { id: 'p-1', name: 'Tariq "The Anchor" Merchant.dossier', type: 'file', fileType: 'Suspect Dossier', size: '3.8 MB', date: '2026-09-23', hash: '0x44fa1290e210cb99', tier: 'ANALYTICAL_INFERENCE', role: 'Syndicate Coordinator', threat: 'CRITICAL' },
                    { id: 'p-2', name: 'Rajesh Sharma.dossier', type: 'file', fileType: 'Suspect Dossier', size: '1.9 MB', date: '2026-09-22', hash: '0x33bc110098ab33ef', tier: 'OBSERVED_EVENT', role: 'Charter Broker', threat: 'HIGH' },
                    { id: 'p-3', name: 'Captain Al-Sayed.dossier', type: 'file', fileType: 'Subject Dossier', size: '1.1 MB', date: '2026-09-20', hash: '0x1299df0012ba88fa', tier: 'RAW_DATA', role: 'Vessel Master', threat: 'MEDIUM' }
                  ]
                },
                {
                  id: 'c102-shells',
                  name: '03_CORPORATE_SHELLS',
                  type: 'folder',
                  children: [
                    { id: 'org-1', name: 'Al-Barakah Logistics FZE_ROC.pdf', type: 'file', fileType: 'PDF Document', size: '4.2 MB', date: '2026-09-22', hash: '0xbb110992384aae12', tier: 'ANALYTICAL_INFERENCE', role: 'Shell Charterer (Dubai)' },
                    { id: 'org-2', name: 'Vikramaditya Shipping Lines_Articles.pdf', type: 'file', fileType: 'PDF Document', size: '2.8 MB', date: '2026-09-18', hash: '0xaa99823120cfda98', tier: 'EXTRACTED_ENTITY', role: 'Nominee Freight' }
                  ]
                },
                {
                  id: 'c102-veh',
                  name: '04_VEHICLES_VESSELS',
                  type: 'folder',
                  children: [
                    { id: 'veh-1', name: 'MV_Sagar_Ratna_IMO921882_DeckLog.pdf', type: 'file', fileType: 'PDF Document', size: '14.2 MB', date: '2026-09-21', hash: '0x55aa882910bc8765', tier: 'RAW_DATA', role: 'Bulk Cargo Carrier' }
                  ]
                },
                {
                  id: 'c102-fin',
                  name: '05_FINANCIAL_LEDGERS',
                  type: 'folder',
                  children: [
                    { id: 'fin-1', name: 'Hawala_Node_Account_88219_Mirror.xlsx', type: 'file', fileType: 'Excel Spreadsheet', size: '890 KB', date: '2026-09-23', hash: '0x11ee882098bcda44', tier: 'VERIFIED_RELATIONSHIP', role: '₹14.8 Cr Settlement' }
                  ]
                },
                {
                  id: 'c102-sig',
                  name: '06_DIGITAL_SIGINT',
                  type: 'folder',
                  children: [
                    { id: 'dig-1', name: 'Thuraya_Satellite_Voice_Bursts_SAT992.pcap', type: 'file', fileType: 'Network Packet Capture', size: '32.1 MB', date: '2026-09-23', hash: '0x77ee9910aa2345bc', tier: 'RAW_DATA', role: 'Voice Intercept Frames' }
                  ]
                }
              ]
            },
            {
              id: 'case-117',
              name: 'Case 117 — Operation Black Tide',
              type: 'case_folder',
              caseId: 'case-117',
              status: 'ACTIVE',
              genre: 'Corporate Fraud & AML',
              lead: 'Inspector K. Varma',
              children: [
                {
                  id: 'c117-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-117-1', name: 'SWIFT_Transfer_Log_FIU-99201.xml', type: 'file', fileType: 'XML Data', size: '1.8 MB', date: '2026-09-20', hash: '0x11b9a87c9920a711', tier: 'EVIDENCE' },
                    { id: 'f-117-2', name: 'Customs_Overinvoicing_Audit_SuratSEZ.pdf', type: 'file', fileType: 'PDF Document', size: '6.4 MB', date: '2026-09-18', hash: '0x22c8a910bf993211', tier: 'EVIDENCE' }
                  ]
                },
                {
                  id: 'c117-ppl',
                  name: '02_PERSONS_OF_INTEREST',
                  type: 'folder',
                  children: [
                    { id: 'p-101', name: 'Farhan "Ghost" Qureshi.dossier', type: 'file', fileType: 'Suspect Dossier', size: '2.7 MB', date: '2026-09-21', hash: '0x99cc441290bb34ff', tier: 'ANALYTICAL_INFERENCE', role: 'AML Smurfing Master' }
                  ]
                }
              ]
            },
            {
              id: 'case-143',
              name: 'Case 143 — Red Sand Syndicate',
              type: 'case_folder',
              caseId: 'case-143',
              status: 'ACTIVE',
              genre: 'Human Trafficking',
              lead: 'Special Agent D. Roy',
              children: [
                {
                  id: 'c143-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-143-1', name: 'Porbandar_Creek_Hydrophone_Log.wav', type: 'file', fileType: 'Audio Recording', size: '34.1 MB', date: '2026-09-19', hash: '0x77aa8921c33b91a0', tier: 'RAW_DATA' },
                    { id: 'f-143-2', name: 'Forged_Seafarer_Certificates.pdf', type: 'file', fileType: 'PDF Document', size: '4.9 MB', date: '2026-09-17', hash: '0x88bb7710ff2990aa', tier: 'EVIDENCE' }
                  ]
                }
              ]
            },
            {
              id: 'case-121',
              name: 'Case 121 — Diamond Bourse Vault Breach',
              type: 'case_folder',
              caseId: 'case-121',
              status: 'ACTIVE',
              genre: 'Armed Robbery & Heist',
              lead: 'Deputy Commissioner V. Mehta',
              children: [
                {
                  id: 'c121-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-121-1', name: 'Biometric_Turnstile_Override_BK-882.mp4', type: 'file', fileType: 'CCTV Video', size: '28.4 MB', date: '2026-09-22', hash: '0xee42d910a39981bc', tier: 'EVIDENCE' }
                  ]
                }
              ]
            },
            {
              id: 'case-135',
              name: 'Case 135 — Black Pearl Extortion',
              type: 'case_folder',
              caseId: 'case-135',
              status: 'ACTIVE',
              genre: 'Extortion & Blackmail',
              lead: 'ACP S. Kulkarni',
              children: [
                {
                  id: 'c135-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-135-1', name: 'VoIP_Recorded_Threat_Call_Spoof.wav', type: 'file', fileType: 'Audio Recording', size: '14.2 MB', date: '2026-09-21', hash: '0x55bb9911aa7722cc', tier: 'RAW_DATA' }
                  ]
                }
              ]
            },
            {
              id: 'case-155',
              name: 'Case 155 — Blue Horizon Sanctions Evasion',
              type: 'case_folder',
              caseId: 'case-155',
              status: 'ACTIVE',
              genre: 'Civil & Maritime Disputes',
              lead: 'Maritime Advocate N. Joshi',
              children: [
                {
                  id: 'c155-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-155-1', name: 'SAR_Satellite_Dark_Tanker_Track.tiff', type: 'file', fileType: 'TIFF Image', size: '38.4 MB', date: '2026-09-20', hash: '0x11ee88bb9922cc44', tier: 'RAW_DATA' }
                  ]
                }
              ]
            },
            {
              id: 'case-168',
              name: 'Case 168 — Darknet Thuraya Intercepts',
              type: 'case_folder',
              caseId: 'case-168',
              status: 'ACTIVE',
              genre: 'Cyber & SIGINT Infiltration',
              lead: 'Cyber Cell Lead T. Nair',
              children: [
                {
                  id: 'c168-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-168-1', name: 'Thuraya_Frequency_Packet_Burst_1544.15MHz.pcap', type: 'file', fileType: 'Network Packet Capture', size: '48.8 MB', date: '2026-09-23', hash: '0x99aa11ee8822ff44', tier: 'OBSERVED_EVENT' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'dir-done',
          name: 'Cases Done (Closed & Convicted)',
          type: 'folder',
          isSystem: true,
          status: 'DONE',
          children: [
            {
              id: 'case-108',
              name: 'Case 108 — Waterfront Contract Hit [DONE]',
              type: 'case_folder',
              caseId: 'case-108',
              status: 'DONE',
              genre: 'Homicide & Murder',
              lead: 'Sr. Inspector R. Deshmukh',
              resolution: 'Shooter Vikram Jadhav sentenced to life imprisonment by Bombay Sessions Court.',
              children: [
                {
                  id: 'c108-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-108-1', name: '9mm_Glock_Striation_Ballistics_Certified.pdf', type: 'file', fileType: 'Certified Ballistics', size: '5.2 MB', date: '2026-09-18', hash: '0xaa19c344919028ab', tier: 'EVIDENCE', admissibility: 'CFSL Forensic Certified' },
                    { id: 'f-108-2', name: 'Dock4_CCTV_Shooter_Facial_Recognition.png', type: 'file', fileType: 'PNG Image', size: '4.8 MB', date: '2026-09-17', hash: '0x7129ff44c01289ae', tier: 'EVIDENCE', admissibility: 'Court Admitted Exhibit 12' },
                    { id: 'f-108-3', name: 'Empty_Cartridge_Spot4_Panchnama.pdf', type: 'file', fileType: 'PDF Document', size: '1.8 MB', date: '2026-09-17', hash: '0x88ba11290bb34109', tier: 'EVIDENCE', admissibility: 'Signed by Panchas' }
                  ]
                },
                {
                  id: 'c108-jud',
                  name: '02_JUDICIAL_ORDERS_&_CONVICTIONS',
                  type: 'folder',
                  children: [
                    { id: 'jud-108-1', name: 'Sessions_Court_Final_Judgment_LifeSentence.pdf', type: 'file', fileType: 'Legal Judgment', size: '3.1 MB', date: '2026-09-22', hash: '0x5567bb19098231cd', tier: 'EVIDENCE', admissibility: 'Final Sealed Decree' },
                    { id: 'jud-108-2', name: 'Arthur_Road_Prison_Warrant_Remand_991.pdf', type: 'file', fileType: 'Judicial Warrant', size: '1.4 MB', date: '2026-09-22', hash: '0x66bb2299ff1188aa', tier: 'EVIDENCE', admissibility: 'Executed by Jailor' }
                  ]
                },
                {
                  id: 'c108-ast',
                  name: '03_CONFISCATED_ASSETS_PANCHNAMA',
                  type: 'folder',
                  children: [
                    { id: 'ast-108-1', name: 'Seized_9mm_Glock17_Muddamal_Receipt.pdf', type: 'file', fileType: 'PDF Document', size: '2.8 MB', date: '2026-09-19', hash: '0x99aa1188cc22ee77', tier: 'EVIDENCE' },
                    { id: 'ast-108-2', name: 'Yamaha_R15_Getaway_Vehicle_Forfeiture.pdf', type: 'file', fileType: 'PDF Document', size: '1.6 MB', date: '2026-09-19', hash: '0x22cc8811bb9933ee', tier: 'EVIDENCE' }
                  ]
                },
                {
                  id: 'c108-ppl',
                  name: '04_PERSONS_OF_INTEREST',
                  type: 'folder',
                  children: [
                    { id: 'p-301', name: 'Vikram "Blade" Jadhav.dossier', type: 'file', fileType: 'Convict Dossier', size: '4.2 MB', date: '2026-09-22', hash: '0x55aa9911bb22cc44', tier: 'EVIDENCE', role: 'Convicted Hitman (In Arthur Road Jail)' },
                    { id: 'p-302', name: 'Sunil Kulkarni (Deceased).dossier', type: 'file', fileType: 'Victim Dossier', size: '2.1 MB', date: '2026-09-18', hash: '0x11ee8822bb9933cc', tier: 'OBSERVED_EVENT', role: 'Customs Informant / Victim' }
                  ]
                }
              ]
            },
            {
              id: 'case-094',
              name: 'Case 094 — Kandla Customs Bribery [DONE]',
              type: 'case_folder',
              caseId: 'case-094',
              status: 'DONE',
              genre: 'Corruption & Bribery Racket',
              lead: 'CBI Special Cell SP V. Raman',
              resolution: '₹1.2 Cr recovered from safe deposit locker. Formal chargesheet admitted by Special CBI Court.',
              children: [
                {
                  id: 'c094-evd',
                  name: '01_EVIDENCE_VAULT',
                  type: 'folder',
                  children: [
                    { id: 'f-094-1', name: 'CBI_Phenolphthalein_Trap_Panchnama.pdf', type: 'file', fileType: 'Trap Memo', size: '8.4 MB', date: '2026-08-30', hash: '0x9910aa34512999cc', tier: 'EVIDENCE' },
                    { id: 'f-094-2', name: 'Safe_Deposit_Locker_Cash_Counting.mp4', type: 'file', fileType: 'CCTV Video', size: '36.2 MB', date: '2026-09-02', hash: '0x33bb8811ee99aa22', tier: 'EVIDENCE' }
                  ]
                },
                {
                  id: 'c094-jud',
                  name: '02_SPECIAL_CBI_CHARGESHEET',
                  type: 'folder',
                  children: [
                    { id: 'jud-094-1', name: 'Special_CBI_Court_Cognizance_Order.pdf', type: 'file', fileType: 'Judicial Order', size: '2.8 MB', date: '2026-09-12', hash: '0x11ee8822bb99aa33', tier: 'EVIDENCE' }
                  ]
                }
              ]
            },
            {
              id: 'case-081',
              name: 'Case 081 — Nariman Shell Wire Laundering [DONE]',
              type: 'case_folder',
              caseId: 'case-081',
              status: 'DONE',
              genre: 'Corporate AML',
              lead: 'ED Special Director M. Rao',
              resolution: '₹34 Cr in offshore shell bank accounts confiscated under PMLA Section 8.',
              children: [
                {
                  id: 'c081-evd',
                  name: '01_FORFEITURE_ORDERS',
                  type: 'folder',
                  children: [
                    { id: 'f-081-1', name: 'Appellate_Tribunal_Asset_Forfeiture_Order.pdf', type: 'file', fileType: 'Judicial Decree', size: '4.2 MB', date: '2026-08-14', hash: '0x3344ee190029bbfa', tier: 'EVIDENCE' },
                    { id: 'f-081-2', name: '₹34_Cr_Treasury_Deposit_Receipt.pdf', type: 'file', fileType: 'Treasury Receipt', size: '1.4 MB', date: '2026-08-20', hash: '0x77ee9911bb22cc44', tier: 'EVIDENCE' }
                  ]
                }
              ]
            },
            {
              id: 'case-062',
              name: 'Case 062 — Hawala Golden Falcon [DONE]',
              type: 'case_folder',
              caseId: 'case-062',
              status: 'DONE',
              genre: 'Foreign Exchange Smuggling',
              lead: 'DRI Additional Director G. Sen',
              resolution: '18 kg smuggled gold bullion seized. ₹12.5 Cr compounding penalty deposited.',
              children: [
                {
                  id: 'c062-evd',
                  name: '01_SEIZURE_&_ASSAY',
                  type: 'folder',
                  children: [
                    { id: 'f-062-1', name: 'Gold_Bullion_Assay_Report_India_Govt_Mint.pdf', type: 'file', fileType: 'Assay Certificate', size: '3.2 MB', date: '2026-07-15', hash: '0x44bb1199ee22aa88', tier: 'EVIDENCE' },
                    { id: 'f-062-2', name: 'Airport_XRay_Cylinder_Radiograph.png', type: 'file', fileType: 'X-Ray Image', size: '6.4 MB', date: '2026-07-14', hash: '0x88cc2299ff11bb33', tier: 'EVIDENCE' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'dir-shared',
          name: 'Shared Cross-Case Repositories',
          type: 'folder',
          isSystem: true,
          children: [
            { id: 'sh-1', name: 'Hawala_Common_Mirror_Ledger_2026.xlsx', type: 'file', fileType: 'Excel Spreadsheet', size: '4.8 MB', date: '2026-09-22', hash: '0x33bb1188cc22ee77', tier: 'EVIDENCE' },
            { id: 'sh-2', name: 'Arabian_Gulf_Dhow_Radar_Tracks.kml', type: 'file', fileType: 'KML Map Track', size: '12.4 MB', date: '2026-09-21', hash: '0x99aa1188bb22cc44', tier: 'RAW_DATA' }
          ]
        },
        {
          id: 'dir-legal',
          name: 'Legal Charters & Precedents',
          type: 'folder',
          isSystem: true,
          children: [
            { id: 'leg-1', name: 'Bharatiya_Nagarik_Suraksha_Sannhita_Sec63_SOP.pdf', type: 'file', fileType: 'PDF Document', size: '1.8 MB', date: '2026-08-01', hash: '0x11ee8822bb9933cc', tier: 'EVIDENCE' },
            { id: 'leg-2', name: 'NDPS_Act_1985_Forensic_Chain_Of_Custody.pdf', type: 'file', fileType: 'PDF Document', size: '2.4 MB', date: '2026-07-10', hash: '0x55aa1199ee22bb44', tier: 'EVIDENCE' }
          ]
        }
      ]
    }
  ]
};

export default function TotalFileExplorer({ onClose } = {}) {
  const { setActiveCaseId, setActiveNavSection, addNodeToCanvas, openWorkspace, workspaces } = useWorkspace();
  
  // File system state
  const [fs, setFs] = useState(INITIAL_DIRECTORY_TREE);
  
  // Navigation stack: array of folder IDs or paths
  // E.g. ['root', 'drive-c', 'dir-done', 'case-108']
  const [pathStack, setPathStack] = useState(['root', 'drive-c']);
  const [history, setHistory] = useState([['root', 'drive-c']]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selection & View mode
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [viewMode, setViewMode] = useState('icons'); // 'icons' | 'details'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inline renaming state
  const [renamingId, setRenamingId] = useState(null);
  const [renameText, setRenameText] = useState('');

  // Right-Click Context Menu State
  // { x: number, y: number, visible: boolean, type: 'background' | 'item', item: object | null }
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: 'background',
    item: null
  });

  // Windows Properties Dialog State
  const [propertiesItem, setPropertiesItem] = useState(null);

  // File Preview Modal State
  const [previewFile, setPreviewFile] = useState(null);

  // Expanded Tree Nodes in Left Sidebar
  const [expandedNodes, setExpandedNodes] = useState({
    'root': true,
    'drive-c': true,
    'dir-active': true,
    'dir-done': true
  });

  // Sort settings
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'date' | 'size' | 'type'

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState(null);

  // Find node helper
  const findNodeById = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Current folder node
  const currentFolderId = pathStack[pathStack.length - 1];
  const currentFolder = useMemo(() => {
    return findNodeById(fs, currentFolderId) || fs.children[0];
  }, [fs, currentFolderId]);

  // Current path nodes for breadcrumbs
  const breadcrumbNodes = useMemo(() => {
    return pathStack.map(id => findNodeById(fs, id)).filter(Boolean);
  }, [fs, pathStack]);

  // Navigate to a folder ID
  const navigateTo = (folderId) => {
    if (folderId === currentFolderId) return;
    const newStack = [];
    
    // Find path from root to folderId
    const buildPath = (node, targetId, currentTrail = []) => {
      if (node.id === targetId) {
        newStack.push(...currentTrail, node.id);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (buildPath(child, targetId, [...currentTrail, node.id])) {
            return true;
          }
        }
      }
      return false;
    };

    buildPath(fs, folderId);

    if (newStack.length > 0) {
      setPathStack(newStack);
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newStack);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setSelectedItemId(null);
      setContextMenu({ visible: false, x: 0, y: 0, type: 'background', item: null });
    }
  };

  // Go Back
  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setPathStack(history[prevIndex]);
      setSelectedItemId(null);
    }
  };

  // Go Forward
  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setPathStack(history[nextIndex]);
      setSelectedItemId(null);
    }
  };

  // Go Up one directory
  const handleGoUp = () => {
    if (pathStack.length > 1) {
      const newStack = pathStack.slice(0, pathStack.length - 1);
      setPathStack(newStack);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newStack);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setSelectedItemId(null);
    }
  };

  // Toggle tree node expansion
  const toggleNodeExpansion = (nodeId, e) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleWindowClick = () => {
      if (contextMenu.visible) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (contextMenu.visible) {
          setContextMenu(prev => ({ ...prev, visible: false }));
        } else if (previewFile) {
          setPreviewFile(null);
        } else if (propertiesItem) {
          setPropertiesItem(null);
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('click', handleWindowClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible, previewFile, propertiesItem, onClose]);

  // Right-Click Handler on Canvas Background
  const handleCanvasContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'background',
      item: null
    });
  };

  // Right-Click Handler on an Item
  const handleItemContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(item.id);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'item',
      item
    });
  };

  // ── File System Mutations ───────────────────────────────────────────────────

  // Right-Click -> "New Folder"
  const handleCreateNewFolder = () => {
    const newId = `folder-${Date.now()}`;
    const newFolderObj = {
      id: newId,
      name: 'New folder',
      type: 'folder',
      children: []
    };

    const addFolderRecursive = (node) => {
      if (node.id === currentFolderId) {
        return {
          ...node,
          children: [...(node.children || []), newFolderObj]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addFolderRecursive)
        };
      }
      return node;
    };

    setFs(prev => addFolderRecursive(prev));
    setContextMenu(prev => ({ ...prev, visible: false }));
    setSelectedItemId(newId);
    
    // Immediately enter rename mode
    setRenamingId(newId);
    setRenameText('New folder');
  };

  // Right-Click -> "New Text Document"
  const handleCreateNewFile = () => {
    const newId = `file-${Date.now()}`;
    const newFileObj = {
      id: newId,
      name: 'New Text Document.txt',
      type: 'file',
      fileType: 'Text Document',
      size: '0 KB',
      date: new Date().toISOString().split('T')[0],
      hash: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      tier: 'RAW_DATA'
    };

    const addFileRecursive = (node) => {
      if (node.id === currentFolderId) {
        return {
          ...node,
          children: [...(node.children || []), newFileObj]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addFileRecursive)
        };
      }
      return node;
    };

    setFs(prev => addFileRecursive(prev));
    setContextMenu(prev => ({ ...prev, visible: false }));
    setSelectedItemId(newId);
    
    setRenamingId(newId);
    setRenameText('New Text Document.txt');
  };

  // Rename Confirmation
  const handleConfirmRename = () => {
    if (!renamingId || !renameText.trim()) {
      setRenamingId(null);
      return;
    }

    const renameRecursive = (node) => {
      if (node.id === renamingId) {
        return { ...node, name: renameText.trim() };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(renameRecursive)
        };
      }
      return node;
    };

    setFs(prev => renameRecursive(prev));
    setRenamingId(null);
  };

  // Delete Item
  const handleDeleteItem = (targetItem) => {
    const itemToDelete = targetItem || contextMenu.item;
    if (!itemToDelete) return;

    const deleteRecursive = (node) => {
      if (node.id === currentFolderId && node.children) {
        return {
          ...node,
          children: node.children.filter(c => c.id !== itemToDelete.id)
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(deleteRecursive)
        };
      }
      return node;
    };

    setFs(prev => deleteRecursive(prev));
    setSelectedItemId(null);
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Pin item to Investigation Workspace Canvas
  const handlePinToCanvas = (item) => {
    const parentCase = breadcrumbNodes.find(n => n.type === 'case_folder') || { name: 'Bureau Vault' };
    
    addNodeToCanvas({
      id: item.id || `node-${Date.now()}`,
      name: item.name,
      type: item.fileType || item.type || 'Case Exhibit',
      role: item.role || item.fileType || 'Evidence File',
      threat: item.threat || 'HIGH',
      provenance: item.tier || 'EVIDENCE',
      details: `File from ${parentCase.name}. SHA-256: ${item.hash || 'Verified Sealed'} (${item.size || 'Artifact'}).`
    });

    if (parentCase.caseId) {
      setActiveCaseId(parentCase.caseId);
      const matchingWs = (workspaces || []).find(w => w.caseId === parentCase.caseId);
      if (matchingWs) {
        openWorkspace(matchingWs.id);
      } else if (workspaces && workspaces.length > 0) {
        openWorkspace(workspaces[0].id);
      }
    } else if (workspaces && workspaces.length > 0) {
      openWorkspace(workspaces[0].id);
    }

    setActiveNavSection('workspace');
    onClose();
  };

  // Double click on folder or file
  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder' || item.type === 'case_folder' || item.type === 'drive') {
      navigateTo(item.id);
    } else {
      // It's a file: open preview
      setPreviewFile(item);
    }
  };

  // Current folder items with search & sort
  const currentItems = useMemo(() => {
    if (!currentFolder || !currentFolder.children) return [];
    let items = [...currentFolder.children];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.fileType && i.fileType.toLowerCase().includes(q)));
    }

    // Sort
    items.sort((a, b) => {
      // Folders always first like Windows
      const aIsFolder = a.type !== 'file';
      const bIsFolder = b.type !== 'file';
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;

      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'type') return (a.fileType || a.type).localeCompare(b.fileType || b.type);
      return 0;
    });

    return items;
  }, [currentFolder, searchQuery, sortBy]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return currentItems.find(i => i.id === selectedItemId);
  }, [currentItems, selectedItemId]);

  // Render Tree Node in left sidebar
  const renderTreeNode = (node) => {
    if (node.type === 'file') return null;
    const isExpanded = expandedNodes[node.id];
    const isSelected = currentFolderId === node.id;
    const hasChildren = node.children && node.children.some(c => c.type !== 'file');

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div
          className={`tree-node-item ${isSelected ? 'selected' : ''}`}
          onClick={() => navigateTo(node.id)}
        >
          {hasChildren ? (
            <span
              className="tree-expand-arrow"
              onClick={(e) => toggleNodeExpansion(node.id, e)}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          ) : (
            <span className="tree-expand-spacer" />
          )}

          {node.type === 'drive' ? (
            <HardDrive size={14} className="tree-icon drive-icon" />
          ) : node.type === 'root' ? (
            <Monitor size={14} className="tree-icon pc-icon" />
          ) : node.status === 'DONE' ? (
            <Folder size={14} className="tree-icon done-folder-icon" />
          ) : (
            <Folder size={14} className="tree-icon yellow-folder-icon" />
          )}

          <span className="tree-node-name">{node.name}</span>
          {node.status === 'DONE' && <span className="tree-done-tag">DONE</span>}
        </div>

        {isExpanded && node.children && (
          <div className="tree-node-children">
            {node.children.map(renderTreeNode)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="win-explorer-window" onClick={e => e.stopPropagation()}>
      
      {/* ── 1. WINDOWS TITLE BAR ────────────────────────────────────── */}
      <div className="win-titlebar">
          <div className="win-titlebar-left">
            <Folder size={14} className="win-titlebar-icon yellow-folder-icon" />
            <span className="win-titlebar-text">
              {currentFolder.name} - File Explorer
            </span>
          </div>

          <div className="win-titlebar-right">
            <button className="win-control-btn" title="Minimize">
              <span>—</span>
            </button>
            <button className="win-control-btn" title="Maximize">
              <span className="btn-square">▢</span>
            </button>
            <button className="win-control-btn win-btn-close" onClick={() => onClose && onClose()} title="Close (ESC)">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── 2. WINDOWS 11 COMMAND BAR (RIBBON) ──────────────────────── */}
        <div className="win-command-bar">
          {/* New Button with Dropdown */}
          <div className="win-cmd-group">
            <button
              className="win-cmd-btn btn-new"
              onClick={handleCreateNewFolder}
              title="Create New Folder (or Right-Click on canvas)"
            >
              <Plus size={14} className="cmd-ico text-blue" />
              <span>New</span>
              <ChevronDown size={11} className="cmd-dropdown-arrow" />
            </button>
          </div>

          <div className="win-cmd-separator" />

          {/* Action Icons: Cut, Copy, Rename, Delete, Pin */}
          <div className="win-cmd-group">
            <button
              className="win-cmd-icon-btn"
              disabled={!selectedItem}
              onClick={() => { setClipboard(selectedItem); }}
              title="Cut (Ctrl+X)"
            >
              <Scissors size={14} />
            </button>
            <button
              className="win-cmd-icon-btn"
              disabled={!selectedItem}
              onClick={() => { setClipboard(selectedItem); }}
              title="Copy (Ctrl+C)"
            >
              <Copy size={14} />
            </button>
            <button
              className="win-cmd-icon-btn"
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  setRenamingId(selectedItem.id);
                  setRenameText(selectedItem.name);
                }
              }}
              title="Rename (F2)"
            >
              <Edit3 size={14} />
            </button>
            <button
              className="win-cmd-icon-btn"
              disabled={!selectedItem}
              onClick={() => handleDeleteItem(selectedItem)}
              title="Delete (Delete)"
            >
              <Trash2 size={14} />
            </button>
            <button
              className="win-cmd-btn btn-pin-cmd"
              disabled={!selectedItem}
              onClick={() => selectedItem && handlePinToCanvas(selectedItem)}
              title="Pin to Workspace Investigation Canvas"
            >
              <Star size={13} className="text-amber" />
              <span>Pin to Canvas</span>
            </button>
          </div>

          <div className="win-cmd-separator" />

          {/* Sort & View Dropdowns */}
          <div className="win-cmd-group ml-auto">
            <button
              className="win-cmd-btn"
              onClick={() => setSortBy(prev => prev === 'name' ? 'date' : prev === 'date' ? 'size' : 'name')}
              title={`Sort by: ${sortBy.toUpperCase()}`}
            >
              <ArrowUp size={13} />
              <span>Sort: {sortBy.toUpperCase()}</span>
            </button>

            <button
              className="win-cmd-btn"
              onClick={() => setViewMode(prev => prev === 'icons' ? 'details' : 'icons')}
              title="Switch between Icons and Details view"
            >
              {viewMode === 'icons' ? <LayoutGrid size={14} /> : <List size={14} />}
              <span>View</span>
            </button>

            <button
              className="win-cmd-icon-btn"
              disabled={!selectedItem}
              onClick={() => selectedItem && setPropertiesItem(selectedItem)}
              title="Properties (Alt+Enter)"
            >
              <Info size={14} />
            </button>
          </div>
        </div>

        {/* ── 3. WINDOWS NAVIGATION & ADDRESS BAR ─────────────────────── */}
        <div className="win-address-bar-strip">
          {/* Back, Forward, Up, Refresh Buttons */}
          <div className="nav-arrows-group">
            <button
              className="win-nav-btn"
              onClick={handleGoBack}
              disabled={historyIndex <= 0}
              title="Back (Alt+Left Arrow)"
            >
              <ArrowLeft size={13} />
            </button>
            <button
              className="win-nav-btn"
              onClick={handleGoForward}
              disabled={historyIndex >= history.length - 1}
              title="Forward (Alt+Right Arrow)"
            >
              <ArrowRight size={13} />
            </button>
            <button
              className="win-nav-btn"
              onClick={handleGoUp}
              disabled={pathStack.length <= 1}
              title="Up to parent folder (Alt+Up Arrow)"
            >
              <ArrowUp size={13} />
            </button>
            <button
              className="win-nav-btn"
              onClick={() => {}}
              title="Refresh (F5)"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Windows Breadcrumb Address Capsule */}
          <div className="win-address-capsule">
            <HardDrive size={13} className="address-drive-ico text-blue" />
            <div className="address-breadcrumbs-trail">
              {breadcrumbNodes.map((node, idx) => (
                <div key={node.id} className="crumb-segment-wrap">
                  {idx > 0 && <ChevronRight size={11} className="crumb-chevron" />}
                  <span
                    className="crumb-segment-btn"
                    onClick={() => navigateTo(node.id)}
                  >
                    {node.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Windows Search Box */}
          <div className="win-search-box">
            <Search size={13} className="search-box-ico" />
            <input
              type="text"
              placeholder={`Search ${currentFolder.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="win-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* ── 4. MAIN BODY (LEFT TREE SIDEBAR + CENTER FILES CANVAS) ──── */}
        <div className="win-explorer-body">
          
          {/* ══ LEFT NAVIGATION TREE PANE ══════════════════════════════ */}
          <aside className="win-tree-sidebar">
            {/* Quick Access Section */}
            <div className="sidebar-tree-section">
              <span className="section-label">Quick access</span>
              <div className="quick-access-item" onClick={() => navigateTo('dir-active')}>
                <Star size={13} className="quick-ico text-amber" />
                <span>Active Investigations</span>
              </div>
              <div className="quick-access-item" onClick={() => navigateTo('dir-done')}>
                <CheckCircle2 size={13} className="quick-ico text-green" />
                <span>Cases Done (Closed)</span>
                <span className="badge-done-count">4</span>
              </div>
              <div className="quick-access-item" onClick={() => navigateTo('case-108')}>
                <Folder size={13} className="quick-ico text-done" />
                <span>Case 108 — Waterfront Hit</span>
              </div>
              <div className="quick-access-item" onClick={() => navigateTo('case-102')}>
                <Folder size={13} className="quick-ico text-amber" />
                <span>Case 102 — Silver Dune</span>
              </div>
            </div>

            <div className="sidebar-divider" />

            {/* This PC Directory Tree */}
            <div className="sidebar-tree-section">
              <span className="section-label">This PC</span>
              {renderTreeNode(fs)}
            </div>
          </aside>

          {/* ══ CENTER FILES & FOLDERS CANVAS ══════════════════════════ */}
          <main
            className="win-center-canvas"
            onContextMenu={handleCanvasContextMenu}
            onClick={() => setSelectedItemId(null)}
          >
            {/* Folder Header Banner if Case Folder */}
            {currentFolder.type === 'case_folder' && (
              <div className={`case-header-strip ${currentFolder.status === 'DONE' ? 'strip-done' : 'strip-active'}`}>
                <div className="case-strip-info">
                  <span className="case-strip-badge">
                    {currentFolder.status === 'DONE' ? 'CASE DONE · CONVICTION RECORDED' : 'UNDER ACTIVE INVESTIGATION'}
                  </span>
                  <h4>{currentFolder.name}</h4>
                  <p>{currentFolder.resolution || `Lead Investigator: ${currentFolder.lead || 'Bureau Special Cell'} · ${currentFolder.genre}`}</p>
                </div>
                <button
                  className="btn-case-workspace font-mono"
                  onClick={() => currentFolder.caseId && handlePinToCanvas({ name: currentFolder.name, id: currentFolder.id })}
                >
                  <ExternalLink size={12} /> Open in Workspace
                </button>
              </div>
            )}

            {/* Empty Folder Notice */}
            {currentItems.length === 0 && (
              <div className="win-empty-folder-box">
                <Folder size={48} className="empty-folder-ico text-muted" />
                <p>This folder is empty.</p>
                <span className="empty-hint">Right-click anywhere to create a New Folder or Document.</span>
              </div>
            )}

            {/* ICONS VIEW MODE (Default Windows Grid) */}
            {viewMode === 'icons' && (
              <div className="win-items-grid">
                {currentItems.map(item => {
                  const isSelected = selectedItemId === item.id;
                  const isFolder = item.type !== 'file';
                  const isRenaming = renamingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`win-item-card ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleItemDoubleClick(item);
                      }}
                      onContextMenu={(e) => handleItemContextMenu(e, item)}
                    >
                      {/* Icon */}
                      <div className="win-item-icon-wrap">
                        {isFolder ? (
                          item.status === 'DONE' ? (
                            <Folder size={46} className="item-svg done-folder-icon" />
                          ) : (
                            <Folder size={46} className="item-svg yellow-folder-icon" />
                          )
                        ) : item.name.endsWith('.pdf') ? (
                          <FileText size={42} className="item-svg text-red-doc" />
                        ) : item.name.endsWith('.mp4') ? (
                          <FileCode size={42} className="item-svg text-purple" />
                        ) : item.name.endsWith('.csv') || item.name.endsWith('.xlsx') ? (
                          <DollarSign size={42} className="item-svg text-green" />
                        ) : (
                          <FileText size={42} className="item-svg text-gray-doc" />
                        )}

                        {item.status === 'DONE' && (
                          <CheckCircle2 size={14} className="win-item-done-badge" />
                        )}
                      </div>

                      {/* Name / Inline Rename Input */}
                      {isRenaming ? (
                        <input
                          type="text"
                          value={renameText}
                          onChange={e => setRenameText(e.target.value)}
                          onBlur={handleConfirmRename}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleConfirmRename();
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          autoFocus
                          className="win-inline-rename-input"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="win-item-name" title={item.name}>
                          {item.name}
                        </span>
                      )}

                      {!isFolder && item.size && (
                        <span className="win-item-sub font-mono">{item.size}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* DETAILS VIEW MODE (Windows Details Table) */}
            {viewMode === 'details' && (
              <div className="win-details-table-wrap">
                <table className="win-details-table">
                  <thead>
                    <tr>
                      <th onClick={() => setSortBy('name')}>Name {sortBy === 'name' && '▲'}</th>
                      <th onClick={() => setSortBy('date')}>Date modified {sortBy === 'date' && '▲'}</th>
                      <th onClick={() => setSortBy('type')}>Type {sortBy === 'type' && '▲'}</th>
                      <th onClick={() => setSortBy('size')}>Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(item => {
                      const isSelected = selectedItemId === item.id;
                      const isFolder = item.type !== 'file';
                      const isRenaming = renamingId === item.id;

                      return (
                        <tr
                          key={item.id}
                          className={isSelected ? 'selected-row' : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemId(item.id);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleItemDoubleClick(item);
                          }}
                          onContextMenu={(e) => handleItemContextMenu(e, item)}
                        >
                          <td className="table-name-cell">
                            {isFolder ? (
                              <Folder size={16} className={item.status === 'DONE' ? 'done-folder-icon' : 'yellow-folder-icon'} />
                            ) : (
                              <FileText size={16} className="text-gray-doc" />
                            )}
                            
                            {isRenaming ? (
                              <input
                                type="text"
                                value={renameText}
                                onChange={e => setRenameText(e.target.value)}
                                onBlur={handleConfirmRename}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleConfirmRename();
                                  if (e.key === 'Escape') setRenamingId(null);
                                }}
                                autoFocus
                                className="win-inline-rename-input"
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <span>{item.name}</span>
                            )}
                          </td>
                          <td className="font-mono text-muted">{item.date || '2026-09-22'}</td>
                          <td className="text-muted">{item.fileType || (isFolder ? 'File folder' : 'Document')}</td>
                          <td className="font-mono text-muted">{item.size || (isFolder ? '' : '12 KB')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>

        {/* ── 5. WINDOWS BOTTOM STATUS BAR ───────────────────────────── */}
        <div className="win-statusbar">
          <div className="statusbar-left font-mono">
            <span>{currentItems.length} items</span>
            {selectedItem && (
              <>
                <span className="statusbar-sep">|</span>
                <span>1 item selected</span>
                {selectedItem.size && <span> ({selectedItem.size})</span>}
              </>
            )}
          </div>

          <div className="statusbar-right">
            <button
              className={`statusbar-view-btn ${viewMode === 'details' ? 'active' : ''}`}
              onClick={() => setViewMode('details')}
              title="Details view"
            >
              <List size={13} />
            </button>
            <button
              className={`statusbar-view-btn ${viewMode === 'icons' ? 'active' : ''}`}
              onClick={() => setViewMode('icons')}
              title="Icons view"
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>

        {/* ── 6. RIGHT-CLICK WINDOWS CONTEXT MENU ─────────────────────── */}
        {contextMenu.visible && (
          <div
            className="win-context-menu"
            style={{
              top: Math.min(contextMenu.y, window.innerHeight - 280),
              left: Math.min(contextMenu.x, window.innerWidth - 240)
            }}
            onClick={e => e.stopPropagation()}
          >
            {contextMenu.type === 'background' ? (
              /* BACKGROUND CONTEXT MENU */
              <>
                <div
                  className="ctx-menu-item"
                  onClick={handleCreateNewFolder}
                >
                  <FolderPlus size={14} className="ctx-icon yellow-folder-icon" />
                  <span>New folder</span>
                  <span className="ctx-shortcut font-mono">Ctrl+Shift+N</span>
                </div>
                <div
                  className="ctx-menu-item"
                  onClick={handleCreateNewFile}
                >
                  <FileText size={14} className="ctx-icon text-gray-doc" />
                  <span>New Text Document</span>
                </div>

                <div className="ctx-divider" />

                <div
                  className="ctx-menu-item"
                  onClick={() => {
                    setViewMode(prev => prev === 'icons' ? 'details' : 'icons');
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <LayoutGrid size={14} className="ctx-icon" />
                  <span>View: {viewMode === 'icons' ? 'Details' : 'Icons'}</span>
                </div>

                <div
                  className="ctx-menu-item"
                  onClick={() => {
                    setSortBy(prev => prev === 'name' ? 'date' : 'name');
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <ArrowUp size={14} className="ctx-icon" />
                  <span>Sort by Name</span>
                </div>

                <div
                  className="ctx-menu-item"
                  onClick={() => setContextMenu(prev => ({ ...prev, visible: false }))}
                >
                  <RefreshCw size={14} className="ctx-icon" />
                  <span>Refresh</span>
                  <span className="ctx-shortcut font-mono">F5</span>
                </div>

                <div className="ctx-divider" />

                <div
                  className="ctx-menu-item"
                  onClick={() => {
                    setPropertiesItem(currentFolder);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Info size={14} className="ctx-icon" />
                  <span>Properties</span>
                </div>
              </>
            ) : (
              /* ITEM (FOLDER OR FILE) CONTEXT MENU */
              <>
                <div
                  className="ctx-menu-item font-bold"
                  onClick={() => {
                    if (contextMenu.item) handleItemDoubleClick(contextMenu.item);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Eye size={14} className="ctx-icon" />
                  <span>Open</span>
                  <span className="ctx-shortcut font-mono">Enter</span>
                </div>

                <div
                  className="ctx-menu-item ctx-highlight-pin"
                  onClick={() => {
                    if (contextMenu.item) handlePinToCanvas(contextMenu.item);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Star size={14} className="ctx-icon text-amber" />
                  <span>Pin to Workspace Canvas</span>
                </div>

                <div className="ctx-divider" />

                <div
                  className="ctx-menu-item"
                  onClick={() => {
                    if (contextMenu.item) {
                      setRenamingId(contextMenu.item.id);
                      setRenameText(contextMenu.item.name);
                    }
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Edit3 size={14} className="ctx-icon" />
                  <span>Rename</span>
                  <span className="ctx-shortcut font-mono">F2</span>
                </div>

                <div
                  className="ctx-menu-item"
                  onClick={() => {
                    if (contextMenu.item) setClipboard(contextMenu.item);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Copy size={14} className="ctx-icon" />
                  <span>Copy</span>
                  <span className="ctx-shortcut font-mono">Ctrl+C</span>
                </div>

                <div
                  className="ctx-menu-item text-danger"
                  onClick={() => handleDeleteItem(contextMenu.item)}
                >
                  <Trash2 size={14} className="ctx-icon text-danger" />
                  <span>Delete</span>
                  <span className="ctx-shortcut font-mono">Del</span>
                </div>

                <div className="ctx-divider" />

                <div
                  className="ctx-menu-item"
                  onClick={() => {
                    setPropertiesItem(contextMenu.item);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Info size={14} className="ctx-icon" />
                  <span>Properties</span>
                  <span className="ctx-shortcut font-mono">Alt+Enter</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 7. WINDOWS PROPERTIES DIALOG MODAL ───────────────────────── */}
        {propertiesItem && (
          <div className="win-properties-overlay" onClick={() => setPropertiesItem(null)}>
            <div className="win-properties-dialog" onClick={e => e.stopPropagation()}>
              <div className="win-dialog-titlebar">
                <span>{propertiesItem.name} Properties</span>
                <button className="dialog-close-btn" onClick={() => setPropertiesItem(null)}>
                  <X size={13} />
                </button>
              </div>

              <div className="win-dialog-tabs">
                <span className="tab-item active">General</span>
                <span className="tab-item">Security</span>
                <span className="tab-item">Details</span>
              </div>

              <div className="win-dialog-body">
                <div className="dialog-header-row">
                  {propertiesItem.type === 'file' ? (
                    <FileText size={36} className="text-gray-doc" />
                  ) : (
                    <Folder size={36} className="yellow-folder-icon" />
                  )}
                  <div className="dialog-header-name">
                    <span className="name-text">{propertiesItem.name}</span>
                    <span className="type-sub font-mono">{propertiesItem.fileType || 'File folder'}</span>
                  </div>
                </div>

                <div className="dialog-divider" />

                <div className="dialog-meta-table font-mono">
                  <div className="meta-row">
                    <span className="meta-key">Type of file:</span>
                    <span className="meta-val">{propertiesItem.fileType || 'File folder (.dir)'}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Location:</span>
                    <span className="meta-val">C:\Bureau Vault\{currentFolder.name}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Size:</span>
                    <span className="meta-val">{propertiesItem.size || '32.4 KB (33,177 bytes)'}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">Created:</span>
                    <span className="meta-val">{propertiesItem.date || 'September 22, 2026, 14:10:02'}</span>
                  </div>
                  {propertiesItem.hash && (
                    <div className="meta-row">
                      <span className="meta-key">SHA-256 Checksum:</span>
                      <span className="meta-val text-blue">{propertiesItem.hash}</span>
                    </div>
                  )}
                  {propertiesItem.admissibility && (
                    <div className="meta-row">
                      <span className="meta-key">Legal Admissibility:</span>
                      <span className="meta-val text-green">{propertiesItem.admissibility}</span>
                    </div>
                  )}
                </div>

                <div className="dialog-divider" />

                <div className="dialog-attributes-row">
                  <span className="meta-key">Attributes:</span>
                  <label className="attribute-checkbox">
                    <input type="checkbox" defaultChecked readOnly /> Read-only
                  </label>
                  <label className="attribute-checkbox">
                    <input type="checkbox" readOnly /> Hidden
                  </label>
                </div>
              </div>

              <div className="win-dialog-footer">
                <button className="win-btn-dialog" onClick={() => setPropertiesItem(null)}>OK</button>
                <button className="win-btn-dialog" onClick={() => setPropertiesItem(null)}>Cancel</button>
                <button className="win-btn-dialog" onClick={() => setPropertiesItem(null)}>Apply</button>
              </div>
            </div>
          </div>
        )}

        {/* ── 8. DOCUMENT PREVIEW MODAL ────────────────────────────────── */}
        {previewFile && (
          <div className="file-preview-overlay" onClick={() => setPreviewFile(null)}>
            <div className="file-preview-modal" onClick={e => e.stopPropagation()}>
              <div className="preview-modal-header">
                <div className="preview-header-left">
                  <FileText size={16} className="text-blue" />
                  <h4>{previewFile.name}</h4>
                  <span className="preview-status-pill font-mono">SEALED ADMISSIBLE EVIDENCE</span>
                </div>
                <div className="preview-header-right">
                  <button
                    className="btn btn-primary btn-sm font-mono"
                    onClick={() => {
                      handlePinToCanvas(previewFile);
                      setPreviewFile(null);
                    }}
                  >
                    <Star size={11} /> Pin to Canvas
                  </button>
                  <button className="preview-close-btn" onClick={() => setPreviewFile(null)}>
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="preview-modal-body">
                <div className="document-sheet">
                  <div className="doc-header-seal">
                    <div className="doc-seal-badge">CENTRAL INTELLIGENCE &amp; EVIDENCE ARCHIVE</div>
                    <div className="doc-stamp-certified">BNSS SEC 63 CERTIFIED</div>
                  </div>

                  <div className="doc-body-text font-mono">
                    <div className="doc-meta-grid">
                      <div><strong>FILE NAME:</strong> {previewFile.name}</div>
                      <div><strong>DATE RECORDED:</strong> {previewFile.date || '2026-09-22'}</div>
                      <div><strong>FILE SIZE:</strong> {previewFile.size}</div>
                      <div><strong>EPISTEMIC TIER:</strong> {previewFile.tier || 'EVIDENCE'}</div>
                    </div>

                    <hr className="doc-divider" />

                    <div className="doc-prose">
                      <p><strong>EVIDENTIARY PANCHNAMA SUMMARY:</strong></p>
                      <p>
                        Seized exhibit admitted to Bureau digital repository. 
                        Hash verification intact under SHA-256 standard: <code>{previewFile.hash || '0x88f29cb19c4d32e1'}</code>.
                      </p>
                      {previewFile.admissibility && (
                        <p className="text-green">
                          <strong>COURT ADMISSIBILITY:</strong> {previewFile.admissibility}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
