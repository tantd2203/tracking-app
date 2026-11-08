import { useNavigate } from 'react-router'
import { Button3D } from '../../components/Button3D'
import { Whale } from '../../components/Whale'

/** Trạng thái trống khi chưa có card nào xong: thay cho thẻ streak. */
export function EmptyStats() {
  const navigate = useNavigate()
  return (
    <section className="flex flex-col items-center rounded-card border-2 border-line bg-surface px-6 py-8 text-center shadow-block">
      <Whale mood="calm" size={140} />
      <h2 className="mt-3 text-xl font-black">Hoàn thành card đầu tiên để tô màu ô hôm nay</h2>
      <p className="mt-1 text-[15px] font-bold text-ink2">
        Mỗi ngày có card xong, nước sẽ sâu thêm một chút để Bubu bơi.
      </p>
      <Button3D size="md" className="mt-5 px-6" onClick={() => navigate('/boards')}>
        ĐI TỚI BOARD
      </Button3D>
    </section>
  )
}
