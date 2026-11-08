import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession, useSignIn } from '../../api/auth'
import { Button3D } from '../../components/Button3D'
import { TextField } from '../../components/TextField'
import { Whale } from '../../components/Whale'
import { toast } from '../../components/toast'

/** Màn 1 – Đăng nhập. Câu báo lỗi giữ đúng như thiết kế. */
export default function LoginPage() {
  const navigate = useNavigate()
  const { demo } = useSession()
  const signIn = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Email chưa đúng định dạng, kiểm tra lại giúp Bubu nhé.')
    }
    if (password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.')

    if (demo) {
      toast('Chưa cấu hình Supabase – đang chạy chế độ demo')
      return navigate('/boards', { replace: true })
    }
    try {
      await signIn.mutateAsync({ email, password })
      navigate('/boards', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi, thử lại giúp Bubu nhé')
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Vùng Bubu phía trên */}
      <div className="safe-top flex flex-col items-center rounded-b-[36px] bg-hero px-6 pb-6">
        <div className="relative mt-4 mb-2 animate-pop rounded-2xl bg-surface px-4 py-2.5 text-center shadow-block-sm">
          <p className="text-[15px] font-black">Chào bạn! Mình là Bubu 👋</p>
          <p className="text-[13px] font-bold text-ink2">Cùng bơi qua từng việc nhé!</p>
          <span className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-surface" />
        </div>
        <Whale mood="happy" size={200} spout />
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-6 pt-6 pb-8"
      >
        <div className="mb-2 text-center">
          <p className="text-[40px] leading-none font-black tracking-tight text-brand">bubu</p>
          <p className="mt-1.5 text-[15px] font-bold text-ink2">
            Mỗi card xong là một ô biển xanh.
          </p>
        </div>

        <TextField
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
        />
        <TextField
          type="password"
          autoComplete="current-password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
        />
        {error && (
          <p role="alert" className="rounded-xl bg-red-bg px-3 py-2 text-sm font-bold text-red">
            {error}
          </p>
        )}

        <Button3D type="submit" disabled={signIn.isPending} className="mt-1">
          {signIn.isPending ? 'ĐANG ĐĂNG NHẬP…' : 'ĐĂNG NHẬP'}
        </Button3D>

        <div className="my-1 flex items-center gap-3 text-xs font-black text-ink2">
          <span className="h-0.5 flex-1 bg-line" />
          HOẶC
          <span className="h-0.5 flex-1 bg-line" />
        </div>

        <Button3D
          type="button"
          variant="secondary"
          className="h-[54px]"
          onClick={() => toast('Đăng nhập Google sắp có')}
        >
          Tiếp tục với Google
        </Button3D>

        <p className="mt-2 text-center text-sm font-bold text-ink2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-black text-brand">
            Đăng ký
          </Link>
        </p>
        {demo && (
          <p className="mt-auto text-center text-xs font-bold text-ink2">
            Chế độ demo · thêm .env.local để kết nối Supabase
          </p>
        )}
      </form>
    </div>
  )
}
