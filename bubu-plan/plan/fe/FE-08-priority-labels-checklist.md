# FE-08 · Độ ưu tiên, nhãn, checklist

**Phụ thuộc:** BE-07, FE-07 · **Ước lượng:** 4 giờ · **Nhánh:** `feat/fe-08-card-extras`

## Mục tiêu

Hoàn thiện nửa dưới màn Chi tiết card.

## Tham chiếu

- Ảnh: `plan/design/screens/04-card-detail.png` (từ "Độ ưu tiên" trở xuống); cuộn trong file HTML gốc để xem phần Checklist
- Hook: `useUpdateCard` (priority), `useLabels`, `useCreateLabel`, `useToggleCardLabel`, `useAdd/Update/DeleteChecklistItem` (BE-07)
- `PRIORITY`, `LABEL_COLORS` trong `src/lib/palette.ts`

## Yêu cầu chi tiết

1. **`PriorityPicker`**: tiêu đề "ĐỘ ƯU TIÊN" + gợi ý bên phải ("Làm trước tiên" / "Làm trong tuần" / "Khi rảnh" / "Chưa đặt"); 4 ô ngang: biểu tượng 3 vạch cao dần (vạch tô màu theo mức) + tên; ô đang chọn nền chip, viền màu mức.
2. **`LabelPicker`**: tiêu đề "NHÃN" + "N đã chọn" / "Chạm để gắn"; chip từng nhãn (chưa chọn: nền surface, chấm màu; đã chọn: nền màu nhãn, ✓); chip cuối "+ Nhãn mới" → hàng nhập tên + 5 chấm màu + "Thêm" (Enter thêm, Esc huỷ). Nhãn mới gắn luôn vào card.
3. **`Checklist`**: tiêu đề "CHECKLIST" + "2/4 xong" (màu brand) hoặc "Chia nhỏ việc để dễ bắt đầu"; thanh tiến độ brand; mỗi dòng: ô tick tròn góc (tick: nền brand, ✓, phóng 1.06), chữ có thể sửa tại chỗ, gạch ngang + ink2 khi xong, nút xoá × hiện khi chạm giữ/rê chuột; ô "Thêm việc con…" + Enter.
4. Tick hết mà card chưa Done: hiện gợi ý nhỏ có Bubu "Xong hết việc con rồi! Bấm HOÀN THÀNH nhé" phía trên nút.
5. Rung 8 ms khi tick (nếu có).

## File dự kiến

`src/features/cards/{PriorityPicker,LabelPicker,Checklist}.tsx`, `src/features/cards/CardPage.tsx`

## Tiêu chí hoàn thành

- [ ] Đổi ưu tiên → 3 vạch trên thẻ Kanban đổi theo
- [ ] Tạo nhãn mới, gắn/bỏ nhãn; nhãn dùng được ở card thuộc board khác
- [ ] Thêm/sửa/xoá/tick checklist; số "x/y" trên thẻ Kanban đúng
- [ ] Khớp ảnh 04 ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 11), plan/design/README.md, plan/fe/FE-08-priority-labels-checklist.md.
Xem ảnh plan/design/screens/04-card-detail.png (đính kèm). Làm task FE-08 với hook trong src/api/labels.ts, src/api/checklist.ts.
Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

- Đã làm: `PriorityPicker` (4 ô có vạch, ô đang chọn đổi nền và viền theo mức, gợi ý bên phải), `LabelPicker` (chip nhãn bật/tắt, "+ Nhãn mới" có 5 màu, Enter thêm, Esc huỷ, nhãn mới gắn luôn), `Checklist` (thanh tiến độ, tick có rung 8 ms, sửa chữ tại chỗ, xoá hiện khi rê chuột hoặc focus, thêm bằng Enter). Gợi ý Bubu phía trên nút khi tick hết việc con. Thứ tự sau Mô tả như ảnh 04.
- `PriorityBars` chuyển sang `src/components/` để dùng chung với thẻ Kanban.
- Lưu ý: nút xoá việc con chỉ hiện khi rê chuột hoặc focus, nên trên cảm ứng cần chạm vào dòng đó trước. Spec nói chạm giữ, chưa làm.
- `npm run lint`, `npm test` (59 test) và `npm run build` đều qua.
- Chưa kiểm tra: đổi ưu tiên thấy trên thẻ Kanban, nhãn dùng được ở board khác, số "x/y" đúng trên Kanban, và giao diện light/dark so với ảnh 04. Chưa test trên iPhone thật.
