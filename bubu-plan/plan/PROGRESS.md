# Tiến độ

Làm **từ trên xuống**: mỗi task chỉ bắt đầu khi các task ở cột "Phụ thuộc" đã ✅. FE và BE xen kẽ để luôn có thứ mở lên được trên iPhone.
Đánh dấu: ⬜ chưa làm · 🟡 đang làm · ✅ xong (đã merge `main`).

| #   | Trạng thái | Task                                                                      | Phụ thuộc           | Ước lượng | Phát hành |
| --- | ---------- | ------------------------------------------------------------------------- | ------------------- | --------- | --------- |
| 0   | ✅         | Project base (giai đoạn 0)                                                | –                   | –         | `v0.1.0`  |
| 1   | ✅         | [BE-01 · Dựng Supabase](be/BE-01-supabase-setup.md)                       | –                   | 1–2 giờ   |           |
| 2   | ✅         | [BE-02 · Nền tảng `src/api`](be/BE-02-api-foundation.md)                  | BE-01               | 2–3 giờ   |           |
| 3   | ✅         | [BE-03 · API đăng nhập](be/BE-03-auth-api.md)                             | BE-02               | 2 giờ     |           |
| 4   | 🟡         | [FE-01 · Đăng nhập, đăng ký, chặn route](fe/FE-01-auth-screens.md)        | BE-03               | 3 giờ     |           |
| 5   | ✅         | [BE-04 · Hàm SQL (RPC)](be/BE-04-rpc-functions.md)                        | BE-01               | 3–4 giờ   |           |
| 6   | 🟡         | [BE-05 · API board](be/BE-05-boards-api.md)                               | BE-02, BE-04        | 3 giờ     |           |
| 7   | 🟡         | [FE-02 · Danh sách board](fe/FE-02-boards-list.md)                        | BE-05, FE-01        | 4 giờ     |           |
| 8   | 🟡         | [FE-03 · Tạo/sửa board, menu, xoá](fe/FE-03-board-actions.md)             | FE-02               | 3–4 giờ   | `v0.2.0`  |
| 9   | ⬜         | [BE-06 · API card + kéo thả](be/BE-06-cards-api.md)                       | BE-02, BE-04        | 4 giờ     |           |
| 10  | ⬜         | [FE-04 · Board Kanban](fe/FE-04-kanban-layout.md)                         | BE-06, FE-02        | 4 giờ     |           |
| 11  | ⬜         | [FE-05 · Kéo thả](fe/FE-05-drag-drop.md)                                  | FE-04               | 5–6 giờ   |           |
| 12  | ⬜         | [BE-08 · API thống kê + báo cáo](be/BE-08-stats-report-api.md)            | BE-04               | 3–4 giờ   |           |
| 13  | ⬜         | [FE-06 · Popup ăn mừng](fe/FE-06-celebrate.md)                            | FE-05, BE-08        | 2 giờ     |           |
| 14  | ⬜         | [FE-07 · Chi tiết card](fe/FE-07-card-detail.md)                          | BE-06, FE-04, FE-06 | 3 giờ     | `v0.3.0`  |
| 15  | ⬜         | [BE-07 · API nhãn, checklist](be/BE-07-labels-checklist-api.md)           | BE-06               | 2–3 giờ   |           |
| 16  | ⬜         | [FE-08 · Ưu tiên, nhãn, checklist](fe/FE-08-priority-labels-checklist.md) | BE-07, FE-07        | 4 giờ     | `v0.4.0`  |
| 17  | ⬜         | [FE-09 · Heatmap, streak, trạng thái trống](fe/FE-09-heatmap-streak.md)   | BE-08, FE-02        | 4–5 giờ   |           |
| 18  | ⬜         | [FE-10 · Báo cáo tuần/tháng](fe/FE-10-report.md)                          | BE-08, FE-09        | 3–4 giờ   | `v0.5.0`  |
| 19  | ⬜         | [BE-09 · API hồ sơ](be/BE-09-profile-api.md)                              | BE-03               | 1–2 giờ   |           |
| 20  | ⬜         | [FE-11 · Màn Tôi](fe/FE-11-me-screen.md)                                  | BE-09, BE-08        | 2 giờ     |           |
| 21  | ⬜         | [BE-10 · Google + cấu hình production](be/BE-10-google-oauth-prod.md)     | BE-03               | 2 giờ     |           |
| 22  | ⬜         | [FE-12 · Hoàn thiện, phát hành](fe/FE-12-polish-release.md)               | tất cả              | 1–2 ngày  | `v1.0.0`  |

**Tổng ước lượng:** khoảng 65–80 giờ, tức 7–9 tuần nếu làm 8–10 giờ mỗi tuần.

## Làm song song (2 phiên AI)

Sau khi xong BE-01 → BE-02, có thể chạy song song hai luồng:

- **Luồng BE:** BE-03 → BE-04 → BE-05 → BE-06 → BE-08 → BE-07 → BE-09 → BE-10
- **Luồng FE:** làm theo thứ tự bảng, mỗi task FE chờ task BE nó phụ thuộc

Hai luồng hầu như không sửa chung file: BE đụng `supabase/`, `src/api/` và các file `src/lib/` ghi trong task BE; FE đụng `src/features/`, `src/components/`, `src/app/` và các file `src/lib/` ghi trong task FE.

## Sau v1.0.0

- Nhắc nhở 20:00 bằng web push (Supabase Edge Function chạy theo lịch)
- Nút "Xuất dữ liệu (JSON)" ở màn Tôi để tự sao lưu
- Chia sẻ board với bạn bè
- Đổi ngôn ngữ
