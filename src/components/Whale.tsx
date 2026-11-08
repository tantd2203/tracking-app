import { useId, type CSSProperties } from 'react'

export type WhaleMood = 'happy' | 'calm' | 'cheer' | 'sad'

type Props = {
  mood?: WhaleMood
  size?: number
  /** Tia nước nhỏ trên đầu */
  spout?: boolean
  /** Phun nước tung toé – dùng ở popup ăn mừng */
  burst?: boolean
  /** Nhấp nhô lên xuống */
  bob?: boolean
  className?: string
}

const INK = '#0B2540'
const DROPS: [number, number][] = [
  [-70, -110],
  [-40, -150],
  [-12, -175],
  [16, -170],
  [44, -148],
  [72, -112],
  [-90, -60],
  [92, -64],
  [0, -130],
]

/** Linh vật Bubu – chuyển nguyên từ file thiết kế "Bubu App v2". */
export function Whale({
  mood = 'happy',
  size = 120,
  spout = false,
  burst = false,
  bob = true,
  className,
}: Props) {
  const clipId = useId()
  const pupilY = mood === 'sad' ? 4 : 1
  const height = (size * 170) / 220

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height,
        animation: bob ? 'bob 3s ease-in-out infinite' : undefined,
      }}
    >
      <svg
        viewBox="0 0 220 170"
        width={size}
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
        role="img"
        aria-label="Bubu"
      >
        {/* đuôi */}
        <ellipse cx={160} cy={84} rx={24} ry={15} fill="#0284C7" transform="rotate(-35 160 84)" />
        <ellipse cx={176} cy={54} rx={22} ry={10} fill="#0284C7" transform="rotate(-70 176 54)" />
        <ellipse cx={194} cy={70} rx={22} ry={10} fill="#0284C7" transform="rotate(-15 194 70)" />
        <defs>
          <clipPath id={clipId}>
            <ellipse cx={92} cy={100} rx={78} ry={56} />
          </clipPath>
        </defs>
        {/* thân, bụng, vây */}
        <ellipse cx={92} cy={100} rx={78} ry={56} fill="#0EA5E9" />
        <ellipse cx={86} cy={140} rx={66} ry={32} fill="#E0F2FE" clipPath={`url(#${clipId})`} />
        <ellipse
          cx={70}
          cy={64}
          rx={18}
          ry={8}
          fill="#fff"
          opacity={0.35}
          transform="rotate(-20 70 64)"
        />
        <ellipse cx={128} cy={128} rx={17} ry={8} fill="#0284C7" transform="rotate(30 128 128)" />

        {/* mắt */}
        {mood === 'calm' ? (
          <>
            <path
              d="M54 92 Q66 82 78 92"
              stroke={INK}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M98 92 Q110 82 122 92"
              stroke={INK}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {[66, 110].map((x) => (
              <g key={x}>
                <circle cx={x} cy={88} r={14} fill="#fff" />
                <circle cx={x + 1} cy={88 + pupilY} r={8} fill={INK} />
                <circle cx={x - 2} cy={88 + pupilY - 3} r={3} fill="#fff" />
              </g>
            ))}
            {mood === 'sad' && (
              <>
                <path d="M52 70 L74 76" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
                <path d="M124 70 L102 76" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
              </>
            )}
          </>
        )}

        {/* má hồng */}
        <ellipse cx={48} cy={108} rx={9} ry={6} fill="#F9A8D4" opacity={0.85} />
        <ellipse cx={128} cy={108} rx={9} ry={6} fill="#F9A8D4" opacity={0.85} />

        {/* miệng */}
        {mood === 'cheer' && (
          <>
            <path
              d="M74 104 Q88 132 102 104 Z"
              fill={INK}
              stroke={INK}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <ellipse cx={88} cy={117} rx={7} ry={4} fill="#F472B6" />
          </>
        )}
        {mood === 'sad' && (
          <>
            <path
              d="M78 118 Q88 107 98 118"
              stroke={INK}
              strokeWidth={4.5}
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx={54} cy={110} rx={4.5} ry={7} fill="#7DD3FC" />
          </>
        )}
        {(mood === 'happy' || mood === 'calm') && (
          <path
            d={mood === 'calm' ? 'M80 108 Q88 115 96 108' : 'M77 106 Q88 120 99 106'}
            stroke={INK}
            strokeWidth={4.5}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* tia nước nhỏ */}
        {spout && !burst && (
          <>
            <rect x={86} y={28} width={6} height={18} rx={3} fill="#7DD3FC" />
            <circle cx={89} cy={22} r={7} fill="#7DD3FC" />
            <circle cx={74} cy={28} r={5} fill="#BAE6FD" />
            <circle cx={104} cy={28} r={5} fill="#BAE6FD" />
          </>
        )}
      </svg>

      {burst && (
        <>
          {DROPS.map(([dx, dy], i) => {
            const big = i % 3 === 0
            const style: CSSProperties & Record<'--dx' | '--dy', string> = {
              position: 'absolute',
              left: size * 0.405 - 7,
              top: size * 0.18,
              width: big ? 16 : 11,
              height: big ? 16 : 11,
              borderRadius: '50% 0 50% 50%',
              transform: 'rotate(-45deg)',
              background: i % 2 ? '#7DD3FC' : '#38BDF8',
              '--dx': `${dx}px`,
              '--dy': `${dy}px`,
              animation: `drop 1.5s ${(i % 5) * 0.12}s ease-out infinite`,
            }
            return <span key={i} style={style} />
          })}
          <span
            style={{
              position: 'absolute',
              left: size * 0.405 - 5,
              top: size * 0.02,
              width: 10,
              height: size * 0.18,
              borderRadius: 6,
              background: '#7DD3FC',
              opacity: 0.9,
            }}
          />
        </>
      )}
    </div>
  )
}
