import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'

const { mutateAsync } = vi.hoisted(() => ({ mutateAsync: vi.fn() }))

vi.mock('../../api/auth', () => ({
  useSession: () => ({ session: null, loading: false, demo: false }),
  useSignIn: () => ({ mutateAsync, isPending: false }),
}))

import LoginPage from './LoginPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

function fill(email: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } })
  fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'ĐĂNG NHẬP' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('email sai định dạng thì báo lỗi và không gọi API', async () => {
    renderPage()
    fill('khong-phai-email', '123456')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email chưa đúng định dạng, kiểm tra lại giúp Bubu nhé.',
    )
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('mật khẩu dưới 6 ký tự thì báo lỗi và không gọi API', async () => {
    renderPage()
    fill('minh@example.com', '12345')
    expect(await screen.findByRole('alert')).toHaveTextContent('Mật khẩu cần ít nhất 6 ký tự.')
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('sai mật khẩu thì hiện đúng câu lỗi từ API', async () => {
    mutateAsync.mockRejectedValue(new Error('Email hoặc mật khẩu chưa đúng.'))
    renderPage()
    fill('minh@example.com', 'sai-mat-khau')
    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu chưa đúng.')
  })
})
