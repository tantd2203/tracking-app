# FE-02 · Màn Danh sách board

**Phụ thuộc:** BE-05, FE-01 · **Ước lượng:** 4 giờ · **Nhánh:** `feat/fe-02-boards-list`

## Mục tiêu

Hiển thị board thật với số liệu, tìm kiếm, ghim, mục đã lưu trữ và các trạng thái trống.

## Tham chiếu

- Ảnh: `plan/design/screens/02-boards.png`
- Hook: `useBoards`, `matchBoard` (BE-05)
- Màu board: tạo `src/lib/palette.ts` theo `plan/design/README.md`

## Phạm vi

**Làm:** đầu trang, `StreakBanner` (tạm dùng số 0 + trạng thái "Bắt đầu streak nào!" – FE-09 nối dữ liệu thật), ô tìm kiếm, `BoardTile`, mục Đã lưu trữ (mở/đóng, Khôi phục), trạng thái trống/không tìm thấy.
**Không làm:** sheet tạo/sửa, menu ⋯, xoá (FE-03) – nút ⋯ và "+ Tạo" tạm gọi `toast('Sắp có')`.

## Yêu cầu chi tiết

1. Đầu trang: "Xin chào, <tên>" (chữ ink2; tạm lấy `display_name` từ `user_metadata` của session, BE-09 xong thì đổi sang `useProfile`) + "Board của bạn" (30px, 900); bên phải huy hiệu streak (giọt nước + số) bấm mở `/stats`.
2. `StreakBanner` (`src/features/boards/StreakBanner.tsx`): nền brand, Bubu cỡ 92, tiêu đề + phụ đề, hàng 7 chấm của 7 ngày gần nhất (nhãn T2…CN, ngày cuối "Nay"; ngày có card xong = chấm trắng có ✓, ngày trống = trắng mờ 20%, hôm nay viền trắng). Nhận props `{ title, sub, mood, week: { label: string; done: boolean; today: boolean }[] }`.
3. Dòng "Board đang dùng · N board" + nút "+ Tạo" (`Button3D size="md"`).
4. Ô tìm kiếm **chỉ hiện khi có hơn 3 board** hoặc đang có từ khoá; có nút xoá (×); lọc bằng `matchBoard` (không phân biệt dấu).
5. `BoardTile` (`src/features/boards/BoardTile.tsx`): ô vuông chữ cái đầu tô màu board (bóng khối màu shade), tên (900), mô tả (1 dòng, ink2), dòng "7 card · 2 đang làm" + "2 quá hạn" màu đỏ nếu có, thanh tiến độ % xong màu board, nút ⋯ tròn bên phải. Board ghim có chấm nhỏ màu brand ở góc ô chữ cái. Chạm thẻ → `/boards/:id`.
6. Mục "Đã lưu trữ · N" (chỉ hiện khi có): bấm "Xem ▾ / Ẩn ▴"; mỗi dòng có nút "Khôi phục" (gọi `useArchiveBoard({ archived: false })` + toast "Đã khôi phục “<tên>”").
7. Trống: Bubu `calm` + "Chưa có board nào" / "Tạo board đầu tiên để bắt đầu bơi cùng Bubu nhé!". Tìm không thấy: Bubu `happy` + "Không tìm thấy board nào" / "Thử từ khoá khác, hoặc tạo board mới với tên này."
8. Đang tải: 3 khung xương (skeleton) cao bằng `BoardTile`.

## File dự kiến

`src/features/boards/{BoardsPage,BoardTile,StreakBanner,ArchivedSection}.tsx`, `src/lib/palette.ts`

## Tiêu chí hoàn thành

- [ ] Số card / đang làm / quá hạn / % xong khớp dữ liệu DB
- [ ] Board ghim nằm đầu danh sách
- [ ] Gõ "nhat" tìm ra "Học tiếng Nhật"
- [ ] Khôi phục board đã lưu trữ hoạt động
- [ ] Khớp ảnh 02 ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/01-conventions.md, plan/design/README.md, plan/fe/FE-02-boards-list.md.
Xem ảnh plan/design/screens/02-boards.png (đính kèm). Làm task FE-02 bằng hook useBoards và matchBoard có sẵn trong src/api/boards.ts.
Tạo src/lib/palette.ts đúng như design/README.md. Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

…
