# BE-05 · API board

**Phụ thuộc:** BE-02, BE-04 · **Ước lượng:** 3 giờ · **Nhánh:** `feat/be-05-boards-api`

## Mục tiêu

Hook đầy đủ cho màn Danh sách board (FE-02, FE-03).

## Yêu cầu chi tiết

`src/api/boards.ts`:

```ts
export type BoardWithStats = Board & {
  total: number
  doing: number
  done: number
  overdue: number
  pct: number // % xong, làm tròn
}

export function useBoards(): UseQueryResult<{
  active: BoardWithStats[]
  archived: BoardWithStats[]
}>
export function useCreateBoard(): Mutation<
  Board,
  { name: string; description?: string; color: number }
>
export function useUpdateBoard(): Mutation<
  Board,
  { id: string; patch: Partial<Pick<Board, 'name' | 'description' | 'color' | 'pinned'>> }
>
export function useArchiveBoard(): Mutation<void, { id: string; archived: boolean }> // lưu trữ / khôi phục
export function useDuplicateBoard(): Mutation<Board, { id: string }>
export function useDeleteBoard(): {
  /** Xoá khỏi cache ngay + trả về hàm undo; sau 5 giây mới gọi DB xoá thật */
  scheduleDelete(id: string): { undo: () => void }
}
```

- `useBoards`: lấy `boards` + gọi RPC `board_stats(p_today = toLocalISO(new Date()))`, ghép lại; sắp xếp **ghim lên đầu**, rồi theo `created_at` tăng dần. Tách `active` / `archived`.
- Màu mặc định khi tạo = `số board hiện có % 4` (FE truyền vào, ghi rõ trong JSDoc).
- Mọi mutation cập nhật **optimistic** cache `qk.boards` và rollback khi lỗi.
- `scheduleDelete`: dùng `setTimeout` 5000 ms; `undo()` huỷ timer và khôi phục cache. Nếu người dùng đóng app trước 5 giây thì không xoá (chấp nhận được – ghi vào ghi chú).
- `src/lib/search.ts`: `normalizeVi(text)` bỏ dấu (gồm đ → d), viết thường; `matchBoard(board, query)` so với tên + mô tả. Có test.

## File dự kiến

`src/api/boards.ts`, `src/lib/search.ts`, `src/lib/search.test.ts`

## Tiêu chí hoàn thành

- [x] Tạo board xuất hiện ngay (optimistic) và có 3 list trong DB
- [ ] Ghim/bỏ ghim đổi thứ tự ngay
- [ ] Lưu trữ → chuyển sang `archived`; khôi phục → quay lại `active`
- [ ] Xoá có thể hoàn tác trong 5 giây, quá 5 giây thì DB không còn board
- [ ] Nhân bản tạo board mới kèm card
- [x] `normalizeVi('Học tiếng Nhật')` = `'hoc tieng nhat'`, `'Đà Lạt'` → `'da lat'`

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/01-conventions.md, plan/be/BE-05-boards-api.md.
Làm task BE-05: src/api/boards.ts (hook board có optimistic update), src/lib/search.ts + test.
Dùng RPC create_board, duplicate_board, board_stats từ BE-04. Chưa làm giao diện.
```

## Ghi chú sau khi làm

- `src/api/boards.ts`: `useBoards` (board + `board_stats`, ghim lên đầu, tách `active`/`archived`), `useCreateBoard` (RPC `create_board`), `useUpdateBoard`, `useArchiveBoard`, `useDuplicateBoard` (RPC `duplicate_board`), `useDeleteBoard` (`scheduleDelete` với hoàn tác 5 giây). Mutation optimistic, rollback khi lỗi.
- `src/lib/search.ts` + test: `normalizeVi`, `matchBoard`.
- Đã xoá `src/lib/boards.ts` (bản tạm của việc 1). `BoardsPage` dùng hook mới, màu = `số board % 4`. Tên list giờ do RPC đặt: `To Do` / `Doing` / `Done`.
- Lưu ý: `scheduleDelete` dùng `setTimeout`, nên nếu đóng app trong 5 giây thì board không bị xoá trong DB (chấp nhận được theo spec).
- Lưu ý: board chưa lưu trữ mới có thống kê từ `board_stats`. Board đã lưu trữ hiện 0 cho mọi chỉ số.
- Chưa kiểm tra trên app: tạo board hiện ngay, ghim đổi thứ tự, lưu trữ/khôi phục, hoàn tác xoá, nhân bản. Các mục này cần thử tay ở FE-02/FE-03.

- Kiểm tra trên trình duyệt: tạo board qua giao diện → hiện trong danh sách, API `create_board` 200, board còn sau khi tải lại ✅. Dữ liệu test đã được xoá.
- Chưa kiểm tra trên trình duyệt: ghim, lưu trữ/khôi phục, xoá có hoàn tác, nhân bản.
