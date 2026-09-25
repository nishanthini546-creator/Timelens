import TimeLens3D from "./TimeLens3D";

function CinematicBackground() {
  return (
    <div className="cinematic-background" aria-hidden="true">

      {/* Cinematic desert video */}
      <video
        className="desert-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/timelens-desert.mp4" type="video/mp4" />
      </video>

      {/* Very subtle cinematic enhancement */}
      <div className="video-atmosphere" />

      {/* Dashboard-only 3D TimeLens */}
      <TimeLens3D
        size="large"
        className="background-hourglass"
      />

    </div>
  );
}

export default CinematicBackground;