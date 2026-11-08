# FE-05 · Kéo thả card

**Phụ thuộc:** FE-04 · **Ước lượng:** 5–6 giờ (task khó nhất) · **Nhánh:** `feat/fe-05-drag-drop`

## Mục tiêu

Kéo card trong cột và giữa các cột trên iPhone mượt như thiết kế.

## Tham chiếu

- Logic gốc: trong `plan/design/bubu-app-v2.dc.html` tìm `cardDown`, `startDrag`, `dragMove`, `endDrag`, `dock`
- Hook: `useMoveCard` (BE-06) – đã optimistic
- Thư viện: `@dnd-kit/core`, `@dnd-kit/sortable` (đã cài)

## Yêu cầu chi tiết

1. Cảm biến: `TouchSensor` với `activationConstraint: { delay: 280, tolerance: 10 }` (nhấn giữ 280 ms mới kéo, lệch > 10px trước đó = đang cuộn); `MouseSensor` với `distance: 6` (chuột kéo luôn).
2. Khi đang nhấn giữ (trước 280 ms) thẻ thu nhỏ nhẹ 0.98; khi bắt đầu kéo: rung 12 ms (nếu có), thẻ gốc thành khung nét đứt, `DragOverlay` hiện bản sao nghiêng 2°, đổ bóng.
3. Vùng thả:
   - Từng cột (sắp xếp trong cột bằng `SortableContext`, chỉ báo vị trí chèn là vạch brand dày 3px).
   - 3 tab cột ở trên (`useDroppable`) – thả vào tab = thêm vào đầu cột đó.
   - **Thanh thả dưới đáy** (`DropDock`) thay chỗ `TabBar` khi đang kéo: 3 ô "To Do" · "Doing" · "Done ✓" lớn, ô đang được trỏ nổi lên + đổi màu; rung 8 ms khi đổi ô.
4. Tự cuộn ngang khi kéo sát mép trái/phải vùng cột (30px) – mỗi khung hình 9px.
5. Thả: gọi `useMoveCard({ cardId, boardId, toList, toIndex })`; đổi cột thì cuộn tới cột đích và toast "Đã chuyển sang To Do/Doing" (Done thì không toast vì có popup – FE-06).
6. Trong khi kéo: tắt `scroll-snap`, chặn cuộn trang dọc, chặn chọn chữ (`user-select: none`, `touch-action: none` trên thẻ).
7. Hỗ trợ bàn phím cơ bản (KeyboardSensor) để không chặn người dùng desktop.

## File dự kiến

`src/features/boards/{BoardDnd,DropDock,DragOverlayCard}.tsx`, sửa `KanbanColumn.tsx`, `CardTile.tsx`, `src/app/AppLayout.tsx` (ẩn TabBar khi kéo)

## Tiêu chí hoàn thành

- [ ] Trên iPhone thật: vuốt ngang/dọc bình thường không kích hoạt kéo; nhấn giữ mới kéo
- [ ] Sắp xếp trong cột và chuyển cột giữ đúng thứ tự sau khi tải lại
- [ ] Thả vào tab trên và thanh dưới đều hoạt động
- [ ] Không bị chọn chữ / kính lúp iOS khi nhấn giữ
- [ ] Mất mạng: card về chỗ cũ + toast lỗi

## Kiểm thử

Thử tay trên iPhone qua link Vercel Preview; ghi lại máy + phiên bản iOS đã thử trong ghi chú.

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/01-conventions.md, plan/fe/FE-05-drag-drop.md.
Đọc hàm cardDown/startDrag/dragMove/endDrag trong plan/design/bubu-app-v2.dc.html để hiểu hành vi mong muốn,
nhưng cài đặt bằng dnd-kit. Làm task FE-05 với useMoveCard. Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

- Đã làm: `BoardDnd` (DndContext, cảm biến Touch 280 ms/tolerance 10, Mouse 6 px, Keyboard, `pointerWithin`, DragOverlay nghiêng 2°), `CardTile` dùng `useSortable` (thẻ gốc thành khung nét đứt), `KanbanColumn` và `ColumnTabs` là vùng thả, `DropDock` thay TabBar lúc kéo (ẩn TabBar qua `src/app/dragState.ts`). Vạch chèn 3px brand. Tự cuộn mép 30px, 9px mỗi khung. Chặn scroll-snap lúc kéo, `touch-none` trên thẻ.
- Logic đích thả nằm trong `dropTarget.ts`, có 8 test. Thả vào tab hoặc thanh dưới thì vào đầu cột. Thả đúng chỗ cũ thì không gọi API.
- Sau khi đổi cột: cuộn tới cột đích, toast "Đã chuyển sang To Do/Doing" (Done không toast). Click sau khi kéo bị bỏ qua 400 ms (`dragGuard.ts`) để không mở chi tiết card.
- Lưu bằng `useMoveCard` (optimistic, rollback và toast khi lỗi).
- `touch-none` trên thẻ nghĩa là vuốt dọc bắt đầu từ thẻ sẽ không cuộn trang. Đây là đánh đổi để nhấn giữ hoạt động ổn định. Cần thử trên iPhone để quyết định có giữ không.
- `npm run lint`, `npm test` (55 test) và `npm run build` đều qua.
- Chưa kiểm tra trên iPhone thật hoặc với dữ liệu thật: vuốt không kích hoạt kéo, nhấn giữ không bị chọn chữ, thứ tự sau khi tải lại, thả vào tab/thanh dưới, mất mạng khi kéo. Thiết bị và iOS đã thử: chưa có.
