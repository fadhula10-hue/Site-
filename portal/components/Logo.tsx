/**
 * Logo Olympe Production — typographie identique au site principal :
 * OLY (orange) + MPE (blanc), PRODU (blanc) + CTION (orange).
 */
export function Logo({ size = 18 }: { size?: number }) {
  const accent = "#F15A24";
  return (
    <div className="op-logo" style={{ fontSize: size }}>
      <span className="op-logo__row">
        <span style={{ color: accent }}>OLY</span>
        <span>MPE</span>
      </span>
      <span className="op-logo__row">
        <span>PRODU</span>
        <span style={{ color: accent }}>CTION</span>
      </span>
    </div>
  );
}
