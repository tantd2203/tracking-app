# Thiết kế Bubu v2

- **File gốc bấm thử được:** mở `bubu-app-v2.dc.html` bằng Chrome (cần mạng vì file tải React từ unpkg). Bên phải có 8 nút nhảy tới từng màn; tab Tôi có công tắc dark mode và "Dữ liệu demo" (Bình thường / Mất streak / Mới tạo) để xem các trạng thái.
- **Ảnh chụp** (`screens/`) chụp ở 390 × 844, light mode, font dự phòng (không tải được Nunito) – khi so, bỏ qua khác biệt font.
- Logic mẫu của prototype nằm trong thẻ `<script type="text/x-dc">` cuối file HTML: cách tính streak, báo cáo, kéo thả… AI có thể đọc để làm giống hành vi.

| Ảnh | Màn | Task |
| --- | --- | --- |
| `screens/01-login.png` | Đăng nhập | FE-01 |
| `screens/02-boards.png` | Danh sách board | FE-02, FE-03 |
| `screens/03-board-kanban.png` | Board Kanban | FE-04, FE-05 |
| `screens/04-card-detail.png` | Chi tiết card | FE-07, FE-08 |
| `screens/05-stats-heatmap.png` | Thống kê – Heatmap | FE-09 |
| `screens/06-report.png` | Báo cáo tuần | FE-10 |
| `screens/07-empty.png` | Trạng thái trống | FE-09 |
| `screens/08-me.png` | Tôi | FE-11 |

## Token

Đã khai báo trong `src/styles/index.css` (light + dark). Bảng đầy đủ có trong tài liệu "Plan code – thiết kế Bubu", mục 3.

Màu board (4) và nhãn (5) chưa có trong token – FE-02 tạo `src/lib/palette.ts`:

```ts
export const BOARD_COLORS = [
  { c: '#0284C7', shade: '#026199' },
  { c: 'oklch(0.62 0.17 290)', shade: 'oklch(0.5 0.17 290)' },
  { c: 'oklch(0.74 0.15 65)', shade: 'oklch(0.62 0.15 65)' },
  { c: 'oklch(0.65 0.18 340)', shade: 'oklch(0.53 0.18 340)' },
]
export const LABEL_COLORS = [
  { c: '#0284C7', fg: '#fff' },
  { c: 'oklch(0.58 0.17 290)', fg: '#fff' },
  { c: 'oklch(0.82 0.13 80)', fg: '#3B2A05' },
  { c: 'oklch(0.6 0.19 345)', fg: '#fff' },
  { c: 'oklch(0.52 0.14 265)', fg: '#fff' },
]
export const PRIORITY = {
  none: { name: 'Không', level: 0 },
  low: { name: 'Thấp', level: 1, c: '#7DD3FC', hint: 'Khi rảnh' },
  med: { name: 'Vừa', level: 2, c: '#0EA5E9', hint: 'Làm trong tuần' },
  high: { name: 'Cao', level: 3, c: 'oklch(0.72 0.15 65)', hint: 'Làm trước tiên' },
}
```

## Câu chữ cần giữ đúng

| Chỗ | Câu |
| --- | --- |
| Đăng nhập – bóng thoại | "Chào bạn! Mình là Bubu 👋" / "Cùng bơi qua từng việc nhé!" |
| Đăng nhập – slogan | "Mỗi card xong là một ô biển xanh." |
| Lỗi email | "Email chưa đúng định dạng, kiểm tra lại giúp Bubu nhé." |
| Lỗi mật khẩu | "Mật khẩu cần ít nhất 6 ký tự." |
| Danh sách board trống | "Chưa có board nào" / "Tạo board đầu tiên để bắt đầu bơi cùng Bubu nhé!" |
| Tìm không thấy | "Không tìm thấy board nào" / "Thử từ khoá khác, hoặc tạo board mới với tên này." |
| Sheet board thiếu tên | "Đặt tên cho board nhé!" |
| Banner streak | "Streak N ngày!" + "Hôm nay đã tô màu rồi. Giỏi quá!" · "Xong 1 card hôm nay để giữ chuỗi nhé" · "Mất streak rồi…" + "Xong 1 card hôm nay để bơi lại nhé" · tài khoản mới: "Bắt đầu streak nào!" |
| Board – gợi ý | "Nhấn giữ card để kéo · vuốt ngang đổi cột" |
| Toast chuyển cột | "Đã chuyển sang To Do" / "Đã chuyển sang Doing" |
| Popup ăn mừng | Card đầu tiên trong ngày: "Ô hôm nay xanh rồi!", các lần sau: "Tuyệt vời!" |
| Ưu tiên – gợi ý | Cao "Làm trước tiên" · Vừa "Làm trong tuần" · Thấp "Khi rảnh" · Không "Chưa đặt" |
| Checklist trống | "Chia nhỏ việc để dễ bắt đầu" |
| Heatmap – ngày trống hôm nay | "Chưa có card nào xong hôm nay" |
| Trạng thái trống | "Hoàn thành card đầu tiên để tô màu ô hôm nay" + nút "ĐI TỚI BOARD" |
| Báo cáo – quá hạn | có: "Cần xử lý" · không: "Tuyệt, không có!" |
| Hoàn tác | "Đã hoàn tác" |
