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

  // Show clean minimal loading spinner while verifying session
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#000000', color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: 24, height: 24,
          border: '2px solid rgba(255,255,255,0.2)',
          borderTopColor: '#ffffff', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
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

