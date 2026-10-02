// Hero-only Rubik's-style background (full viewport width, fades out at the bottom): a fine black grid with black and white cells
// flipping in and out. Pure CSS; cell positions come from index maths (no
// Math.random) so server and client render the same markup. The centre is
// masked out so the hero text stays readable.
const COLS = 30;
const ROWS = 16;
const CELL = 64;
const CELLS = Array.from({ length: 70 }, (_, i) => ({
  left: ((i * 37 + 11) % COLS) * CELL,
  top: ((i * 53 + 7) % ROWS) * CELL,
  delay: -((i * 0.73) % 8),
  dark: i % 2 === 0,
}));

export default function LandingBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, black 75%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(0 0 0 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.07) 1px, transparent 1px)",
          backgroundSize: `${CELL}px ${CELL}px`,
          maskImage: "radial-gradient(ellipse at center, transparent 15%, black 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 15%, black 75%)",
        }}
      >
        {CELLS.map((c, i) => (
          <div
            key={i}
            className={`bg-cell ${c.dark ? "bg-cell-dark" : "bg-cell-light"}`}
            style={{ left: c.left, top: c.top, animationDelay: `${c.delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}
