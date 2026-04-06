// Responsive shell layout component

import { useState, useRef, useEffect } from 'react';
import { Panel, Group as PanelGroup, type PanelImperativeHandle } from 'react-resizable-panels';
import { MobileTabs } from './MobileTabs';
import type { TabId } from './MobileTabs';
import { BottomSheet } from './BottomSheet';
import { ResizeHandle } from './ResizeHandle';

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
  const sidebarPanelRef = useRef<PanelImperativeHandle>(null);

  // Collapse sidebar on mobile so PanelGroup doesn't allocate space for it
  useEffect(() => {
    if (window.innerWidth <= 768) {
      sidebarPanelRef.current?.collapse();
    }
  }, []);

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

      <div className="shell__body">
        <PanelGroup orientation="horizontal">
          <Panel
            panelRef={sidebarPanelRef}
            defaultSize="20%"
            minSize="12%"
            maxSize="35%"
            collapsible
            collapsedSize="0%"
            className="shell__sidebar"
          >
            {sidebar}
          </Panel>
          <ResizeHandle direction="horizontal" className="sidebar-resize-handle" />
          <Panel className="shell__main">
            {main}
          </Panel>
        </PanelGroup>
      </div>

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
