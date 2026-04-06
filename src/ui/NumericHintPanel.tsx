export function NumericHintPanel() {
  return (
    <section className="panel-card">
      <div className="panel-head">
        <span>Numeric Hint</span>
      </div>
      <p className="panel-text">
        `0.28 - 0.27` may not display as an exact decimal because JavaScript numbers use finite binary
        floating-point representation.
      </p>
      <p className="panel-text">
        For teaching, compare the floating-point example with integer-first arithmetic such as handling
        money in whole yen before dividing by `100`.
      </p>
    </section>
  );
}
