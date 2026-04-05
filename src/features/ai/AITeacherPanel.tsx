// AI Teacher floating widget (Clippy-style)

import { useState, useRef, useEffect, useCallback } from 'react';
import { TeacherCharacter } from './teacherCharacter';
import type { Emotion } from './teacherCharacter';
import { askTeacher } from './aiClient';
import type { TeacherContext } from './promptBuilders';

interface Message {
  role: 'user' | 'teacher';
  text: string;
  streaming?: boolean;
}

interface Props {
  currentCode?: string;
  currentProblem?: string;
  lastError?: string;
  topicTag?: string;
}

function emotionFromText(text: string): Emotion {
  if (/素晴らしい|よくできまし|完璧|正解/.test(text)) return 'happy';
  if (/エラー|間違|注意|気をつけ/.test(text)) return 'warning';
  if (/難しい|残念|もう一度/.test(text)) return 'sad';
  if (/考え|ヒント|確認|見てみ/.test(text)) return 'thinking';
  return 'neutral';
}

export function AITeacherPanel({ currentCode, currentProblem, lastError, topicTag }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'teacher', text: 'こんにちは！何でも質問してください。一緒に考えましょう 😊' },
  ]);
  const [input, setInput] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [busy, setBusy] = useState(false);

  // Drag state
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Badge: unread count when popup is closed
  const [unread, setUnread] = useState(0);
  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    if (!open && messages.length > prevMsgCount.current) {
      setUnread(c => c + (messages.length - prevMsgCount.current));
    }
    prevMsgCount.current = messages.length;
  }, [messages.length, open]);

  function toggleOpen() {
    setOpen(v => {
      if (!v) setUnread(0);
      return !v;
    });
  }

  // ── Drag ────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = floatRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };

    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      const newX = dragRef.current.origX + dx;
      const newY = dragRef.current.origY + dy;
      const maxX = window.innerWidth - (el?.offsetWidth ?? 80);
      const maxY = window.innerHeight - (el?.offsetHeight ?? 80);
      setPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }

    function onUp() {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────
  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    setEmotion('thinking');

    setMessages(prev => [...prev, { role: 'user', text: q }]);

    const ctx: TeacherContext = { userQuestion: q, currentCode, currentProblem, lastError, topicTag };
    setMessages(prev => [...prev, { role: 'teacher', text: '', streaming: true }]);

    let accumulated = '';
    try {
      await askTeacher(ctx, {
        onToken(token) {
          accumulated += token;
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last.streaming) next[next.length - 1] = { ...last, text: accumulated };
            return next;
          });
        },
        onDone(full) {
          setEmotion(emotionFromText(full));
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last.streaming) next[next.length - 1] = { role: 'teacher', text: full };
            return next;
          });
          setBusy(false);
        },
        onError(err) {
          setEmotion('warning');
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last.streaming) next[next.length - 1] = { role: 'teacher', text: `エラーが発生しました: ${err.message}` };
            return next;
          });
          setBusy(false);
        },
      });
    } catch {
      setBusy(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  // Position style: fixed bottom-right by default, or dragged position
  const style: React.CSSProperties = pos
    ? { position: 'fixed', left: pos.x, top: pos.y, bottom: 'auto', right: 'auto' }
    : { position: 'fixed', right: 24, bottom: 24 };

  return (
    <div ref={floatRef} className="ai-float" style={style}>
      {/* Chat popup */}
      {open && (
        <div className="ai-float__popup">
          {/* Popup header (drag handle) */}
          <div className="ai-float__popup-header" onMouseDown={onMouseDown}>
            <TeacherCharacter emotion={emotion} size={32} />
            <div>
              <div className="ai-header__name">AI先生</div>
              {busy && <div className="ai-header__thinking">考え中…</div>}
            </div>
            <button className="ai-float__close" onClick={toggleOpen} title="閉じる">✕</button>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg${msg.role === 'user' ? ' ai-msg--user' : ''}`}>
                {msg.role === 'teacher' && (
                  <TeacherCharacter
                    emotion={i === messages.length - 1 ? emotion : 'neutral'}
                    size={28}
                  />
                )}
                <div className={`ai-bubble ${msg.role === 'teacher' ? 'ai-bubble--teacher' : 'ai-bubble--user'}`}>
                  {msg.text}
                  {msg.streaming && msg.text === '' && <span className="ai-cursor">▋</span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="ai-input-row">
            <textarea
              className="input-field textarea-field"
              rows={2}
              placeholder="質問を入力… (Enter で送信)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={busy}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => void send()}
              disabled={busy || !input.trim()}
            >
              送信
            </button>
          </div>
        </div>
      )}

      {/* Floating character button */}
      <div className="ai-float__avatar" onMouseDown={onMouseDown} onClick={toggleOpen} title="AI先生">
        <TeacherCharacter emotion={open ? emotion : (unread > 0 ? 'happy' : emotion)} size={56} />
        {unread > 0 && !open && (
          <span className="ai-float__badge">{unread}</span>
        )}
      </div>
    </div>
  );
}
