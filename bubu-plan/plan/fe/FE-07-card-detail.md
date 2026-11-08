# FE-07 · Màn Chi tiết card (phần cơ bản)

**Phụ thuộc:** BE-06, FE-04 · **Ước lượng:** 3 giờ · **Nhánh:** `feat/fe-07-card-detail`

## Mục tiêu

Sửa tiêu đề, trạng thái, hạn chót, mô tả; hoàn thành / mở lại card.

## Tham chiếu

- Ảnh: `plan/design/screens/04-card-detail.png` (phần trên đến "Mô tả")
- Hook: `useCard`, `useUpdateCard`, `useMoveCard`, `useDeleteCard` (BE-06); `celebrate()` (FE-06)

## Yêu cầu chi tiết

1. Đầu trang: nút ‹, tên board (ink2, 15px), huy hiệu đỏ "Quá hạn N ngày" bên phải nếu quá hạn; nút ⋯ → menu "Xoá card" (xác nhận bằng `ConfirmDialog`, xoá mềm, toast + hoàn tác).
2. `Segmented` trạng thái To Do / Doing / Done → `useMoveCard` (`toIndex: 0`). Chọn Done = hoàn thành (popup ăn mừng).
3. Tiêu đề: `textarea` tự giãn, 22px/900, không cho xuống dòng (Enter = blur).
4. **Hạn chót**: thẻ có ô lịch nhỏ bên trái (nền brand: thứ viết tắt "THỨ 5" + ngày "5"), ngày dạng `dd/mm/yyyy`, dòng phụ đỏ "Quá hạn 3 ngày" nếu quá hạn; chạm mở `input type="date"` gốc của iOS; có nút xoá hạn.
5. **Mô tả**: `textarea` tự giãn, placeholder "Thêm mô tả cho card…".
6. Lưu tự động: tiêu đề và mô tả **debounce 600 ms** và lưu khi rời ô; hạn chót và trạng thái lưu ngay. Hiện chữ nhỏ "Đã lưu" 1 giây sau khi lưu.
7. Nút cố định dưới đáy (trên safe-area): "HOÀN THÀNH" (`Button3D` lớn, icon ✓) nếu chưa xong; nếu đã xong: nút phụ "Mở lại card" → To Do.
8. Màn không có `TabBar`.

## File dự kiến

`src/features/cards/{CardPage,DueDateField,AutoTextarea}.tsx`

## Tiêu chí hoàn thành

- [ ] Sửa tiêu đề/mô tả, thoát ra vào lại vẫn còn; thẻ ngoài Kanban cập nhật theo
- [ ] Đổi trạng thái bằng Segmented di chuyển card đúng cột
- [ ] HOÀN THÀNH mở popup ăn mừng, đóng popup về Board
- [ ] Xoá card có hoàn tác
- [ ] Khớp ảnh 04 ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 2, 3, 8, 12), plan/01-conventions.md, plan/fe/FE-07-card-detail.md.
Xem ảnh plan/design/screens/04-card-detail.png (đính kèm). Làm task FE-07, chưa làm phần độ ưu tiên/nhãn/checklist.
Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

…
