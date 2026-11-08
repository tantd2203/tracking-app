import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { applyTheme } from '../app/theme'
import { formatMonthYear } from '../lib/date'
import { db } from './client'
import { useSession } from './auth'
import { toastError, unwrap } from './errors'
import { qk } from './keys'
import type { Profile } from './types'

export type ProfileView = Profile & { email: string; memberSince: string }

type ProfilePatch = Partial<
  Pick<Profile, 'display_name' | 'dark_mode' | 'reminder_time' | 'language'>
>

/** Hồ sơ của tài khoản đang đăng nhập, kèm email và ngày tham gia. */
export function useProfile(): UseQueryResult<ProfileView> {
  const { demo, session } = useSession()
  const userId = session?.user.id ?? ''
  const email = session?.user.email ?? ''
  return useQuery({
    queryKey: qk.profile,
    queryFn: async () => {
      const res = await db().from('profiles').select('*').eq('user_id', userId).single()
      const row = unwrap(res)
      return { ...row, email, memberSince: formatMonthYear(new Date(row.created_at)) }
    },
    enabled: !demo && Boolean(session),
  })
}

/**
 * Sửa hồ sơ. Đổi `dark_mode` thì áp dụng chế độ tối ngay trên máy này.
 * Cache cập nhật trước, lỗi thì quay lại.
 */
export function useUpdateProfile(): UseMutationResult<
  Profile,
  Error,
  ProfilePatch,
  { prev: ProfileView | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch) => {
      const { data: auth } = await db().auth.getUser()
      const userId = auth.user?.id ?? ''
      const res = await db().from('profiles').update(patch).eq('user_id', userId).select().single()
      return unwrap(res)
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: qk.profile })
      const prev = qc.getQueryData<ProfileView>(qk.profile)
      if (prev) qc.setQueryData<ProfileView>(qk.profile, { ...prev, ...patch })
      if (patch.dark_mode !== undefined) applyTheme(patch.dark_mode ? 'dark' : 'light')
      return { prev }
    },
    onError: (e, _patch, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(qk.profile, ctx.prev)
        applyTheme(ctx.prev.dark_mode ? 'dark' : 'light')
      }
      toastError(e)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.profile }),
  })
}
