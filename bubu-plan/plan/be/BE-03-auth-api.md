# BE-03 · API đăng nhập & phiên

**Phụ thuộc:** BE-02 · **Ước lượng:** 2 giờ · **Nhánh:** `feat/be-03-auth-api`

## Mục tiêu

Cung cấp hook để FE-01 làm màn Đăng nhập/Đăng ký và chặn route khi chưa đăng nhập.

## Phạm vi

**Làm:** `src/api/auth.ts`, `AuthProvider`.
**Không làm:** giao diện (FE-01), Google (BE-10).

## Yêu cầu chi tiết

`src/api/auth.ts`:

```ts
export function useSession(): { session: Session | null; loading: boolean }
export function useSignIn(): UseMutationResult<void, Error, { email: string; password: string }>
export function useSignUp(): UseMutationResult<
  { needsConfirm: boolean },
  Error,
  { email: string; password: string; displayName?: string }
>
export function useSignOut(): UseMutationResult<void, Error, void>
```

- `AuthProvider` (`src/app/AuthProvider.tsx`) lắng nghe `supabase.auth.onAuthStateChange`, lưu session vào context; khi đăng xuất gọi `queryClient.clear()`.
- Đổi thông báo lỗi Supabase sang tiếng Việt: sai mật khẩu → "Email hoặc mật khẩu chưa đúng."; email đã tồn tại → "Email này đã có tài khoản, đăng nhập nhé."; mạng → "Mất kết nối, thử lại giúp Bubu nhé."
- `useSignUp` truyền `displayName` vào `options.data.display_name`; sửa trigger trong migration mới `0002_…` nếu muốn lấy tên này (hoặc để BE-09 cập nhật sau – ghi rõ quyết định).
- Chế độ demo (chưa có `.env.local`): `useSession` trả session giả `null` + cờ `demo: true` để FE vẫn vào được app.

## File dự kiến

`src/api/auth.ts`, `src/app/AuthProvider.tsx`, `src/main.tsx`

## Tiêu chí hoàn thành

- [x] Đăng nhập/đăng xuất cập nhật session ngay, không cần tải lại trang
- [x] Mở lại app vẫn giữ phiên (persistSession)
- [x] Lỗi hiển thị bằng câu tiếng Việt ở trên
- [x] Đăng xuất xoá cache TanStack Query
- [x] Test hàm đổi thông báo lỗi

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/01-conventions.md, plan/be/BE-03-auth-api.md.
Làm task BE-03: hook useSession/useSignIn/useSignUp/useSignOut và AuthProvider. Chưa làm giao diện.
Liệt kê file trước khi code; xong chạy lint/test/build, tick tiêu chí, ghi chú.
```

## Ghi chú sau khi làm

- `src/app/authContext.ts` (context, không có JSX) và `src/app/AuthProvider.tsx` (lắng nghe `onAuthStateChange`, `SIGNED_OUT` gọi `queryClient.clear()`).
- `src/api/auth.ts`: `useSession` (kèm cờ `demo`), `useSignIn`, `useSignUp`, `useSignOut`, và `mapAuthError()` đổi lỗi sang tiếng Việt.
- `persistSession: true` đã có từ `src/lib/supabase.ts`, giữ phiên khi mở lại app.
- Quyết định `display_name`: không sửa trigger, để BE-09 cập nhật hồ sơ sau khi đăng nhập. `useSignUp` vẫn gửi `display_name` trong `user_metadata`.
- Lỗi đăng nhập/đăng ký cũng đi qua `mutations.onError` nên hiện toast câu chung. FE-01 nên hiện câu lỗi cụ thể ngay trên form, và có thể bỏ toast cho các mutation này.
- `useSignUp` chỉ dùng được khi bật lại "Allow new users to sign up" trên Supabase. Hiện đang tắt, theo quyết định ở BE-01.
- Đã xoá `src/api/healthcheck.ts` (mẫu của BE-02).
- Chưa kiểm tra trên trình duyệt: session cập nhật ngay sau đăng nhập/đăng xuất, và phiên giữ lại khi tải lại trang. Kiểm tra bằng code và test; cần thử tay ở FE-01.
- `LoginPage.tsx` và `MePage.tsx` vẫn gọi `supabase` trực tiếp. FE-01 và FE-12 sẽ chuyển sang các hook này.
