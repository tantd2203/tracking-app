import { useState } from 'react'
import { useUpdateProfile } from '../../api/profile'
import { toastError } from '../../api/errors'
import { BottomSheet } from '../../components/BottomSheet'
import { Button3D } from '../../components/Button3D'
import { TextField } from '../../components/TextField'
import { toast } from '../../components/toast'

const NAME_MAX = 40

type Props = { current: string; onClose: () => void }

/** Sheet sửa tên hiển thị. Tên này hiện ở thẻ hồ sơ và lời chào trên Danh sách board. */
export function EditNameSheet({ current, onClose }: Props) {
  const update = useUpdateProfile()
  const [name, setName] = useState(current)
  const [error, setError] = useState('')

  function save() {
    const trimmed = name.trim()
    if (!trimmed) return setError('Nhập tên hiển thị nhé!')
    update.mutate(
      { display_name: trimmed },
      {
        onSuccess: () => {
          onClose()
          toast('Đã lưu tên')
        },
        onError: (e) => toastError(e),
      },
    )
  }

  return (
    <BottomSheet open onClose={onClose} title="Tên hiển thị">
      <div className="flex flex-col gap-4 pb-4">
        <TextField
          label="Tên"
          placeholder="Ví dụ: Nguyễn Minh Anh"
          maxLength={NAME_MAX}
          showCounter
          autoFocus
          value={name}
          error={error}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <Button3D block onClick={save} disabled={update.isPending}>
          LƯU
        </Button3D>
      </div>
    </BottomSheet>
  )
}
