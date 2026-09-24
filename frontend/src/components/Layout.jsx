import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import DesktopChrome from './desktop/DesktopChrome';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import InvestigationWorkspace from '../pages/InvestigationWorkspace';
import LiveIntelligencePage from '../pages/LiveIntelligencePage';
import SweepDashboardPage from '../pages/SweepDashboardPage';
import AuditLedgerPage from '../pages/AuditLedgerPage';
import CasesPage from '../pages/CasesPage';
import CaseDetailPage from '../pages/CaseDetailPage';
import EntityResolutionPage from '../pages/EntityResolutionPage';
import IngestionPage from '../pages/IngestionPage';
import ByomkeshPage from '../pages/ByomkeshPage';

export default function Layout() {
  const { isAuthenticated, loading } = useAuth();
  const { activeNavSection } = useWorkspace();

  // Show loading spinner while verifying session
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0f', color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, margin: '0 auto 12px',
            border: '2px solid rgba(96,165,250,0.2)',
            borderTopColor: '#60a5fa', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          Verifying session...
        </div>
      </div>
    );
  }

  // Show login page when not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DesktopChrome>
      {activeNavSection === 'home' && <DashboardPage />}
      {activeNavSection === 'workspace' && <InvestigationWorkspace />}
      {activeNavSection === 'intel' && <LiveIntelligencePage />}
      {activeNavSection === 'sweeps' && <SweepDashboardPage />}
      {activeNavSection === 'audit' && <AuditLedgerPage />}
      {activeNavSection === 'cases' && <CasesPage />}
      {activeNavSection === 'case-detail' && <CaseDetailPage />}
      {activeNavSection === 'er' && <EntityResolutionPage />}
      {activeNavSection === 'ingestion' && <IngestionPage />}
      {activeNavSection === 'byomkesh' && <ByomkeshPage />}
    </DesktopChrome>
  );
}

