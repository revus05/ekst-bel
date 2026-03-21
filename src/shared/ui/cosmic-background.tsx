"use client";

import { particles as Particles } from "@appletosolutions/reactbits";

function CosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(123,211,255,0.16),_transparent_32%),radial-gradient(circle_at_20%_20%,_rgba(120,119,255,0.18),_transparent_24%),radial-gradient(circle_at_80%_30%,_rgba(93,224,230,0.12),_transparent_28%),linear-gradient(180deg,_#02030a_0%,_#07111f_42%,_#020611_100%)]" />
      <div className="absolute inset-0 opacity-85">
        <Particles
          className="h-full w-full"
          particleCount={260}
          particleSpread={14}
          speed={0.06}
          particleBaseSize={90}
          sizeRandomness={1.1}
          cameraDistance={18}
          alphaParticles
          moveParticlesOnHover
          particleHoverFactor={0.8}
          particleColors={["#ffffff", "#9bdcff", "#78a8ff", "#d6efff"]}
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0,_rgba(2,6,17,0.08)_45%,_rgba(2,6,17,0.72)_100%)]" />
    </div>
  );
}

export { CosmicBackground };
