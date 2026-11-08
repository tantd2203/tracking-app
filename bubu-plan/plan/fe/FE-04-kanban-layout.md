# FE-04 · Màn Board Kanban (bố cục, thẻ card, thêm card)

**Phụ thuộc:** BE-06, FE-02 · **Ước lượng:** 4 giờ · **Nhánh:** `feat/fe-04-kanban`

## Mục tiêu

Xem card theo 3 cột, vuốt ngang đổi cột, thêm card nhanh. Chưa kéo thả (FE-05).

## Tham chiếu

- Ảnh: `plan/design/screens/03-board-kanban.png`
- Hook: `useBoardData`, `useCreateCard` (BE-06)
- Màu nhãn, độ ưu tiên: `src/lib/palette.ts`

## Yêu cầu chi tiết

1. Đầu trang: nút ‹ (về `/boards`), tên board 22px/900 màu ink, dòng gợi ý "Nhấn giữ card để kéo · vuốt ngang đổi cột"; thanh màu board mảnh bên phải tiêu đề.
2. `ColumnTabs`: 3 tab "To Do 3" · "Doing 2" · "Done 2" (số trong ô chip); tab đang xem nền surface + viền brand. Bấm tab → cuộn mượt tới cột (easing cubic, 280 ms).
3. Vùng cột: cuộn ngang, `scroll-snap-type: x mandatory`, mỗi cột rộng 338px (cột kế tiếp lộ một phần), nền `bg-col`, bo 20px. Cuộn tay → cập nhật tab đang xem.
4. `CardTile` (`src/features/boards/CardTile.tsx`): nền surface, viền 2px line, bóng khối; hàng chip nhãn (nền màu nhãn, chữ fg); tiêu đề 15px/800; hàng meta: chip hạn (📅 12/11; quá hạn: nền red-bg, chữ red, "Quá hạn 3 ngày"; ngày mai: "Ngày mai"), chip ưu tiên (3 vạch + "Cao"), chip checklist "2/4" (đủ hết thì nền chip, chữ chip-ink), icon mô tả nếu có. Card quá hạn: viền red-line. Biểu tượng ⋮⋮ mờ góc phải (tay cầm kéo). Chạm → `/cards/:id`.
5. Thêm card: nút "+ Thêm card" cuối mỗi cột → ô nhập tại chỗ; Enter = thêm và giữ ô mở để thêm tiếp; Esc/ra ngoài = đóng.
6. Board trống: Bubu `calm` cỡ 140 + "Board còn trống" + nút "THÊM CARD ĐẦU TIÊN" mở ô nhập ở cột To Do.
7. Hàm hiển thị hạn chót để ở `src/lib/due.ts` (`dueLabel(due, today)` → `{ text, overdue, soon }`) + test.

## File dự kiến

`src/features/boards/{BoardPage,ColumnTabs,KanbanColumn,CardTile,AddCardInput}.tsx`, `src/lib/due.ts`, `src/lib/due.test.ts`

## Tiêu chí hoàn thành

- [ ] 3 cột đúng thứ tự `position`, số đếm trên tab đúng
- [ ] Vuốt ngang dừng đúng từng cột; bấm tab cuộn tới cột
- [ ] Thêm liên tiếp nhiều card bằng Enter
- [ ] Card quá hạn / ngày mai hiển thị đúng
- [ ] Khớp ảnh 03 ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 8), plan/01-conventions.md, plan/fe/FE-04-kanban-layout.md.
Xem ảnh plan/design/screens/03-board-kanban.png (đính kèm). Làm task FE-04 với useBoardData, useCreateCard.
Chưa làm kéo thả. Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

…
