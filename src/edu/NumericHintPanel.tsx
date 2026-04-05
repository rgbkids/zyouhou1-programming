export function NumericHintPanel() {
  return (
    <div style={{ background: '#252526', padding: 12, borderRadius: 4, fontSize: 12, color: '#ccc' }}>
      <div style={{ color: '#9cdcfe', fontWeight: 'bold', marginBottom: 6 }}>浮動小数点数の誤差について</div>
      <p style={{ margin: '0 0 6px' }}>
        コンピュータは実数を二進数で近似して表現するため、<br />
        小数の計算に誤差が生じることがあります。
      </p>
      <div style={{ background: '#1e1e1e', padding: 8, borderRadius: 4, fontFamily: 'monospace', color: '#ce9178' }}>
        例: 0.28 - 0.27 = 0.010000000000000009
      </div>
      <p style={{ margin: '6px 0 0' }}>
        対策: 整数として計算してから小数に戻す<br />
        例: <code style={{ color: '#9cdcfe' }}>(28 - 27) / 100</code> → <code style={{ color: '#b5cea8' }}>0.01</code>
      </p>
    </div>
  );
}
