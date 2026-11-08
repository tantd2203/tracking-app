# FE-09 · Thống kê: heatmap, streak, trạng thái trống

**Phụ thuộc:** BE-08, FE-02 · **Ước lượng:** 4–5 giờ · **Nhánh:** `feat/fe-09-heatmap`

## Mục tiêu

Màn Thống kê dạng Heatmap như thiết kế, và nối dữ liệu streak thật cho banner ở Danh sách board.

## Tham chiếu

- Ảnh: `plan/design/screens/05-stats-heatmap.png`, `plan/design/screens/07-empty.png`
- Hook: `useYearCounts`, `useDayCards`, `useStreakSummary` (BE-08); `heatLevel` (`src/lib/heat.ts`)

## Yêu cầu chi tiết

1. Đầu trang "Thống kê" + `Segmented` Heatmap / Báo cáo; đồng bộ với query `?view=report`.
2. **`StreakHero`**: theo `mood`
   - `cheer`/`happy`: nền brand, bóng khối brand-shade, chữ trắng; số streak 56px/900 + "ngày streak"; câu: đã xong hôm nay "Ô hôm nay đã xanh! Mai gặp lại nhé." / chưa "Còn hôm nay nữa thôi — xong 1 card để giữ chuỗi!"; pill "Kỷ lục: N ngày"; Bubu cỡ 128 (cheer có tia nước).
   - `sad`: nền surface, viền line, chữ ink; "Bubu buồn quá… Hoàn thành 1 card hôm nay để bắt đầu chuỗi mới nhé."
3. **`Heatmap`**: thẻ "52 tuần qua" + "810 card · 243 ngày" bên phải; lưới 52 cột × 7 hàng ô 11px, khoảng cách 3px; nhãn thứ T2, T4, T6, CN bên trái; nhãn tháng "Th8"… trên cột chứa ngày 1; cuộn ngang và **tự cuộn tới tuần hiện tại** khi mở; ô hôm nay nếu trống có hiệu ứng `animate-pulse-ring`; ô đang chọn viền 2px ink; chú thích "Chạm ô để xem chi tiết" + "Ít ▢▢▢▢▢ Nhiều".
4. **`DayDetail`**: thẻ dưới lưới: ô màu mức + số; "Chủ Nhật, 8/11/2026 · Hôm nay"; "N card đã hoàn thành" / "Chưa có card nào xong hôm nay" / "Không có hoạt động"; danh sách tên card (từ `useDayCards`), mỗi dòng có tên board nhỏ.
5. **Trạng thái trống** (`totalYear = 0`): thay `StreakHero` bằng thẻ Bubu `calm` + "Hoàn thành card đầu tiên để tô màu ô hôm nay" + "Mỗi ngày có card xong, nước sẽ sâu thêm một chút để Bubu bơi." + nút "ĐI TỚI BOARD"; heatmap vẫn hiện (toàn xám).
6. Nối dữ liệu thật cho `StreakBanner` + huy hiệu streak ở Danh sách board (FE-02): câu chữ theo bảng "Banner streak" trong `plan/design/README.md`; 7 chấm từ `useYearCounts`.
7. Hàm dựng lưới (`buildWeeks(counts, today)` → 52 tuần × 7 ngày + nhãn tháng) để ở `src/lib/heat.ts` + test.

## File dự kiến

`src/features/activity/{StatsPage,StreakHero,Heatmap,DayDetail,EmptyStats}.tsx`, `src/lib/heat.ts`, `src/features/boards/StreakBanner.tsx`

## Tiêu chí hoàn thành

- [ ] Hoàn thành card → quay lại Thống kê thấy ô hôm nay đậm lên, streak tăng
- [ ] 4 tâm trạng hiển thị đúng (thử bằng dữ liệu: chưa có gì / mất streak / chưa xong hôm nay / đã xong)
- [ ] Lưới mở ra đã cuộn tới tuần hiện tại; chạm ô xem đúng danh sách card
- [ ] Banner ở Danh sách board dùng số thật
- [ ] Khớp ảnh 05 và 07 ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 4–7), plan/design/README.md, plan/fe/FE-09-heatmap-streak.md, src/lib/heat.ts.
Xem ảnh plan/design/screens/05-stats-heatmap.png và 07-empty.png (đính kèm). Làm task FE-09 với hook trong src/api/stats.ts.
Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

- Đã làm: `StatsPage` (Segmented Heatmap/Báo cáo đồng bộ `?view=report`), `StreakHero` (cheer/happy/sad, Bubu 128, pill kỷ lục), `EmptyStats` (khi chưa có card xong), `Heatmap` (52 tuần, nhãn T2/T4/T6/CN, nhãn tháng, tự cuộn tới tuần hiện tại, ô hôm nay trống có `animate-pulse-ring`, chú thích Ít/Nhiều), `DayDetail` (danh sách card của ngày đã chọn kèm tên board).
- `buildWeeks` và `mondayOf` trong `src/lib/heat.ts`, có test (`heat.grid.test.ts`). `useDayCards` trong `src/api/stats.ts`.
- Banner ở Danh sách board dùng số thật: 7 chấm từ `useYearCounts`, câu chữ theo bảng "Banner streak", huy hiệu streak thay số 0 cố định.
- Báo cáo (`?view=report`) vẫn là chỗ giữ, làm ở FE-10.
- `npm run lint`, `npm test` (66 test) và `npm run build` đều qua.
- Chưa kiểm tra: hoàn thành card rồi quay lại Thống kê thấy ô hôm nay đậm lên, 4 tâm trạng với dữ liệu thật, cuộn tới tuần hiện tại trên thiết bị, và giao diện light/dark so với ảnh 05 và 07.
