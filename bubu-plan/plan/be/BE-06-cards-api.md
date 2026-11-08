# BE-06 · API card và kéo thả

**Phụ thuộc:** BE-02, BE-04 · **Ước lượng:** 4 giờ · **Nhánh:** `feat/be-06-cards-api`

## Mục tiêu

Hook cho màn Board (FE-04, FE-05, FE-06) và Chi tiết card (FE-07): đọc card theo board, thêm, sửa, chuyển cột, hoàn thành, mở lại, xoá mềm.

## Yêu cầu chi tiết

`src/api/cards.ts`:

```ts
export type CardView = Card & {
  list: ListKey
  labels: Label[]
  checklist: { done: number; total: number }
}
export type BoardData = {
  board: Board
  lists: Record<ListKey, List>
  cards: Record<ListKey, CardView[]>
} // đã sắp theo position

export function useBoardData(boardId: string): UseQueryResult<BoardData>
export function useCard(
  cardId: string,
): UseQueryResult<CardView & { checklistItems: ChecklistItem[] }>
export function useCreateCard(): Mutation<Card, { boardId: string; list: ListKey; title: string }>
export function useUpdateCard(): Mutation<
  Card,
  { id: string; patch: Partial<Pick<Card, 'title' | 'description' | 'due_date' | 'priority'>> }
>
export function useMoveCard(): Mutation<
  Card,
  { cardId: string; boardId: string; toList: ListKey; toIndex: number }
>
export function useDeleteCard(): Mutation<void, { id: string; boardId: string }> // xoá mềm: archived_at = now()
```

- `useMoveCard`:
  1. Tính `position` mới bằng `positionBetween(prev?.position, next?.position)` ở vị trí `toIndex` của list đích.
  2. Cập nhật cache `qk.board(boardId)` **ngay** (optimistic): đổi list, chèn đúng chỗ; nếu vào Done gán `completed_on = hôm nay`.
  3. Gọi RPC `move_card(p_card_id, p_to_list, p_position, p_local_date = toLocalISO(new Date()))`.
  4. Lỗi → rollback + toast. Thành công → invalidate `qk.dayCounts` (heatmap) và `qk.boards` (số liệu board).
  5. Trả thêm cờ `completedNow: boolean` để FE mở popup ăn mừng.
- Hoàn thành từ màn chi tiết = `useMoveCard({ toList: 'done', toIndex: 0 })`; Mở lại = `toList: 'todo', toIndex: 0`.
- `useCreateCard` gọi RPC `create_card`, thêm optimistic vào cuối list.
- `useUpdateCard`: debounce là việc của FE; hook chỉ cần optimistic cho cả `qk.card(id)` lẫn `qk.board(boardId)`.
- Card có `archived_at` không hiện trong `useBoardData`.
- `src/lib/position.ts`: `positionBetween(a?: number, b?: number): number` (không có a → b − 1024; không có b → a + 1024; cả hai → trung bình) và `needsRebalance(list)` khi hai vị trí cách nhau < 0.0001. Có test.

## File dự kiến

`src/api/cards.ts`, `src/lib/position.ts`, `src/lib/position.test.ts`

## Tiêu chí hoàn thành

- [ ] Chuyển card hiển thị ngay, tải lại trang vẫn đúng thứ tự
- [ ] Vào Done → DB có `completed_on` = ngày giờ máy, activity `card_completed`, cờ `completedNow = true`
- [ ] Ra khỏi Done → xoá ngày hoàn thành, activity `card_reopened`
- [ ] Mất mạng khi kéo → card quay về chỗ cũ + toast lỗi
- [ ] Test `positionBetween` đủ 4 trường hợp

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md (quy tắc 1–4, 12), plan/01-conventions.md, plan/be/BE-06-cards-api.md.
Làm task BE-06: src/api/cards.ts với optimistic update cho move/create/update, src/lib/position.ts + test.
Dùng RPC move_card, create_card từ BE-04. Chưa làm giao diện.
```

## Ghi chú sau khi làm

- Đã làm: `src/api/cards.ts` gồm `useBoardData`, `useCard`, `useCreateCard`, `useUpdateCard`, `useMoveCard`, `useDeleteCard` (xoá mềm). `src/lib/position.ts` có `positionBetween` và `needsRebalance`, kèm test.
- `useMoveCard` tính `position` trong `onMutate` theo list đích, không tính card đang kéo. Cờ `completedNow` được tính so với list cũ.
- `useUpdateCard` không cần `boardId`: cập nhật card trong mọi cache `['board', …]`.
- Chưa làm: đánh số lại list khi `needsRebalance` trả true. Hàm đã có, nhưng chưa có RPC để gọi, nên hiện chỉ là hàm kiểm tra.
- `npm run lint`, `npm test` (41 test) và `npm run build` đều qua.
- Chưa kiểm tra trên Supabase thật: thứ tự sau khi tải lại, `completed_on`, activity `card_completed`/`card_reopened`, rollback khi mất mạng. Các mục này chưa tick.
