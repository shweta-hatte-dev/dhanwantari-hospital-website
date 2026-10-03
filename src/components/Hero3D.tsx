// Pure CSS 3D rotating cube: no external model files or network assets needed.
export default function Hero3D() {
  return (
    <div className="float" aria-hidden>
      <div className="scene">
        <div className="cube">
          <div className="cube-face front">+</div>
          <div className="cube-face back">+</div>
          <div className="cube-face right">+</div>
          <div className="cube-face left">+</div>
          <div className="cube-face top">+</div>
          <div className="cube-face bottom">+</div>
        </div>
      </div>
    </div>
  );
}
