import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'
type Size = 'lg' | 'md' | 'sm'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  block?: boolean
  children: ReactNode
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white [--shade:var(--color-brand-shade)]',
  secondary: 'bg-surface text-ink border-2 border-line [--shade:var(--line)]',
  danger: 'bg-red text-white [--shade:#9F1D14]',
}

const SIZE: Record<Size, string> = {
  lg: 'h-[58px] rounded-[18px] text-[17px] tracking-[.6px] [--depth:5px]',
  md: 'h-11 rounded-[14px] px-3.5 text-[15px] [--depth:4px]',
  sm: 'h-[42px] rounded-xl px-3.5 text-sm [--depth:3px]',
}

/** Nút có bóng khối kiểu Duolingo, bấm vào thì lún xuống. */
export function Button3D({
  variant = 'primary',
  size = 'lg',
  block = false,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex cursor-pointer items-center justify-center gap-1.5 font-black select-none',
        'shadow-[0_var(--depth)_0_var(--shade)] transition-[transform,box-shadow] duration-75',
        'active:translate-y-(--depth) active:shadow-none disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT[variant],
        SIZE[size],
        block ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
