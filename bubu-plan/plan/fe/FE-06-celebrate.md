# FE-06 · Popup ăn mừng khi hoàn thành card

**Phụ thuộc:** FE-05, BE-08 · **Ước lượng:** 2 giờ · **Nhánh:** `feat/fe-06-celebrate`

## Mục tiêu

Mỗi lần card vào Done, Bubu phun nước ăn mừng, cho thấy ô hôm nay vừa đậm lên và streak.

## Tham chiếu

- File thiết kế: kéo một card vào Done trong `plan/design/bubu-app-v2.dc.html` để xem popup
- `Whale` với `burst`, `useStreakSummary` (BE-08), cờ `completedNow` từ `useMoveCard`

## Yêu cầu chi tiết

1. `CelebrateOverlay` (`src/components/CelebrateOverlay.tsx`), mở qua store giống toast: `celebrate({ title, first, streak, today })`.
2. Nội dung: nền overlay; thẻ trắng `animate-pop`; Bubu `cheer` cỡ 190 có `burst`; tiêu đề "Ô hôm nay xanh rồi!" (card đầu tiên trong ngày, `first = true`) hoặc "Tuyệt vời!"; tên card; hàng 2 chip: "Streak N ngày" và ô vuông màu `heat-level(today)` + "N card hôm nay"; nút "TIẾP TỤC".
3. Rung `[20, 40, 20]` nếu có.
4. Đóng popup: nếu đang ở màn Chi tiết card thì quay về Board.
5. Gọi từ: thả vào Done (FE-05) và nút HOÀN THÀNH (FE-07). `first` = số card hôm nay trước khi hoàn thành bằng 0.

## File dự kiến

`src/components/CelebrateOverlay.tsx`, `src/components/celebrate.ts`, `src/main.tsx`

## Tiêu chí hoàn thành

- [ ] Card đầu tiên trong ngày hiện "Ô hôm nay xanh rồi!", lần sau "Tuyệt vời!"
- [ ] Số streak và số card hôm nay đúng ngay sau khi hoàn thành
- [ ] Hiệu ứng mượt trên iPhone, không giật khung
- [ ] Đóng bằng nút hoặc chạm nền

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 2, 5–7), plan/fe/FE-06-celebrate.md, src/components/Whale.tsx.
Làm task FE-06: CelebrateOverlay + store celebrate(), gắn vào luồng thả vào Done. Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

- Đã làm: store `src/components/celebrate.ts` (`celebrate`, `dismissCelebrate`), `CelebrateOverlay` (Bubu cheer 190 có burst, tiêu đề theo `first`, chip streak và ô hôm nay, nút TIẾP TỤC, rung `[20, 40, 20]`, đóng bằng nút, chạm nền hoặc Esc). Mount trong `main.tsx`.
- Số liệu popup tính từ cache trước khi kéo (`afterCompletion` trong `src/lib/celebrate.ts`, có test), nên hiện ngay không chờ refetch. Chỉ mở khi `completedNow` = true sau khi server xác nhận.
- Gọi từ thả vào Done (FE-05). Nút HOÀN THÀNH ở FE-07 chưa làm nên chưa gọi từ đó.
- Tham số `returnTo` có sẵn để FE-07 đóng popup về Board. Overlay điều hướng bằng `router.navigate`, vì mount ngoài RouterProvider.
- `npm run lint`, `npm test` (59 test) và `npm run build` đều qua.
- Chưa kiểm tra: hiệu ứng mượt trên iPhone, giao diện light và dark, và số liệu với dữ liệu thật.
