import { useParams } from 'react-router'
import { ScreenHeader } from '../../components/ScreenHeader'

/** Màn 3 – Board Kanban + kéo thả. Làm ở giai đoạn 3. */
export default function BoardPage() {
  const { boardId } = useParams()
  return (
    <div>
      <ScreenHeader back title="Board" subtitle="Nhấn giữ card để kéo · vuốt ngang đổi cột" />
      <p className="px-5 text-ink2">
        Board <code>{boardId}</code> – màn Kanban sẽ được code ở giai đoạn 3.
      </p>
    </div>
  )
}
