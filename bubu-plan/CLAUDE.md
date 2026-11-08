# CLAUDE.md – hướng dẫn cho AI khi code dự án Bubu

Đọc file này trước mọi task. Kế hoạch chi tiết nằm trong `plan/`.

## Dự án

Bubu: PWA Kanban cá nhân (React 19 + TypeScript 6 + Vite + Tailwind v4 + Supabase), có heatmap kiểu GitHub, streak, báo cáo, linh vật cá voi Bubu. Giao diện tiếng Việt, mobile-first (khung 390 × 844), có light/dark.

- Tổng quan + quy tắc nghiệp vụ: `plan/00-overview.md` (quy tắc trong đó là bắt buộc)
- Quy ước code, Git, "thế nào là xong": `plan/01-conventions.md`
- Thiết kế: `plan/design/` (ảnh từng màn + file HTML gốc)
- Task đang làm: file `plan/fe/FE-xx-*.md` hoặc `plan/be/BE-xx-*.md` được giao

## Lệnh

```bash
npm run dev        # http://localhost:5173 (thêm --host để mở từ điện thoại)
npm run lint       # ESLint
npm test           # Vitest
npm run build      # tsc + vite build
npm run format     # Prettier
```

## Luật

1. Chỉ làm đúng phạm vi task được giao. Cần đổi schema DB, token màu, cấu trúc thư mục hoặc thêm thư viện mới ngoài plan → hỏi trước.
2. FE không import `src/lib/supabase.ts` trực tiếp, chỉ dùng hook trong `src/api/`.
3. Dùng token Tailwind (`bg-surface`, `text-ink2`, `border-line`, `bg-brand`, `bg-heat-N`, `rounded-card`, `animate-pop`…), không viết mã màu mới trong component.
4. Giữ đúng câu chữ trong thiết kế (bảng ở `plan/design/README.md`).
5. Ngày dùng giờ máy: `toLocalISO()` trong `src/lib/date.ts`. Hàm tính toán để ở `src/lib/` và có unit test.
6. Thay đổi DB = file mới trong `supabase/migrations/` (không sửa file cũ), bật RLS cho bảng mới.
7. Trước khi báo xong: chạy `npm run lint && npm test && npm run build`, kiểm tra cả light và dark, tick "Tiêu chí hoàn thành" và ghi "Ghi chú sau khi làm" trong file task.
8. Không commit `.env.local`, không dùng khoá `service_role` ở client.
