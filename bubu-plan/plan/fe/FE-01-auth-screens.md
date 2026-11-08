# FE-01 · Màn Đăng nhập, Đăng ký và chặn route

**Phụ thuộc:** BE-03 · **Ước lượng:** 3 giờ · **Nhánh:** `feat/fe-01-auth`

## Mục tiêu

Đăng nhập/đăng ký thật bằng email; chưa đăng nhập thì mọi màn đều chuyển về `/login`.

## Tham chiếu

- Ảnh: `plan/design/screens/01-login.png`
- Đã có: `src/features/auth/LoginPage.tsx` (giao diện + kiểm tra lỗi, chưa nối API)
- Hook: `useSession`, `useSignIn`, `useSignUp` (BE-03)

## Phạm vi

**Làm:** nối `LoginPage` với `useSignIn`; màn `RegisterPage` (`/register`); `RequireAuth` bọc các route trong app; đã đăng nhập mà vào `/login` thì chuyển `/boards`.
**Không làm:** nút Google (chỉ để toast "sắp có" – FE-12 nối sau BE-10).

## Yêu cầu chi tiết

1. `RegisterPage`: cùng bố cục với Đăng nhập (vùng Bubu phía trên, bóng thoại "Tạo tài khoản để bơi cùng Bubu nhé!"), các ô: Tên hiển thị, Email, Mật khẩu, Nhập lại mật khẩu; nút "TẠO TÀI KHOẢN"; link "Đã có tài khoản? Đăng nhập".
2. Kiểm tra trước khi gọi API: email hợp lệ, mật khẩu ≥ 6, nhập lại khớp ("Mật khẩu nhập lại chưa khớp.").
3. Đăng ký xong: nếu Supabase yêu cầu xác nhận email thì hiện màn thông báo có Bubu "Kiểm tra email để kích hoạt tài khoản nhé!", ngược lại vào `/boards`.
4. Nút đang gửi: chữ "ĐANG ĐĂNG NHẬP…", disable.
5. `RequireAuth` (`src/app/RequireAuth.tsx`): `loading` → màn chờ có Bubu nhấp nhô ở giữa; không có session → `<Navigate to="/login" replace />`. Chế độ demo (chưa có `.env.local`) → cho qua.
6. Bàn phím iPhone: `inputMode="email"`, `autoComplete` đúng (`email`, `current-password`, `new-password`), Enter ở ô cuối gửi form.

## File dự kiến

`src/features/auth/LoginPage.tsx`, `src/features/auth/RegisterPage.tsx`, `src/app/RequireAuth.tsx`, `src/app/router.tsx`

## Tiêu chí hoàn thành

- [ ] Đăng ký → đăng nhập → tải lại trang vẫn ở trong app
- [ ] Sai mật khẩu hiện "Email hoặc mật khẩu chưa đúng."
- [x] Gõ `/boards` khi chưa đăng nhập → về `/login`
- [x] Đăng xuất ở tab Tôi → về `/login`, bấm Back không vào lại được
- [ ] Giao diện khớp ảnh 01 ở light và dark
- [x] Test component: hiện đúng câu lỗi email / mật khẩu (Testing Library)

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/01-conventions.md, plan/fe/FE-01-auth-screens.md.
Xem ảnh plan/design/screens/01-login.png (đính kèm). Làm task FE-01: nối LoginPage với useSignIn, tạo RegisterPage,
RequireAuth và cập nhật router. Dùng component sẵn có (Button3D, TextField, Whale). Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

…

- Đã làm: `LoginPage` nối `useSignIn` (lỗi hiện ngay trên form), `RegisterPage` (`/register`, có màn "Kiểm tra email" khi cần xác nhận), `RequireAuth` và `GuestOnly` trong `src/app/RequireAuth.tsx`, router chia 3 nhóm route, `MePage` đăng xuất bằng `useSignOut` và chuyển về `/login` với `replace`.
- Lỗi xác thực được đánh dấu `AuthError`, nên `toastError` bỏ qua và chỉ hiện trên form (tránh hiện 2 thông báo).
- Test: `LoginPage.test.tsx` (email sai, mật khẩu ngắn, sai mật khẩu). Tổng 28 test pass.
- Chưa kiểm tra trên trình duyệt, cần làm tay: đăng nhập rồi tải lại trang, gõ `/boards` khi chưa đăng nhập, đăng xuất rồi bấm Back, light/dark so với ảnh 01.
- Đăng ký chỉ chạy được khi bật lại "Allow new users to sign up" trên Supabase (đang tắt theo BE-01). Khi tắt, form báo lỗi chung.
- Google chỉ hiện toast "Đăng nhập Google sắp có" (FE-12 nối sau BE-10).

- Kiểm tra trên trình duyệt (Playwright, Chromium, viewport 390×844, server local, tài khoản thật): /boards khi chưa đăng nhập → /login ✅; đăng nhập → /boards ✅; tải lại vẫn ở trong app ✅; đăng xuất → /login và Back không vào /boards ✅; không có lỗi JS ✅.
- Giao diện màn Đăng nhập khớp ảnh 01 ở light mode (bố cục, bóng thoại, câu chữ, nút). Chưa kiểm tra dark mode.
- Chưa kiểm tra tay: đăng ký (đang tắt đăng ký công khai trên Supabase), thông báo sai mật khẩu trên màn hình, dark mode.
