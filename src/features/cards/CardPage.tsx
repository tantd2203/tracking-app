import { useParams } from 'react-router'
import { ScreenHeader } from '../../components/ScreenHeader'

/** Màn 4 – Chi tiết card. Làm ở giai đoạn 4–5. */
export default function CardPage() {
  const { cardId } = useParams()
  return (
    <div>
      <ScreenHeader back title="Chi tiết card" />
      <p className="px-5 text-ink2">
        Card <code>{cardId}</code> – màn chi tiết sẽ được code ở giai đoạn 4.
      </p>
    </div>
  )
}
