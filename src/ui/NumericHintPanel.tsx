export function NumericHintPanel() {
  return (
    <div className="numeric-hint">
      <div className="hint-title">浮動小数点の注意</div>
      <p>
        コンピュータ内部では小数を 2 進数で近似するため、<br />
        例えば <code>0.28 - 0.27</code> の計算結果は<br />
        <code>0.010000000000000009</code> のようにわずかにずれます。<br />
        整数で計算してから変換する方法で回避できます。
      </p>
    </div>
  );
}
