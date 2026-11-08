# FE-03 · Tạo/sửa board, menu ⋯, xoá có hoàn tác

**Phụ thuộc:** FE-02 · **Ước lượng:** 3–4 giờ · **Nhánh:** `feat/fe-03-board-actions`

## Mục tiêu

Hoàn thiện mọi thao tác trên board ở màn Danh sách board.

## Tham chiếu

- File thiết kế gốc: mở `plan/design/bubu-app-v2.dc.html`, màn 2, bấm "+ Tạo" và nút ⋯ để xem sheet/menu
- Hook: `useCreateBoard`, `useUpdateBoard`, `useArchiveBoard`, `useDuplicateBoard`, `useDeleteBoard` (BE-05)
- Component có sẵn: `BottomSheet`, `TextField`, `Button3D`, `showUndo`, `toast`

## Yêu cầu chi tiết

1. **Sheet tạo/sửa** (`BoardSheet.tsx`): tiêu đề "Tạo board mới" / "Sửa board"; ô tên (tối đa 40, bộ đếm "12/40", lỗi "Đặt tên cho board nhé!"); ô mô tả; hàng 4 màu tròn (màu đang chọn có vòng ink + ✓); ô xem trước chữ cái đầu với màu đã chọn; nút "TẠO BOARD" / "LƯU THAY ĐỔI" (mờ hơn khi tên trống); Enter để lưu. Mở sheet tạo khi đang tìm kiếm thì điền sẵn từ khoá vào ô tên. Màu mặc định = số board % 4.
2. **Menu ⋯** (`BoardMenu.tsx`, dùng `BottomSheet`): đầu menu có ô chữ cái + tên + "7 card · 2 đang làm · 1 quá hạn". Các mục (icon ô màu + tên + mô tả):
   - Sửa board – "Tên, mô tả và màu"
   - Ghim lên đầu / Bỏ ghim
   - Nhân bản – "Sao chép board kèm toàn bộ card"
   - Lưu trữ – "Ẩn khỏi danh sách, khôi phục bất cứ lúc nào"
   - Xoá board (chữ đỏ)
3. **Xác nhận xoá** (`ConfirmDialog` mới ở `src/components/`): Bubu `sad` không nhấp nhô, "Xoá “<tên>”?", "N card sẽ bị xoá vĩnh viễn.", nút "Xoá" (danger) + "Huỷ". Xoá → `scheduleDelete` + `showUndo('Đã xoá “<tên>”', undo)`.
4. Toast sau mỗi thao tác: "Đã tạo board “…”", "Đã lưu thay đổi", "Đã ghim", "Đã nhân bản", "Đã lưu trữ “…”".

## File dự kiến

`src/features/boards/{BoardSheet,BoardMenu}.tsx`, `src/components/ConfirmDialog.tsx`, `src/features/boards/BoardsPage.tsx`

## Tiêu chí hoàn thành

- [ ] Tạo, sửa (tên/mô tả/màu), ghim, nhân bản, lưu trữ, xoá đều chạy và cập nhật ngay
- [ ] Xoá rồi bấm Hoàn tác trong 5 giây → board quay lại, DB không mất gì
- [ ] Tên rỗng không lưu được, hiện lỗi đúng câu
- [ ] Đóng sheet/menu bằng chạm nền hoặc Esc
- [ ] Khớp file thiết kế ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 10), plan/01-conventions.md, plan/fe/FE-03-board-actions.md.
Tham khảo sheet/menu trong plan/design/bubu-app-v2.dc.html (tìm "Tạo board mới", "Sửa board", "Nhân bản").
Làm task FE-03 với hook trong src/api/boards.ts. Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

…
