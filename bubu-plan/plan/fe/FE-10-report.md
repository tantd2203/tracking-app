# FE-10 · Báo cáo tuần / tháng

**Phụ thuộc:** BE-08, FE-09 · **Ước lượng:** 3–4 giờ · **Nhánh:** `feat/fe-10-report`

## Mục tiêu

Chế độ "Báo cáo" của màn Thống kê.

## Tham chiếu

- Ảnh: `plan/design/screens/06-report.png`
- Hàm: `buildReport`, `periodDays`, `periodLabel` (`src/lib/report.ts`, BE-08); hook `useRangeCounts`, `useOverdueCount`

## Yêu cầu chi tiết

1. `Segmented` Tuần / Tháng (đổi chế độ thì về kỳ hiện tại).
2. Hàng chọn kỳ: nút ‹ / ›, giữa là "2/11 – 8/11/2026" + "Tuần này"/"Tuần trước"/…; nút mờ 40% khi hết giới hạn (lùi tối đa 50 tuần / 10 tháng, không qua tương lai).
3. 3 `KpiCard` ngang:
   - **Card hoàn thành** (nền brand, chữ trắng): số lớn + "+7 so với kỳ trước" / "-3 so với kỳ trước" / "Bằng kỳ trước".
   - **Ngày hoạt động**: "6/7" (số chia nhỏ hơn); tuần: hàng 7 chấm (có hoạt động = heat-3, không = heat-0).
   - **Card quá hạn**: số màu red + viền red-line + "Cần xử lý" nếu > 0; ngược lại "Tuyệt, không có!". Chạm → danh sách card quá hạn (sheet) có link mở từng card.
4. `BarChart` "Card xong theo ngày" + "TB 3,7/ngày": cột bo tròn màu heat-3, cột ngày tốt nhất màu heat-4, số trên đầu cột; nhãn T2…CN (tuần) hoặc 1…31 (tháng, chỉ hiện nhãn 1, 5, 10, 15, 20, 25, cuối tháng); cột hôm nay có nhãn "Nay" màu brand. SVG tự vẽ, không thêm thư viện.
5. Thẻ lời nhắn: Bubu cỡ 76 (`cheer` nếu delta ≥ 0, `happy` nếu âm, `calm` nếu kỳ trống) + câu nhận xét (lấy theo logic `note` trong file HTML gốc) + "Ngày năng suất nhất: Thứ Bảy 7/11 (6 card)".

## File dự kiến

`src/features/reports/{ReportView,PeriodPicker,KpiCard,BarChart,OverdueSheet}.tsx`, `src/features/activity/StatsPage.tsx`

## Tiêu chí hoàn thành

- [ ] Số liệu khớp `buildReport` với dữ liệu thật; tuần trước/tháng trước đúng
- [ ] Không bấm được qua kỳ tương lai, mờ nút khi tới giới hạn
- [ ] Biểu đồ tháng 31 cột vẫn vừa màn 390px
- [ ] Khớp ảnh 06 ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 8–9), plan/fe/FE-10-report.md, src/lib/report.ts,
và phần "note"/"rp" trong thẻ <script type="text/x-dc"> của plan/design/bubu-app-v2.dc.html.
Xem ảnh plan/design/screens/06-report.png (đính kèm). Làm task FE-10. Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

- Đã làm: `ReportView` (Segmented Tuần/Tháng đổi về kỳ hiện tại, hàng chọn kỳ, 3 KPI, biểu đồ, nhận xét của Bubu), `PeriodPicker` (nút mờ khi hết giới hạn 50 tuần / 10 tháng hoặc khi chạm tương lai), `KpiCard`, `BarChart` (SVG tự vẽ, tháng 31 cột co theo màn hình), `OverdueSheet` (danh sách card quá hạn, chạm mở card).
- Logic số liệu nằm trong `src/lib/report.ts` (`periodDays`, `periodLabel`, `buildReport`, `reportNote`, `reportMood`, `bestLine`, `canGoBack`, `canGoForward`), có 16 test.
- Quá hạn: KPI luôn hiện số card quá hạn **hiện tại** cho mọi kỳ. Prototype trong file HTML tạo số giả cho kỳ cũ, bản này không làm vậy vì không có dữ liệu lịch sử quá hạn.
- Cache quá hạn (`qk.overdue`) được làm mới sau khi chuyển, sửa hạn chót, xoá và khôi phục card.
- `npm run lint`, `npm test` (82 test) và `npm run build` đều qua.
- Chưa kiểm tra: số liệu khớp dữ liệu thật, tuần trước và tháng trước với dữ liệu thật, biểu đồ tháng trên thiết bị, và giao diện light/dark so với ảnh 06.
