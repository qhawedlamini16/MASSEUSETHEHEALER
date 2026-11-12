import { useEffect, useRef } from "react";

// Layered, depth-sorted drifting smoke puffs on a canvas (pseudo-3D parallax).
export function Smoke() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--smoke").trim() || "white";
    let w = 0, h = 0, raf = 0;
    const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
    resize(); addEventListener("resize", resize);
    const sprite = document.createElement("canvas"); sprite.width = sprite.height = 256;
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, color); g.addColorStop(1, "transparent");
    s.fillStyle = g; s.fillRect(0, 0, 256, 256);
    const puffs = Array.from({ length: 46 }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      z: Math.random() * 0.9 + 0.1, r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.002, ph: Math.random() * 100,
    })).sort((a, b) => a.z - b.z);
    let t = 0;
    const loop = () => {
      t += 1; ctx.clearRect(0, 0, w, h);
      for (const p of puffs) {
        p.x += 0.25 * p.z + Math.sin((t + p.ph) / 200) * 0.3;
        p.y -= 0.12 * p.z;
        p.r += p.vr;
        const size = 260 + p.z * 520;
        if (p.x - size / 2 > w) p.x = -size / 2;
        if (p.y + size / 2 < 0) p.y = h + size / 2;
        ctx.save(); ctx.globalAlpha = 0.05 + p.z * 0.1;
        ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1.6, 1);
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size); ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full mix-blend-screen" />;
}
