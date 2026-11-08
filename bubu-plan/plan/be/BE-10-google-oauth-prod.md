# BE-10 · Đăng nhập Google & cấu hình production

**Phụ thuộc:** BE-03 · **Ước lượng:** 2 giờ · **Nhánh:** `feat/be-10-google-oauth`

## Mục tiêu

Nút "Tiếp tục với Google" hoạt động trên Vercel; Auth của Supabase nhận đúng domain production và preview.

## Yêu cầu chi tiết

1. Google Cloud Console (miễn phí): tạo OAuth Client ID loại Web; Authorized redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Supabase → Authentication → Providers → Google: dán Client ID/Secret.
3. Supabase → URL Configuration:
   - Site URL = domain production Vercel (vd. `https://bubu-app.vercel.app`)
   - Redirect URLs thêm: `http://localhost:5173/**`, `https://bubu-app.vercel.app/**`, `https://bubu-app-*-<tài-khoản>.vercel.app/**` (preview)
4. `src/api/auth.ts` thêm:
   ```ts
   export function useSignInWithGoogle(): Mutation<void, void>
   // supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/boards` } })
   ```
5. Kiểm tra trên iPhone ở chế độ PWA (mở từ màn hình chính): OAuth mở Safari rồi quay lại. Nếu không quay lại được app PWA, ghi chú và đề xuất giữ đăng nhập email làm chính.

## Tiêu chí hoàn thành

- [ ] Đăng nhập Google thành công ở localhost và trên domain Vercel
- [ ] User Google mới có profile + board mẫu (trigger BE-04)
- [ ] Đã ghi lại hành vi OAuth trong PWA iPhone

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/be/BE-10-google-oauth-prod.md, src/api/auth.ts.
Thêm useSignInWithGoogle vào src/api/auth.ts và liệt kê checklist cấu hình Google Cloud + Supabase để mình làm tay.
```

## Ghi chú sau khi làm

- Đã thử rồi gỡ bỏ: `useSignInWithGoogle` và nút "Tiếp tục với Google" đã bị xoá theo yêu cầu. Đăng nhập chỉ còn bằng email. Các bước cấu hình Google bên dưới không còn cần thiết trừ khi bật lại tính năng.
- Chưa làm (cần làm tay trên dashboard, không thể làm bằng code):
  1. Google Cloud Console: tạo OAuth Client ID loại Web, Authorized redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback`.
  2. Supabase → Authentication → Providers → Google: dán Client ID và Secret.
  3. Supabase → URL Configuration: Site URL = domain production; Redirect URLs gồm `http://localhost:5173/**`, domain production `/**`, và preview `https://<tên>-*-<tài-khoản>.vercel.app/**`.
  4. Kiểm tra đăng nhập Google trên localhost và domain Vercel, và xem user mới có profile và board mẫu.
  5. Thử trên iPhone ở chế độ PWA: OAuth có quay lại app được không. Nếu không, ghi lại và giữ đăng nhập email làm chính.
- `npm run lint`, `npm test` (88 test) và `npm run build` đều qua.
