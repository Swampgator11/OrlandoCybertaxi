export function CybercabArt({ glow = "#ff5a1f" }: { glow?: string }) {
  return (
    <svg className="art" viewBox="0 0 280 80" fill="none" aria-hidden="true">
      <ellipse cx="140" cy="68" rx="90" ry="8" fill={glow} opacity="0.18" />
      <path
        d="M36 54h208l-18-28a22 22 0 0 0-20-12H86a22 22 0 0 0-20 12L36 54z"
        fill="#dfe3df"
      />
      <path d="M54 32h172v8H54z" fill="#9aa19a" opacity=".35" />
      <path d="M70 26h52v12H70z" fill="#14161c" />
      <path d="M158 26h52v12h-52z" fill="#14161c" />
      <path d="M118 22h44v4h-44z" fill={glow} />
      <circle cx="78" cy="56" r="10" fill="#101218" stroke={glow} />
      <circle cx="202" cy="56" r="10" fill="#101218" stroke={glow} />
    </svg>
  );
}

export function ModelYArt() {
  return (
    <svg className="art" viewBox="0 0 280 80" fill="none" aria-hidden="true">
      <ellipse cx="140" cy="68" rx="90" ry="8" fill="#7ee0c8" opacity="0.16" />
      <path
        d="M34 54c8-18 28-32 58-32h96c30 0 50 14 58 32H34z"
        fill="#c9d0c8"
      />
      <path d="M86 26c18-8 90-8 108 0v14H86V26z" fill="#14161c" />
      <path d="M118 22h44v3h-44z" fill="#7ee0c8" />
      <circle cx="82" cy="56" r="11" fill="#101218" stroke="#7ee0c8" />
      <circle cx="198" cy="56" r="11" fill="#101218" stroke="#7ee0c8" />
    </svg>
  );
}
