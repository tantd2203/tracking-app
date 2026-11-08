import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button3D } from '../../components/Button3D'
import { Segmented } from '../../components/Segmented'
import { Whale } from '../../components/Whale'

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

/**
 * Màn 5–7 – Thống kê (Heatmap / Báo cáo) và trạng thái trống.
 * Giai đoạn 0 hiển thị trạng thái trống; heatmap làm ở giai đoạn 6, báo cáo ở giai đoạn 7.
 */
export default function StatsPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'heatmap' | 'report'>('heatmap')

  return (
    <div className="px-5">
      <header className="safe-top flex items-center justify-between pb-4">
        <h1 className="text-[30px] font-black">Thống kê</h1>
        <Segmented
          className="w-48"
          value={view}
          onChange={setView}
          options={[
            { value: 'heatmap', label: 'Heatmap' },
            { value: 'report', label: 'Báo cáo' },
          ]}
        />
      </header>

      {view === 'heatmap' ? (
        <section className="flex flex-col items-center rounded-card border-2 border-line bg-surface px-6 py-8 text-center shadow-block">
          <Whale mood="calm" size={150} />
          <h2 className="mt-3 text-xl font-black">Hoàn thành card đầu tiên để tô màu ô hôm nay</h2>
          <p className="mt-1 text-[15px] font-bold text-ink2">
            Mỗi ngày có card xong, nước sẽ sâu thêm một chút để Bubu bơi.
          </p>
          <Button3D size="md" className="mt-5 px-6" onClick={() => navigate('/boards')}>
            ĐI TỚI BOARD
          </Button3D>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-ink2">
            Ít
            {HEAT.map((c) => (
              <span key={c} className={`size-3.5 rounded-[4px] ${c}`} />
            ))}
            Nhiều
          </div>
        </section>
      ) : (
        <section className="rounded-card border-2 border-line bg-surface p-6 text-center font-bold text-ink2 shadow-block">
          Báo cáo tuần / tháng sẽ được code ở giai đoạn 7.
        </section>
      )}
    </div>
  )
}
