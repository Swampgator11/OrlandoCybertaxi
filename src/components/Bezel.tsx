import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  plaque?: string;
  compact?: boolean;
  className?: string;
};

export default function Bezel({ children, plaque, compact, className = "" }: Props) {
  return (
    <figure className={`bezel ${compact ? "compact" : ""} ${className}`.trim()}>
      <div className="bezel-well">{children}</div>
      {plaque ? <figcaption className="plaque">{plaque}</figcaption> : null}
    </figure>
  );
}
