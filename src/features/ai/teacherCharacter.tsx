// AI teacher character SVG with emotion states

export type Emotion = 'neutral' | 'happy' | 'thinking' | 'warning' | 'sad';

interface Props {
  emotion: Emotion;
  size?: number;
}

const COLORS: Record<Emotion, { face: string; eyes: string; mouth: string }> = {
  neutral:  { face: '#4ec9b0', eyes: '#1e1e1e', mouth: '#1e1e1e' },
  happy:    { face: '#89d185', eyes: '#1e1e1e', mouth: '#1e1e1e' },
  thinking: { face: '#9cdcfe', eyes: '#1e1e1e', mouth: '#1e1e1e' },
  warning:  { face: '#dcdcaa', eyes: '#1e1e1e', mouth: '#1e1e1e' },
  sad:      { face: '#ce9178', eyes: '#1e1e1e', mouth: '#1e1e1e' },
};

// Mouth paths per emotion
function MouthPath({ emotion }: { emotion: Emotion }) {
  switch (emotion) {
    case 'happy':
      // Smile arc
      return <path d="M 30 44 Q 40 52 50 44" stroke="#1e1e1e" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case 'sad':
      // Frown arc
      return <path d="M 30 50 Q 40 42 50 50" stroke="#1e1e1e" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case 'thinking':
      // Small horizontal line (hmm...)
      return <path d="M 33 47 Q 40 50 47 47" stroke="#1e1e1e" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case 'warning':
      // Straight line
      return <line x1="32" y1="48" x2="48" y2="48" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" />;
    default:
      // Neutral gentle curve
      return <path d="M 32 47 Q 40 50 48 47" stroke="#1e1e1e" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
}

function EyeBrows({ emotion }: { emotion: Emotion }) {
  if (emotion === 'warning') {
    return (
      <>
        <line x1="28" y1="27" x2="36" y2="30" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="44" y1="30" x2="52" y2="27" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  }
  if (emotion === 'thinking') {
    return (
      <>
        <line x1="28" y1="30" x2="36" y2="28" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="29" x2="52" y2="31" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }
  return null;
}

export function TeacherCharacter({ emotion, size = 80 }: Props) {
  const c = COLORS[emotion];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-label={`AI先生 (${emotion})`}
      role="img"
    >
      {/* Body */}
      <rect x="22" y="60" width="36" height="16" rx="4" fill={c.face} opacity={0.6} />
      {/* Neck */}
      <rect x="33" y="56" width="14" height="8" rx="3" fill={c.face} opacity={0.8} />
      {/* Head */}
      <circle cx="40" cy="36" r="22" fill={c.face} />
      {/* Eyes */}
      {emotion === 'happy' ? (
        <>
          {/* Happy closed eyes */}
          <path d="M 28 33 Q 32 30 36 33" stroke={c.eyes} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 44 33 Q 48 30 52 33" stroke={c.eyes} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="32" cy="34" r="3" fill={c.eyes} />
          <circle cx="48" cy="34" r="3" fill={c.eyes} />
          {/* Pupils highlight */}
          <circle cx="33" cy="33" r="1" fill="#fff" />
          <circle cx="49" cy="33" r="1" fill="#fff" />
        </>
      )}
      {/* Eyebrows */}
      <EyeBrows emotion={emotion} />
      {/* Mouth */}
      <MouthPath emotion={emotion} />
      {/* Thinking bubble */}
      {emotion === 'thinking' && (
        <>
          <circle cx="56" cy="20" r="2" fill={c.face} opacity={0.7} />
          <circle cx="61" cy="14" r="3" fill={c.face} opacity={0.7} />
          <circle cx="67" cy="8" r="4" fill={c.face} opacity={0.7} />
        </>
      )}
      {/* Graduation cap */}
      <rect x="20" y="15" width="40" height="5" rx="2" fill="#1e1e1e" opacity={0.85} />
      <rect x="36" y="10" width="8" height="7" rx="2" fill="#1e1e1e" opacity={0.85} />
      <line x1="52" y1="17" x2="56" y2="25" stroke="#dcdcaa" strokeWidth="2" strokeLinecap="round" />
      <circle cx="56" cy="26" r="2" fill="#dcdcaa" />
    </svg>
  );
}
