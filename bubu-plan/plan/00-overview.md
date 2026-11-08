# 00 · Tổng quan Bubu

## App là gì

Bubu là PWA quản lý công việc cá nhân kiểu Trello, chạy trên iPhone qua "Thêm vào Màn hình chính".
Mỗi card hoàn thành tô màu một ô **heatmap 52 tuần** (giống GitHub contribution); giữ **streak** mỗi ngày; xem **báo cáo tuần/tháng**. Linh vật là cá voi **Bubu** đổi tâm trạng theo nhịp làm việc.

Người dùng: một người (và vài bạn bè, mỗi người dữ liệu riêng). Mọi dịch vụ dùng gói miễn phí.

## Kiến trúc

```
iPhone (PWA, React)  ──HTTPS──▶  Vercel (file tĩnh)
        │
        └──supabase-js──▶  Supabase: Postgres + Auth + Row Level Security
```

- Không có server riêng. Logic nặng (tạo board kèm 3 list, nhân bản board, đếm heatmap) viết thành **hàm SQL (RPC)** trong Supabase.
- FE gọi dữ liệu qua `src/api/*` (TanStack Query). Cập nhật **optimistic** cho kéo thả và tick checklist.

| Tầng       | Công nghệ                                                             |
| ---------- | --------------------------------------------------------------------- |
| UI         | React 19, TypeScript 6, Tailwind v4, React Router, dnd-kit, dayjs     |
| PWA        | vite-plugin-pwa (autoUpdate)                                          |
| Dữ liệu    | Supabase (Postgres, Auth email + Google), supabase-js, TanStack Query |
| Chất lượng | ESLint, Prettier, Vitest + Testing Library, GitHub Actions            |
| Host       | Vercel Hobby, nhánh `main` = Production, nhánh khác = Preview         |

## 8 màn hình (xem `design/screens/`)

| #   | Màn                    | Route                   | Task FE             |
| --- | ---------------------- | ----------------------- | ------------------- |
| 1   | Đăng nhập / Đăng ký    | `/login`, `/register`   | FE-01               |
| 2   | Danh sách board        | `/boards`               | FE-02, FE-03        |
| 3   | Board Kanban + kéo thả | `/boards/:boardId`      | FE-04, FE-05, FE-06 |
| 4   | Chi tiết card          | `/cards/:cardId`        | FE-07, FE-08        |
| 5   | Thống kê – Heatmap     | `/stats`                | FE-09               |
| 6   | Báo cáo tuần/tháng     | `/stats?view=report`    | FE-10               |
| 7   | Trạng thái trống       | (một dạng của `/stats`) | FE-09               |
| 8   | Tôi                    | `/me`                   | FE-11               |

Lớp phủ: sheet tạo/sửa board, menu ⋯ board, hộp xác nhận xoá, popup ăn mừng, toast + thanh hoàn tác.

## Quy tắc nghiệp vụ cốt lõi (KHÔNG tự ý đổi)

1. **List cố định** mỗi board: `todo` (To Do), `doing` (Doing), `done` (Done). List `done` có `is_done_list = true`.
2. **Hoàn thành card** = chuyển vào list Done (kéo thả hoặc nút HOÀN THÀNH): ghi `completed_at = now()` và `completed_on = ngày theo giờ máy`, ghi activity `card_completed`, mở popup ăn mừng.
3. **Mở lại** = chuyển card ra khỏi Done: xoá `completed_at`, `completed_on`, ghi `card_reopened`. Nút "Mở lại" đưa card về To Do.
4. **Điểm một ngày** = số card có `completed_on` = ngày đó (kể cả card đã xoá mềm).
5. **Mức màu heatmap:** 0 → mức 0 · 1 → mức 1 · 2–3 → mức 2 · 4–5 → mức 3 · ≥6 → mức 4. (Đã có `heatLevel()` trong `src/lib/heat.ts`.)
6. **Streak:** số ngày liên tiếp có ≥1 card xong, đếm lùi từ hôm nay; hôm nay chưa xong thì giữ chuỗi tới hôm qua. **Kỷ lục** = chuỗi dài nhất trong 364 ngày. (Đã có `currentStreak()`, `bestStreak()`.)
7. **Tâm trạng Bubu:** cả năm chưa có card xong → `calm`; streak > 0 và hôm nay đã xong → `cheer`; streak > 0 chưa xong hôm nay → `happy`; streak = 0 → `sad`. (Đã có `whaleMood()`.)
8. **Quá hạn:** card chưa xong và `due_date` < hôm nay. Card hiện "Quá hạn N ngày"; hạn là ngày mai hiện "Ngày mai".
9. **Tuần** bắt đầu Thứ Hai; **tháng** từ ngày 1. Kỳ đang diễn ra chỉ tính số ngày đã qua.
10. **Board:** tên 1–40 ký tự; màu 0–3; board ghim lên đầu; lưu trữ thì ẩn khỏi danh sách; xoá có xác nhận + hoàn tác 5 giây; nhân bản sao chép cả card.
11. **Nhãn** thuộc người dùng, dùng chung mọi board; màu 0–4. **Độ ưu tiên:** `none | low | med | high`.
12. **Xoá card** là xoá mềm (`archived_at`) để không làm nhạt heatmap của ngày cũ.

## Đã có sẵn trong project base (v0.1.0)

Design token light/dark, `Whale`, `Button3D`, `Segmented`, `Toggle`, `TextField`, `BottomSheet`, `TabBar`, `ScreenHeader`, toast/undo, router + layout, màn Đăng nhập (chưa nối Supabase), trạng thái trống, `src/lib/heat.ts` (+ test), migration `0001_init.sql`, CI.
