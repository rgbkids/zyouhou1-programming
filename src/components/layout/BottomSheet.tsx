// Bottom sheet modal for mobile

import { useEffect, useRef } from 'react';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ onClose, children, title }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="bottom-sheet-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="bottom-sheet">
        <div className="bottom-sheet__handle" aria-hidden="true" />
        {title && (
          <div style={{
            padding: '4px 16px 8px',
            fontWeight: 'bold',
            color: '#9cdcfe',
            borderBottom: '1px solid #333',
            fontSize: 15,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{title}</span>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        )}
        <div className="bottom-sheet__content">
          {children}
        </div>
      </div>
    </div>
  );
}
