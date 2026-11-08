import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession, useSignUp } from '../../api/auth'
import { Button3D } from '../../components/Button3D'
import { TextField } from '../../components/TextField'
import { Whale } from '../../components/Whale'
import { toast } from '../../components/toast'

/** Màn 1b – Đăng ký (`/register`). Cùng bố cục với màn Đăng nhập. */
export default function RegisterPage() {
  const navigate = useNavigate()
  const { demo } = useSession()
  const signUp = useSignUp()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Email chưa đúng định dạng, kiểm tra lại giúp Bubu nhé.')
    }
    if (password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.')
    if (password !== confirm) return setError('Mật khẩu nhập lại chưa khớp.')

    if (demo) {
      toast('Chưa cấu hình Supabase – đang chạy chế độ demo')
      return navigate('/boards', { replace: true })
    }
    try {
      const result = await signUp.mutateAsync({
        email,
        password,
        displayName: displayName.trim() || undefined,
      })
      if (result.needsConfirm) setNeedsConfirm(true)
      else navigate('/boards', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi, thử lại giúp Bubu nhé')
    }
  }

  if (needsConfirm) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <Whale mood="happy" size={180} spout />
        <h1 className="text-2xl font-black">Kiểm tra email để kích hoạt tài khoản nhé!</h1>
        <p className="text-[15px] font-bold text-ink2">
          Sau khi xác nhận, quay lại đăng nhập để bắt đầu.
        </p>
        <Link to="/login" className="font-black text-brand">
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="safe-top flex flex-col items-center rounded-b-[36px] bg-hero px-6 pb-6">
        <div className="relative mt-4 mb-2 animate-pop rounded-2xl bg-surface px-4 py-2.5 text-center shadow-block-sm">
          <p className="text-[15px] font-black">Tạo tài khoản để bơi cùng Bubu nhé!</p>
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
          autoComplete="name"
          placeholder="Tên hiển thị"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
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
          autoComplete="new-password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
        />
        <TextField
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            setError('')
          }}
        />
        {error && (
          <p role="alert" className="rounded-xl bg-red-bg px-3 py-2 text-sm font-bold text-red">
            {error}
          </p>
        )}

        <Button3D type="submit" disabled={signUp.isPending} className="mt-1">
          {signUp.isPending ? 'ĐANG TẠO TÀI KHOẢN…' : 'TẠO TÀI KHOẢN'}
        </Button3D>

        <p className="mt-2 text-center text-sm font-bold text-ink2">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-black text-brand">
            Đăng nhập
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
