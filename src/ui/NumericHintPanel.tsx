interface Props {
  visible: boolean;
}

export function NumericHintPanel({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="numeric-hint">
      <div className="hint-title">💡 浮動小数点誤差について</div>
      <p>
        コンピュータは小数を 2 進数で近似して保持するため、<code>0.28 - 0.27</code> のような計算で
        わずかな誤差が生じることがあります。これはバグではなく、IEEE 754 浮動小数点数の仕様です。
      </p>
      <p style={{ marginTop: 4 }}>
        回避策: 整数 (×100 など) で計算して、最後に割る。
        例: <code>(28 - 27) / 100</code> → <code>0.01</code>（正確）
      </p>
    </div>
  );
}
