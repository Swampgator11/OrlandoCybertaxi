type Props = {
  src: string;
  poster: string;
  caption: string;
};

export default function CabinFilm({ src, poster, caption }: Props) {
  return (
    <section className="film">
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
      <div className="film-veil" />
      <p className="film-caption">{caption}</p>
    </section>
  );
}
