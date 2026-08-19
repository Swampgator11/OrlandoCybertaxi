import Bezel from "./Bezel";

type Props = {
  src: string;
  poster: string;
  caption: string;
};

export default function CabinFilm({ src, poster, caption }: Props) {
  return (
    <section className="film">
      <Bezel plaque={caption} className="film-frame">
        <video
          className="film-video"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </Bezel>
    </section>
  );
}
