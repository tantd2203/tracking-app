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

…
