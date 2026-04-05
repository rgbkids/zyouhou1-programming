// Responsive shell layout component

import { useState } from 'react';
import { MobileTabs } from './MobileTabs';
import type { TabId } from './MobileTabs';
import { BottomSheet } from './BottomSheet';

interface ShellProps {
  /** Header content (logo, run button) */
  header: React.ReactNode;
  /** Left sidebar content (sample picker, settings) */
  sidebar: React.ReactNode;
  /** Main content area (editor + output) */
  main: React.ReactNode;
  /** Panel components keyed by tab id */
  panels: Partial<Record<TabId, { title: string; content: React.ReactNode }>>;
}

export function ResponsiveShell({ header, sidebar, main, panels }: ShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    if (tab !== 'editor') {
      setSheetOpen(true);
    } else {
      setSheetOpen(false);
    }
  }

  const activePanel = activeTab !== 'editor' ? panels[activeTab] : undefined;

  return (
    <div className="shell">
      <header className="shell__header">
        {header}
      </header>

      <aside className="shell__sidebar desktop-only">
        {sidebar}
      </aside>

      <main className="shell__main">
        {main}
      </main>

      {/* Mobile bottom sheet for non-editor tabs */}
      {sheetOpen && activePanel && (
        <BottomSheet
          onClose={() => { setSheetOpen(false); setActiveTab('editor'); }}
          title={activePanel.title}
        >
          {activePanel.content}
        </BottomSheet>
      )}

      <MobileTabs active={activeTab} onChange={handleTabChange} />
    </div>
  );
}
