import { useState, type ReactNode } from 'react'
import { BottomSheet } from '../../components/BottomSheet'
import { Button3D } from '../../components/Button3D'
import { ScreenHeader } from '../../components/ScreenHeader'
import { Segmented } from '../../components/Segmented'
import { TextField } from '../../components/TextField'
import { Toggle } from '../../components/Toggle'
import { Whale, type WhaleMood } from '../../components/Whale'
import { showUndo, toast } from '../../components/toast'

const MOODS: WhaleMood[] = ['happy', 'calm', 'cheer', 'sad']

/** Trang /dev/components: xem toàn bộ component để so với file thiết kế. */
export default function ComponentsPage() {
  const [seg, setSeg] = useState<'todo' | 'doing' | 'done'>('todo')
  const [on, setOn] = useState(true)
  const [sheet, setSheet] = useState(false)
  const [text, setText] = useState('')

  return (
    <div className="pb-10">
      <ScreenHeader back title="Bộ component" subtitle="Giai đoạn 0 – design system" />
      <div className="flex flex-col gap-6 px-5">
        <Section title="Bubu – 4 tâm trạng">
          <div className="grid grid-cols-2 gap-3">
            {MOODS.map((m) => (
              <div key={m} className="flex flex-col items-center rounded-tile bg-surface p-3">
                <Whale mood={m} size={110} spout={m === 'cheer'} />
                <code className="mt-1 text-xs text-ink2">{m}</code>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center rounded-tile bg-surface pt-24 pb-4">
            <Whale mood="cheer" size={150} burst />
          </div>
        </Section>

        <Section title="Button3D">
          <Button3D block>ĐĂNG NHẬP</Button3D>
          <Button3D block variant="secondary">
            Đăng ký
          </Button3D>
          <div className="flex gap-3">
            <Button3D size="md">+ Tạo</Button3D>
            <Button3D size="sm">Hoàn thành</Button3D>
            <Button3D size="sm" variant="danger">
              Xoá
            </Button3D>
          </div>
        </Section>

        <Section title="Segmented · Toggle">
          <Segmented
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'todo', label: 'To Do' },
              { value: 'doing', label: 'Doing' },
              { value: 'done', label: 'Done' },
            ]}
          />
          <Toggle checked={on} onChange={setOn} label="Thử công tắc" />
        </Section>

        <Section title="TextField">
          <TextField
            label="Tên board"
            maxLength={40}
            showCounter
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ví dụ: Học tiếng Nhật"
          />
          <TextField
            placeholder="Email"
            error="Email chưa đúng định dạng, kiểm tra lại giúp Bubu nhé."
          />
        </Section>

        <Section title="Màu heatmap">
          <div className="flex gap-2">
            {['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'].map((c) => (
              <span key={c} className={`size-9 rounded-lg ${c}`} />
            ))}
          </div>
        </Section>

        <Section title="Sheet · Toast · Hoàn tác">
          <div className="flex flex-wrap gap-3">
            <Button3D size="sm" variant="secondary" onClick={() => setSheet(true)}>
              Mở sheet
            </Button3D>
            <Button3D size="sm" variant="secondary" onClick={() => toast('Đã chuyển sang Doing')}>
              Toast
            </Button3D>
            <Button3D
              size="sm"
              variant="secondary"
              onClick={() => showUndo('Đã xoá board “Chuyển nhà”', () => undefined)}
            >
              Hoàn tác
            </Button3D>
          </div>
        </Section>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Sửa board">
        <p className="pb-6 font-bold text-ink2">Nội dung sheet đặt ở đây.</p>
      </BottomSheet>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[13px] font-black tracking-wide text-ink2 uppercase">{title}</h2>
      {children}
    </section>
  )
}
