import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GlobalProvider, useGlobalStore } from './store/GlobalStore';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { KnowledgeGraphPage } from './pages/base/KnowledgeGraphPage';
import { DataHubPage } from './pages/base/DataHubPage';
import { ReasoningEnginePage } from './pages/base/ReasoningEnginePage';
import { TagCenterPage } from './pages/base/TagCenterPage';
import { SettingsPage } from './pages/base/SettingsPage';
import { ResourceEnterprisesPage } from './pages/resources/ResourceEnterprisesPage';
import { ScenarioEntryPage } from './pages/scenario/ScenarioEntryPage';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { state } = useGlobalStore();
  const location = useLocation();

  if (!state.isInitialized) {
    return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const LoginGuard = ({ children }: { children: React.ReactNode }) => {
  const { state } = useGlobalStore();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/app/scenario/powerops";
  
  if (state.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginGuard><LoginPage /></LoginGuard>} />
          
          <Route path="/app" element={<AuthGuard><MainLayout /></AuthGuard>}>
            <Route index element={<Navigate to="scenario/powerops" replace />} />
            <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
            <Route path="data-hub" element={<DataHubPage />} />
            <Route path="reasoning-engine" element={<ReasoningEnginePage />} />
            <Route path="tag-center" element={<TagCenterPage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            <Route path="resource/enterprises" element={<ResourceEnterprisesPage />} />
            <Route path="case-library" element={<DataHubPage />} />
            <Route path="knowledge-library" element={<DataHubPage />} />
            
            <Route path="scenario/:id" element={<ScenarioEntryPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/app/scenario/powerops" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
