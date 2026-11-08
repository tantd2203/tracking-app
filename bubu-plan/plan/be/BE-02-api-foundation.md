# BE-02 · Nền tảng lớp API (`src/api`)

**Phụ thuộc:** BE-01 · **Ước lượng:** 2–3 giờ · **Nhánh:** `feat/be-02-api-foundation`

## Mục tiêu

Tạo bộ khung để mọi task BE sau chỉ việc thêm hàm: kiểu dữ liệu, query key, xử lý lỗi, cách viết hook query/mutation thống nhất.

## Tham chiếu

- `plan/01-conventions.md` mục Thư mục
- `supabase/migrations/0001_init.sql`

## Phạm vi

**Làm:** `database.types.ts` (sinh tự động), `types.ts`, `keys.ts`, `client.ts`, `errors.ts`, 1 hook mẫu.
**Không làm:** hook nghiệp vụ cụ thể (BE-03 trở đi).

## Yêu cầu chi tiết

1. Chạy `npm run db:types` để sinh `src/api/database.types.ts`; truyền kiểu này vào `createClient<Database>()` trong `src/lib/supabase.ts`.
2. `src/api/client.ts`: hàm `db()` trả về client đã kiểu hoá, **ném lỗi rõ ràng** `SupabaseNotConfiguredError` nếu thiếu `.env.local`.
3. `src/api/types.ts`: kiểu ứng dụng lấy từ `Database['public']['Tables'][...]['Row']`:
   `Board`, `List`, `Card`, `Label`, `ChecklistItem`, `Activity`, `Profile`, `ListKey = 'todo' | 'doing' | 'done'`, `Priority = 'none' | 'low' | 'med' | 'high'`.
4. `src/api/keys.ts`: query key tập trung, ví dụ
   ```ts
   export const qk = {
     session: ['session'] as const,
     profile: ['profile'] as const,
     boards: ['boards'] as const,
     board: (id: string) => ['board', id] as const,
     card: (id: string) => ['card', id] as const,
     labels: ['labels'] as const,
     dayCounts: (from: string, to: string) => ['dayCounts', from, to] as const,
     dayCards: (day: string) => ['dayCards', day] as const,
   }
   ```
5. `src/api/errors.ts`: `unwrap({ data, error })` – ném `Error` có message tiếng Việt thân thiện; `toastError(e)` gọi `toast()` với câu "Có lỗi, thử lại giúp Bubu nhé".
6. Cấu hình `QueryClient` trong `main.tsx`: `onError` mặc định của mutation gọi `toastError`.
7. Viết 1 hook mẫu `useHealthcheck()` (select 1 dòng `profiles`) để kiểm tra kết nối, xoá sau khi BE-03 xong.

## File dự kiến

`src/api/{database.types.ts,client.ts,types.ts,keys.ts,errors.ts}`, `src/lib/supabase.ts`, `src/main.tsx`

## Tiêu chí hoàn thành

- [x] `database.types.ts` sinh từ DB thật, client đã kiểu hoá
- [x] Gọi API khi thiếu `.env.local` báo lỗi rõ ràng, app không trắng màn
- [x] Lỗi mutation tự hiện toast
- [x] Unit test cho `unwrap()` (trả data / ném lỗi)
- [x] lint, test, build qua

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/01-conventions.md, plan/be/BE-02-api-foundation.md.
Làm task BE-02: dựng nền tảng src/api (types, keys, client, errors, cấu hình QueryClient).
Trước khi code, liệt kê file sẽ tạo/sửa. Xong chạy lint/test/build, tick tiêu chí và ghi "Ghi chú sau khi làm".
```

## Ghi chú sau khi làm

- Đã sinh `src/api/database.types.ts` (8 bảng) bằng `npm run db:types`. `src/lib/supabase.ts` dùng `createClient<Database>`.
- `src/api/client.ts`: `db()` ném `SupabaseNotConfiguredError` khi thiếu `.env.local`. Có test (`client.test.ts`).
- `src/api/errors.ts`: `unwrap()` ném `Error` tiếng Việt, lỗi gốc giữ trong `cause`. `toastError()` hiện toast; nếu thiếu cấu hình thì báo riêng. Có test (`errors.test.ts`).
- `src/main.tsx`: `mutations.onError` = `toastError`. Đã xoá `onError` riêng trong `BoardsPage` để không hiện hai toast.
- `src/api/keys.ts` và `src/api/types.ts` theo spec.
- `useHealthcheck()` trong `src/api/healthcheck.ts` là hook mẫu. Chưa dùng ở đâu. Xoá sau khi BE-03 xong.
- Chưa kiểm tra trên trình duyệt: toast khi mutation lỗi và màn hình khi thiếu `.env.local`. Kiểm tra bằng test và đọc code.
- `src/features/boards/` và `src/lib/boards.ts` vẫn dùng `supabase` từ `src/lib` (đã có từ việc 1). BE-05 sẽ chuyển sang `src/api/boards.ts`.
- `LoginPage.tsx` và `MePage.tsx` vẫn import `lib/supabase` trực tiếp. BE-03 sẽ chuyển sang hook auth.
