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
    <div className="ai-panel">
      {/* Header */}
      <div className="ai-header">
        <TeacherCharacter emotion={emotion} size={52} />
        <div>
          <div className="ai-header__name">AI先生</div>
          <div className="ai-header__sub">情報I サポートエージェント</div>
        </div>
        {busy && <div className="ai-header__thinking">考え中…</div>}
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg${msg.role === 'user' ? ' ai-msg--user' : ''}`}>
            {msg.role === 'teacher' && (
              <TeacherCharacter
                emotion={i === messages.length - 1 ? emotion : 'neutral'}
                size={30}
              />
            )}
            <div className={`ai-bubble ${msg.role === 'teacher' ? 'ai-bubble--teacher' : 'ai-bubble--user'}`}>
              {msg.text}
              {msg.streaming && msg.text === '' && (
                <span className="ai-cursor">▋</span>
              )}
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
          placeholder="質問を入力… (Enter で送信、Shift+Enter で改行)"
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
  );
}
