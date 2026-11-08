# BE-01 · Dựng Supabase và chạy migration đầu tiên

**Phụ thuộc:** không · **Ước lượng:** 1–2 giờ (phần lớn làm tay trên dashboard) · **Nhánh:** `chore/be-01-supabase-setup`

## Mục tiêu

Có project Supabase chạy thật, schema `0001_init.sql` đã áp dụng, app local đọc được `.env.local`.

## Tham chiếu

- `supabase/migrations/0001_init.sql`
- `README.md` mục "Kết nối Supabase"
- Tab Kỹ thuật trong tài liệu kế hoạch, mục 7.1

## Phạm vi

**Làm:** tạo project, chạy migration, cấu hình Auth cơ bản, `.env.local`, kiểm tra RLS, cài Supabase CLI.
**Không làm:** RPC (BE-04), Google OAuth (BE-10).

## Yêu cầu chi tiết

1. Tạo project trên supabase.com, region **Singapore**, đặt mật khẩu DB và lưu vào trình quản lý mật khẩu.
2. SQL Editor → chạy toàn bộ `0001_init.sql`. Kiểm tra trong Table Editor có 8 bảng: `profiles, boards, lists, cards, labels, card_labels, checklist_items, activities`, tất cả có biểu tượng RLS bật.
3. Authentication → Providers → Email: bật. Tắt "Confirm email" (app cá nhân) **hoặc** giữ bật và ghi lại quyết định ở "Ghi chú".
4. Authentication → URL Configuration: Site URL = `http://localhost:5173` (BE-10 sẽ thêm domain Vercel).
5. Copy `.env.example` → `.env.local`, điền URL + anon key. Chạy `npm run dev`: dòng "Chế độ demo" ở màn Đăng nhập phải biến mất.
6. Cài Supabase CLI (`npm i -D supabase` hoặc theo hướng dẫn chính thức), chạy `npx supabase login` và `npx supabase link --project-ref <ref>`. Thêm script `"db:push": "supabase db push"` và `"db:types": "supabase gen types typescript --linked > src/api/database.types.ts"` vào `package.json`.
7. Kiểm tra RLS: tạo 2 user thử trong Authentication → Users. Dùng SQL Editor với `set local role authenticated; set local request.jwt.claims = '{"sub":"<uuid user A>"}';` rồi `select * from boards;` – chỉ thấy dòng của A.

## File dự kiến

- `package.json` (thêm script `db:push`, `db:types`, devDependency `supabase`)
- `.env.local` (KHÔNG commit)

## Tiêu chí hoàn thành

- [x] 8 bảng tồn tại, RLS bật cho tất cả
- [x] Đăng ký user mới tự sinh 1 dòng trong `profiles` (trigger `on_auth_user_created`)
- [x] App local không còn "Chế độ demo"
- [x] `npx supabase link` thành công, script `db:push` và `db:types` chạy được
- [x] User A không đọc được dữ liệu của user B

## Kiểm thử

Làm tay theo bước 7. Ghi kết quả vào "Ghi chú sau khi làm".

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md và plan/be/BE-01-supabase-setup.md.
Mình sẽ tự làm các bước trên dashboard Supabase. Bạn hãy:
1) thêm devDependency `supabase` và 2 script db:push, db:types vào package.json;
2) viết đoạn SQL kiểm tra RLS (bước 7) để mình dán vào SQL Editor;
3) liệt kê checklist từng bước mình cần bấm trên dashboard.
Không sửa file migration 0001.
```

## Ghi chú sau khi làm

- Confirm email: **tắt** (app cá nhân, không có màn đăng ký).
- Project ref: `djcmtwevzpalkajinylx` (project `bubu-production`, region Singapore). Project này lấy từ `.env.local`.
- `npx supabase link --project-ref djcmtwevzpalkajinylx` đã thành công (`supabase/.temp/project-ref` có ref này).
- Script đã đổi sang `--remote` (cờ `--linked` bị CLI đánh dấu deprecated và sẽ bị bỏ ở v4):
  - `db:push`: `supabase db push --remote`
  - `db:types`: `supabase gen types typescript --remote > src/api/database.types.ts`
- Lịch sử migration trên remote trống vì `0001` được chạy bằng SQL Editor. Đã chạy `supabase migration repair --status applied 0001 --remote --yes` (có xác nhận của chủ project). Sau đó `migration list --remote` khớp, và `db push --dry-run` báo "Remote database is up to date".
- `src/api/` được tạo để chứa `database.types.ts` (sinh bởi `npm run db:types`, 8 bảng). BE-02 sẽ thêm `types.ts`, `keys.ts` và các hàm API vào cùng thư mục.
