// AI Teacher chat panel

import { useState, useRef, useEffect } from 'react';
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

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: '#3c3c3c',
  border: '1px solid #555',
  borderRadius: 4,
  color: '#d4d4d4',
  padding: '6px 10px',
  fontSize: 13,
  outline: 'none',
  resize: 'none',
};

const sendBtn: React.CSSProperties = {
  background: '#0e639c',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: 13,
  alignSelf: 'flex-end',
};

function emotionFromText(text: string): Emotion {
  if (/素晴らしい|よくできまし|完璧|正解/.test(text)) return 'happy';
  if (/エラー|間違|注意|気をつけ/.test(text)) return 'warning';
  if (/難しい|残念|もう一度/.test(text)) return 'sad';
  if (/考え|ヒント|確認|見てみ/.test(text)) return 'thinking';
  return 'neutral';
}

export function AITeacherPanel({ currentCode, currentProblem, lastError, topicTag }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'teacher', text: 'こんにちは！何でも質問してください。一緒に考えましょう 😊' },
  ]);
  const [input, setInput] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    setEmotion('thinking');

    setMessages(prev => [...prev, { role: 'user', text: q }]);

    const ctx: TeacherContext = {
      userQuestion: q,
      currentCode,
      currentProblem,
      lastError,
      topicTag,
    };

    // Placeholder streaming message
    setMessages(prev => [...prev, { role: 'teacher', text: '', streaming: true }]);

    let accumulated = '';
    try {
      await askTeacher(ctx, {
        onToken(token) {
          accumulated += token;
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last.streaming) {
              next[next.length - 1] = { ...last, text: accumulated };
            }
            return next;
          });
        },
        onDone(full) {
          setEmotion(emotionFromText(full));
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last.streaming) {
              next[next.length - 1] = { role: 'teacher', text: full };
            }
            return next;
          });
          setBusy(false);
        },
        onError(err) {
          setEmotion('warning');
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last.streaming) {
              next[next.length - 1] = { role: 'teacher', text: `エラーが発生しました: ${err.message}` };
            }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400, color: '#d4d4d4' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #333' }}>
        <TeacherCharacter emotion={emotion} size={56} />
        <div>
          <div style={{ fontWeight: 'bold', color: '#9cdcfe', fontSize: 15 }}>AI先生</div>
          <div style={{ fontSize: 12, color: '#888' }}>情報I サポートエージェント</div>
        </div>
        {busy && (
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#4ec9b0' }}>考え中...</div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            {msg.role === 'teacher' && <TeacherCharacter emotion={i === messages.length - 1 ? emotion : 'neutral'} size={32} />}
            <div
              style={{
                maxWidth: '80%',
                background: msg.role === 'user' ? '#0e639c' : '#252526',
                border: msg.role === 'teacher' ? '1px solid #333' : 'none',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
              {msg.streaming && msg.text === '' && (
                <span style={{ color: '#555' }}>▋</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #333', display: 'flex', gap: 8 }}>
        <textarea
          style={inputStyle}
          rows={2}
          placeholder="質問を入力… (Enter で送信、Shift+Enter で改行)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={busy}
        />
        <button style={sendBtn} onClick={() => void send()} disabled={busy || !input.trim()}>
          送信
        </button>
      </div>
    </div>
  );
}
