import { photoFor, type Paint, type VehicleType } from "../data/fleet";

type Props = {
  type: VehicleType;
  paint?: Paint;
  alt: string;
  className?: string;
};

export function VehiclePortrait({ type, paint, alt, className = "" }: Props) {
  return (
    <figure className={`portrait ${className}`.trim()}>
      <img src={photoFor(type, paint)} alt={alt} />
      <span className="portrait-shine" />
    </figure>
  );
}

export function CybercabArt() {
  return <VehiclePortrait type="cybercab" paint="gold" alt="Tesla Cybercab" />;
}

export function ModelYArt() {
  return <VehiclePortrait type="model-y" paint="white" alt="Tesla Model Y" />;
}
