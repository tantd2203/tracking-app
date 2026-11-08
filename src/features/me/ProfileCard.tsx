import { initials } from '../../lib/text'

type Props = {
  name: string
  email: string
  memberSince: string
  onEdit: () => void
}

/** Thẻ hồ sơ: avatar chữ cái, tên (chạm để sửa), email, ngày tham gia. */
export function ProfileCard({ name, email, memberSince, onEdit }: Props) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Sửa tên hiển thị"
      className="flex w-full cursor-pointer items-center gap-4 rounded-card border-2 border-line bg-surface p-4 text-left shadow-block"
    >
      <div className="grid size-16 shrink-0 place-items-center rounded-[18px] bg-brand text-2xl font-black text-white shadow-[0_4px_0_var(--color-brand-shade)]">
        {initials(name || email)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xl font-black">{name || 'Bạn của Bubu'}</p>
        <p className="truncate text-sm font-bold text-ink2">{email}</p>
        {memberSince && (
          <p className="mt-0.5 text-[13px] font-black text-brand">Thành viên từ {memberSince}</p>
        )}
      </div>
    </button>
  )
}
