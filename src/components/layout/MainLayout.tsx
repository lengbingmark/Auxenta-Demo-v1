import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CopilotWidget } from '../copilot/CopilotWidget';
import { CopilotProvider } from '../../copilot/core/CopilotContext';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const MainLayout: React.FC = () => {
  return (
    <CopilotProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 relative">
            <div className="max-w-7xl mx-auto w-full">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </div>
        <CopilotWidget />
      </div>
    </CopilotProvider>
  );
};
