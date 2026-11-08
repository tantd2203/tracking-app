# 01 · Quy ước

## Thư mục

```
src/
├─ api/            (BE) hàm gọi Supabase + hook TanStack Query, mỗi domain 1 file: boards.ts, cards.ts…
│  ├─ types.ts     kiểu dữ liệu dùng chung (Board, Card, Label…)
│  └─ keys.ts      query key tập trung
├─ app/            router, layout, guard đăng nhập, theme
├─ components/     component dùng chung, không biết gì về dữ liệu
├─ features/<x>/   màn hình + component riêng của màn
├─ lib/            hàm thuần (ngày, heatmap, báo cáo) – luôn có test
└─ styles/         token + Tailwind
supabase/migrations/   0001_init.sql, 0002_….sql (không sửa file cũ, chỉ thêm file mới)
```

## Code

- TypeScript strict, không dùng `any`. Kiểu DB lấy từ `src/api/types.ts`.
- Component: function component, tên PascalCase, mỗi file một component chính. Màn hình `export default`.
- **FE không import `supabase` trực tiếp**; luôn dùng hook trong `src/api`.
- Màu, bo góc, animation **chỉ dùng token** (`bg-surface`, `text-ink2`, `border-line`, `bg-brand`, `bg-heat-3`, `rounded-card`, `animate-pop`…). Không viết mã hex mới trong component, trừ màu board/nhãn đã định nghĩa trong `src/lib/palette.ts` (tạo ở FE-02).
- Chữ trên giao diện: **tiếng Việt, giữ đúng câu chữ trong thiết kế** (xem bảng ở `design/README.md`).
- Hàm tính toán (ngày, streak, báo cáo, vị trí card) để trong `src/lib/` dạng hàm thuần, có unit test.
- Ngày: luôn dùng giờ máy người dùng (`toLocalISO()` trong `src/lib/date.ts`), không dùng `toISOString().slice(0,10)` vì lệch múi giờ.
- Rung: `if (navigator.vibrate) navigator.vibrate(…)` – Safari iPhone không hỗ trợ.

## Git

- Nhánh: `feat/<mã-task>-<mô-tả>` (vd. `feat/be-05-boards-api`, `feat/fe-05-drag-drop`), `fix/<mô-tả>`.
- Commit (Conventional Commits): `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `db:`.
  Ví dụ: `feat(fe-05): kéo card giữa các cột bằng dnd-kit`.
- Mỗi task = 1 pull request; tiêu đề PR = mã task + tên task.
- Đổi DB = file migration mới, đánh số tăng dần.

## "Xong" nghĩa là

- [ ] Đạt hết **Tiêu chí hoàn thành** trong file task
- [ ] `npm run lint`, `npm test`, `npm run build` đều qua
- [ ] Giao diện khớp ảnh thiết kế ở cả **light và dark**, khung 390 × 844
- [ ] Không còn `console.log`, không còn TODO không ghi chú
- [ ] Cập nhật mục "Ghi chú sau khi làm" trong file task và ✅ trong `PROGRESS.md`

## Mẫu một file task

```
# <MÃ> · <Tên>
Phụ thuộc · Ước lượng · Nhánh
## Mục tiêu
## Tham chiếu
## Phạm vi (làm / không làm)
## Yêu cầu chi tiết
## File dự kiến
## Tiêu chí hoàn thành
## Kiểm thử
## Prompt cho AI
## Ghi chú sau khi làm
```
