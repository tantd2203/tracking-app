# BE-07 · API nhãn, checklist

**Phụ thuộc:** BE-06 · **Ước lượng:** 2–3 giờ · **Nhánh:** `feat/be-07-labels-checklist-api`

## Mục tiêu

Hook cho phần Độ ưu tiên / Nhãn / Checklist ở màn Chi tiết card (FE-08). Độ ưu tiên đã đi qua `useUpdateCard` (BE-06).

## Yêu cầu chi tiết

`src/api/labels.ts`:

```ts
export function useLabels(): UseQueryResult<Label[]> // nhãn của người dùng, dùng chung mọi board
export function useCreateLabel(): Mutation<Label, { name: string; color: number }>
export function useToggleCardLabel(): Mutation<
  void,
  { cardId: string; boardId: string; labelId: string; on: boolean }
>
```

`src/api/checklist.ts`:

```ts
export function useAddChecklistItem(): Mutation<
  ChecklistItem,
  { cardId: string; boardId: string; text: string }
>
export function useUpdateChecklistItem(): Mutation<
  ChecklistItem,
  { id: string; cardId: string; boardId: string; patch: { text?: string; done?: boolean } }
>
export function useDeleteChecklistItem(): Mutation<
  void,
  { id: string; cardId: string; boardId: string }
>
```

- Tất cả optimistic trên `qk.card(cardId)`; sau khi xong cập nhật số `checklist.done/total` và `labels` trong `qk.board(boardId)` để thẻ ngoài Kanban đổi theo.
- Nhãn mới tạo xong thì tự gắn vào card đang mở (FE gọi 2 hook liên tiếp hoặc thêm tham số `attachTo?: cardId` – chọn 1, ghi chú).
- Item mới thêm cuối danh sách (`position = max + 1024`).
- Nhân bản board (BE-04) đã sao chép nhãn và checklist – kiểm tra lại khi test.

## File dự kiến

`src/api/labels.ts`, `src/api/checklist.ts`

## Tiêu chí hoàn thành

- [ ] Tick item đổi ngay trên màn chi tiết và số "2/5" trên thẻ Kanban
- [ ] Tạo nhãn mới với 1 trong 5 màu, gắn ngay vào card
- [ ] Bỏ gắn nhãn không xoá nhãn khỏi danh sách chung
- [ ] Không đọc/sửa được nhãn của người khác (RLS)

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 11), plan/01-conventions.md, plan/be/BE-07-labels-checklist-api.md và src/api/cards.ts.
Làm task BE-07: src/api/labels.ts và src/api/checklist.ts với optimistic update, đồng bộ cache board. Chưa làm giao diện.
```

## Ghi chú sau khi làm

…
