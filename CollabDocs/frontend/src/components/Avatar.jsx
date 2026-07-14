// Deterministic color-coded initials for each username. This is the one
// identity marker reused everywhere someone appears (doc cards, editor
// header, share list) so "who's on this document" reads at a glance.
const PALETTE = [
  { bg: "#F3E7D2", fg: "#8A5F17" }, // brass
  { bg: "#DCEAE6", fg: "#1F6E63" }, // teal
  { bg: "#E2E5F3", fg: "#3B4C8C" }, // indigo
  { bg: "#EFE0EA", fg: "#7A4B6B" }, // plum
  { bg: "#E1EADF", fg: "#3F6B3D" }, // forest
  { bg: "#E1E8EF", fg: "#46607A" }, // slate-blue
];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ name, size = 30, title }) {
  if (!name) return null;
  const { bg, fg } = colorFor(name);
  const initial = name.trim()[0]?.toUpperCase() || "?";
  return (
    <span
      className="avatar"
      title={title || name}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.42,
      }}
    >
      {initial}
    </span>
  );
}

export function AvatarStack({ names, max = 4, size = 26 }) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;
  return (
    <span className="avatar-stack">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {overflow > 0 && (
        <span className="avatar avatar-overflow" style={{ width: size, height: size, fontSize: size * 0.36 }}>
          +{overflow}
        </span>
      )}
    </span>
  );
}
