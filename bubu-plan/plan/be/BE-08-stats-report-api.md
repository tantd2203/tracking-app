# BE-08 · API thống kê & hàm tính báo cáo

**Phụ thuộc:** BE-04 · **Ước lượng:** 3–4 giờ · **Nhánh:** `feat/be-08-stats-api`

## Mục tiêu

Dữ liệu cho heatmap, streak, popup ăn mừng (FE-06, FE-09) và báo cáo tuần/tháng (FE-10).

## Yêu cầu chi tiết

`src/api/stats.ts`:

```ts
/** Số card xong mỗi ngày trong 364 ngày gần nhất (đủ cho heatmap 52 tuần và streak) */
export function useYearCounts(): UseQueryResult<DayCounts>
/** Card xong trong một ngày – thẻ chi tiết khi chạm ô heatmap */
export function useDayCards(
  day: string,
): UseQueryResult<{ id: string; title: string; boardName: string }[]>
/** Gói tiện dùng cho banner/hero/popup */
export function useStreakSummary(): {
  streak: number
  record: number
  today: number
  totalYear: number
  activeDays: number
  mood: WhaleMoodKey
  loading: boolean
}
/** Số card đang quá hạn (mọi board) */
export function useOverdueCount(): UseQueryResult<number>
```

- `useYearCounts` gọi RPC `day_counts(from = hôm nay − 363, to = hôm nay)`, đổi thành object `DayCounts` (ngày không có = 0). Streak chỉ tính trong 364 ngày này (giới hạn chấp nhận được, ghi vào ghi chú).
- `useStreakSummary` dùng `currentStreak`, `bestStreak`, `whaleMood` có sẵn trong `src/lib/heat.ts`.
- Báo cáo kỳ trước cần dữ liệu cũ hơn 364 ngày khi lùi 50 tuần/10 tháng → thêm `useRangeCounts(from, to)` dùng chung RPC.

`src/lib/report.ts` (hàm thuần, có test) – dựa trên logic prototype trong `plan/design/bubu-app-v2.dc.html`:

```ts
export type PeriodKind = 'week' | 'month'
export function periodDays(kind: PeriodKind, offset: number, today: Date): Date[] // tuần T2→CN, tháng 1→cuối tháng; offset 0 = kỳ hiện tại, -1 = kỳ trước
export function periodLabel(
  kind: PeriodKind,
  offset: number,
  today: Date,
): { label: string; sub: string } // "2/11 – 8/11/2026", "Tuần này" | "Tuần trước" | "Tháng 11/2026"
export function buildReport(
  counts: DayCounts,
  kind: PeriodKind,
  offset: number,
  today: Date,
): {
  total: number
  delta: number
  active: number
  denom: number
  avg: string // "3,7"
  bars: { label: string; value: number; isToday: boolean }[]
  bestDay: { date: Date; count: number } | null
}
```

- `denom` = 7 với tuần; với tháng = số ngày **đã qua** của tháng (tháng cũ = đủ số ngày).
- `avg` = total ÷ số ngày đã qua, 1 chữ số thập phân, dấu phẩy.
- `delta` = total kỳ này − total kỳ trước (kỳ trước tính đủ ngày).
- Giới hạn lùi: 50 tuần / 10 tháng; không cho offset > 0.

## File dự kiến

`src/api/stats.ts`, `src/lib/report.ts`, `src/lib/report.test.ts`

## Tiêu chí hoàn thành

- [ ] `useYearCounts` đúng với dữ liệu DB, tự cập nhật sau khi hoàn thành card (invalidate từ BE-06)
- [ ] Test `periodDays`: tuần chứa Chủ nhật, tháng 2 năm nhuận/không nhuận, tháng 30 và 31 ngày
- [ ] Test `buildReport`: kỳ đang diễn ra, kỳ trống, delta âm/dương, bestDay
- [ ] `useStreakSummary` trả đúng 4 tâm trạng theo quy tắc 7

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 4–9), plan/be/BE-08-stats-report-api.md, src/lib/heat.ts,
và phần periodDays/report trong thẻ <script type="text/x-dc"> của plan/design/bubu-app-v2.dc.html.
Làm task BE-08: src/api/stats.ts và src/lib/report.ts kèm test đầy đủ. Chưa làm giao diện.
```

## Ghi chú sau khi làm

- Đã làm một phần, để FE-06 dùng: `src/api/stats.ts` gồm `yearRange`, `useRangeCounts`, `useYearCounts` (364 ngày, key `qk.dayCounts`), `getCachedYearCounts`, `useStreakSummary`. Giới hạn 364 ngày được chấp nhận như spec.
- Đã thêm `useDayCards` (FE-09 dùng cho chi tiết ngày).
- Đã làm thêm ở FE-10: `useOverdueCount`, `useOverdueCards`, và `src/lib/report.ts` (`periodDays`, `periodLabel`, `buildReport`) cùng test.
- `npm run lint`, `npm test` và `npm run build` đều qua (phần đã làm có test qua `celebrate.test.ts` và `heat.test.ts`).
- Chưa kiểm tra số liệu với dữ liệu thật.
