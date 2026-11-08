import { Whale } from '../../components/Whale'
import type { StreakSummary } from '../../api/stats'

type Props = Pick<StreakSummary, 'streak' | 'record' | 'mood'>

/** Thẻ streak đầu trang Thống kê. Màu và câu chữ theo tâm trạng Bubu (quy tắc 7). */
export function StreakHero({ streak, record, mood }: Props) {
  if (mood === 'sad') {
    return (
      <section className="flex items-center gap-4 rounded-card border-2 border-line bg-surface px-4 py-4 shadow-block">
        <div className="shrink-0">
          <Whale mood="sad" size={110} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-black">Bubu buồn quá…</p>
          <p className="mt-1 text-[14px] font-bold text-ink2">
            Hoàn thành 1 card hôm nay để bắt đầu chuỗi mới nhé.
          </p>
        </div>
      </section>
    )
  }

  const doneToday = mood === 'cheer'
  return (
    <section className="flex items-center gap-4 rounded-card bg-brand px-4 py-4 text-white shadow-[0_5px_0_var(--color-brand-shade)]">
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2">
          <span className="text-[56px] leading-none font-black">{streak}</span>
          <span className="text-base font-black">ngày streak</span>
        </p>
        <p className="mt-2 text-[14px] font-bold text-white/90">
          {doneToday
            ? 'Ô hôm nay đã xanh! Mai gặp lại nhé.'
            : 'Còn hôm nay nữa thôi — xong 1 card để giữ chuỗi!'}
        </p>
        <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-[13px] font-black">
          Kỷ lục: {record} ngày
        </span>
      </div>
      <div className="shrink-0">
        <Whale mood={doneToday ? 'cheer' : 'happy'} size={128} burst={doneToday} />
      </div>
    </section>
  )
}
