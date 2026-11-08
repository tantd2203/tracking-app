import type { ComponentProps } from 'react'
import { Whale } from '../../components/Whale'

export type WeekDay = { label: string; done: boolean; today: boolean }

type Props = {
  title: string
  sub: string
  mood: ComponentProps<typeof Whale>['mood']
  week: WeekDay[]
}

/** Banner streak đầu trang Board. Dữ liệu thật do FE-09 nối vào sau. */
export function StreakBanner({ title, sub, mood, week }: Props) {
  return (
    <section className="flex items-center gap-4 rounded-card bg-brand px-4 py-4 text-white shadow-[0_5px_0_var(--color-brand-shade)]">
      <div className="shrink-0">
        <Whale mood={mood} size={92} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-black">{title}</p>
        <p className="mt-0.5 text-[13px] font-bold text-white/90">{sub}</p>
        <div className="mt-3 flex items-end justify-between gap-1">
          {week.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={[
                  'grid size-[22px] place-items-center rounded-full text-[11px] font-black',
                  d.done ? 'bg-white text-brand' : 'bg-white/20',
                  d.today && !d.done ? 'ring-2 ring-white' : '',
                ].join(' ')}
              >
                {d.done ? '✓' : ''}
              </span>
              <span className="text-[10px] font-extrabold text-white/90">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
