import { Separator as PanelResizeHandle } from 'react-resizable-panels';

interface Props {
  direction: 'horizontal' | 'vertical';
  className?: string;
}

export function ResizeHandle({ direction, className }: Props) {
  return (
    <PanelResizeHandle
      className={`resize-handle resize-handle--${direction}${className ? ` ${className}` : ''}`}
    >
      <div className="resize-handle__indicator" />
    </PanelResizeHandle>
  );
}
