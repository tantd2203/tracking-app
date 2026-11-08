# BE-04 · Migration 0002: hàm SQL (RPC)

**Phụ thuộc:** BE-01 · **Ước lượng:** 3–4 giờ · **Nhánh:** `feat/be-04-rpc`

## Mục tiêu

Gom các thao tác cần chạy "tất cả hoặc không gì cả" vào hàm SQL, để FE gọi một lần, không bị dữ liệu nửa vời.

## Tham chiếu

- Quy tắc 1–4, 8, 10, 12 trong `plan/00-overview.md`

## Phạm vi

**Làm:** file `supabase/migrations/0002_rpc.sql` với các hàm dưới đây + quyền `execute` cho role `authenticated`.
**Không làm:** hook TypeScript (BE-05…BE-08 sẽ gọi các hàm này).

## Yêu cầu chi tiết

Mọi hàm `security invoker` (để RLS vẫn áp dụng), `language plpgsql`, kiểm tra `auth.uid()` khác null.

| Hàm               | Tham số                                                                          | Việc                                                                                                                                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_board`    | `p_name text, p_description text, p_color smallint`                              | Tạo board + 3 list (`todo` "To Do" pos 1, `doing` "Doing" pos 2, `done` "Done" pos 3, `is_done_list` cho done). Trả về board.                                                                                                                                               |
| `duplicate_board` | `p_board_id uuid`                                                                | Sao chép board (tên + " (bản sao)"), 3 list, mọi card chưa xoá (giữ list, vị trí, nhãn, checklist; **xoá** `completed_at/completed_on` để không tính trùng heatmap). Trả board mới.                                                                                         |
| `move_card`       | `p_card_id uuid, p_to_list text, p_position double precision, p_local_date date` | Đổi list + vị trí. Vào Done từ list khác: set `completed_at = now()`, `completed_on = p_local_date`, ghi activity `card_completed`. Ra khỏi Done: xoá 2 cột, ghi `card_reopened`. Đổi list khác: ghi `card_moved`. Cùng list: chỉ đổi vị trí, không ghi activity. Trả card. |
| `create_card`     | `p_board_id uuid, p_list text, p_title text, p_local_date date`                  | Thêm card cuối list (position = max + 1024), ghi `card_created`.                                                                                                                                                                                                            |
| `day_counts`      | `p_from date, p_to date`                                                         | Trả `(day date, count int)` – số card có `completed_on` trong khoảng, gồm cả card đã xoá mềm.                                                                                                                                                                               |
| `day_cards`       | `p_day date`                                                                     | Trả `(card_id, title, board_id, board_name, completed_at)` của card xong ngày đó.                                                                                                                                                                                           |
| `board_stats`     | `p_today date`                                                                   | Mỗi board chưa lưu trữ: `board_id, total, doing, done, overdue` (overdue = chưa xong và `due_date < p_today`); không đếm card đã xoá mềm.                                                                                                                                   |

Thêm vào `create function public.handle_new_user()` (dùng `create or replace`): sau khi tạo profile, tạo board mẫu "Việc của tôi" bằng logic như `create_board` (lưu ý trigger chạy với quyền definer nên phải ghi `user_id = new.id` thủ công).

Sau khi viết: chạy `npm run db:push` rồi `npm run db:types`.

## File dự kiến

`supabase/migrations/0002_rpc.sql`, `src/api/database.types.ts` (sinh lại)

## Tiêu chí hoàn thành

- [x] Đăng ký user mới → có sẵn board "Việc của tôi" với 3 list
- [x] `move_card` vào/ra Done cập nhật đúng 2 cột ngày và ghi đúng loại activity
- [x] `day_counts` vẫn đếm card đã xoá mềm
- [x] User A gọi hàm với id của user B → không đọc/sửa được gì
- [x] File SQL có chú thích tiếng Việt cho từng hàm

## Kiểm thử

Viết `supabase/tests/0002_rpc_check.sql` (chạy tay trong SQL Editor) gồm các kịch bản: tạo board, thêm card, chuyển Doing, chuyển Done, mở lại, đếm `day_counts`.

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/be/BE-04-rpc-functions.md và supabase/migrations/0001_init.sql.
Làm task BE-04: viết supabase/migrations/0002_rpc.sql với các hàm trong bảng, cập nhật trigger handle_new_user tạo board mẫu,
và file kiểm thử supabase/tests/0002_rpc_check.sql. Không sửa 0001. Giải thích ngắn từng hàm bằng comment tiếng Việt.
```

## Ghi chú sau khi làm

- File: `supabase/migrations/0002_rpc.sql` (7 hàm + trigger `handle_new_user` có board mẫu), `supabase/tests/0002_rpc_check.sql` (chạy tay).
- Quyết định: thêm card trực tiếp vào Done bị từ chối (phải đi qua `move_card` để ghi đúng ngày hoàn thành).
- Quyết định: `move_card` vào Done ghi `card_completed`, ra khỏi Done ghi `card_reopened`, đổi giữa các list khác ghi `card_moved`. Không ghi `card_moved` khi vào hoặc ra khỏi Done.
- Tên list là `To Do` / `Doing` / `Done` theo spec. `src/lib/boards.ts` (việc 1) đang dùng `Cần làm` / `Đang làm` / `Hoàn thành`. BE-05 sẽ chuyển sang RPC `create_board` nên tên sẽ thống nhất.
- Kiểm tra: dựng Postgres local (pgserver), giả lập `auth.uid()` và role `authenticated` / `anon`, áp dụng `0001` rồi `0002`, chạy 28 kiểm tra (đăng ký, vòng đời card, đếm ngày, thống kê, nhân bản, cô lập user A/B, quyền anon). Kết quả 28/28 pass. Đây không phải production.
- Đã áp dụng lên production (`npm run db:push --yes`, có xác nhận của chủ project). `supabase migration list --remote` hiện `0001` và `0002`. Đã chạy `npm run db:types`, `database.types.ts` có 7 hàm RPC.
- Lưu ý: `handle_new_user` mới chỉ tạo board mẫu cho user đăng ký sau khi áp dụng. User cũ không có board mẫu.
