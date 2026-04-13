import { useState } from "react";

export default function Index() {
  const [value, setValue] = useState(50);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const percent = value;
  const dashOffset = 283 - (283 * percent) / 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center font-body"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="flex flex-col items-center gap-16 animate-slide-up">

        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          <svg
            width="220"
            height="220"
            viewBox="0 0 100 100"
            style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(0 0% 88%)"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(0 0% 15%)"
              strokeWidth="1.5"
              strokeDasharray="283"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.1s ease" }}
            />
          </svg>

          <div className="flex flex-col items-center z-10">
            <span
              className="font-display leading-none"
              style={{
                fontSize: "clamp(52px, 10vw, 72px)",
                color: "hsl(var(--foreground))",
                fontWeight: 300,
                letterSpacing: "-0.02em",
                transition: "all 0.1s ease",
              }}
            >
              {value}
            </span>
            <span
              className="font-body"
              style={{
                fontSize: 11,
                color: "hsl(0 0% 55%)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              значение
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: 340 }}>
          <div className="flex justify-between w-full px-1">
            <span
              className="font-body"
              style={{ fontSize: 11, color: "hsl(0 0% 60%)", letterSpacing: "0.15em" }}
            >
              0
            </span>
            <span
              className="font-body"
              style={{ fontSize: 11, color: "hsl(0 0% 60%)", letterSpacing: "0.15em" }}
            >
              100
            </span>
          </div>

          <div className="relative w-full" style={{ height: 24 }}>
            <div
              className="absolute top-1/2 left-0 right-0 rounded-full"
              style={{
                height: 1,
                background: "hsl(0 0% 82%)",
                transform: "translateY(-50%)",
              }}
            />
            <div
              className="absolute top-1/2 left-0 rounded-full"
              style={{
                height: 1,
                width: `${percent}%`,
                background: "hsl(0 0% 15%)",
                transform: "translateY(-50%)",
                transition: "width 0.05s ease",
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              onChange={handleChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ height: "100%" }}
            />
            <div
              className="absolute top-1/2 rounded-full"
              style={{
                width: 14,
                height: 14,
                background: "hsl(0 0% 10%)",
                border: "2px solid hsl(0 0% 97%)",
                boxShadow: "0 0 0 1px hsl(0 0% 20%)",
                transform: "translate(-50%, -50%)",
                left: `${percent}%`,
                transition: "left 0.05s ease",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <div
          className="grid grid-cols-3 font-display"
          style={{
            gap: "1px",
            background: "hsl(0 0% 82%)",
            border: "1px solid hsl(0 0% 82%)",
          }}
        >
          {[
            { label: "МИН", val: 0 },
            { label: "ТЕКУЩЕЕ", val: value },
            { label: "МАКС", val: 100 },
          ].map(({ label, val }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center"
              style={{
                width: 100,
                height: 72,
                background: "hsl(0 0% 97%)",
                padding: "12px 8px",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 300,
                  color: "hsl(0 0% 10%)",
                  lineHeight: 1,
                  transition: "all 0.1s ease",
                }}
              >
                {val}
              </span>
              <span
                className="font-body"
                style={{
                  fontSize: 9,
                  color: "hsl(0 0% 55%)",
                  letterSpacing: "0.18em",
                  marginTop: 5,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
