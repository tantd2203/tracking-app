-- =====================================================================
-- Kiểm thử tay cho migration 0002 (BE-04). Chạy trong SQL Editor trên dashboard.
-- Trước khi chạy: thay <UUID_USER_A> và <UUID_USER_B> bằng id thật trong Authentication → Users.
-- Chạy từng khối, đọc kết quả ở mỗi bước. Các bước đều có comment mô tả kỳ vọng.
-- File này không đổi dữ liệu user thật ngoài các board/card test; xoá chúng khi xong.
-- =====================================================================

-- 0) Giả lập user A đã đăng nhập
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"<UUID_USER_A>"}', false);

-- 1) Tạo board: kỳ vọng 1 board và 3 list todo/doing/done (list done có is_done_list = true)
select * from public.create_board('Test BE-04', '', 0::smallint);
select l.key, l.name, l.position, l.is_done_list
from public.lists l join public.boards b on b.id = l.board_id
where b.name = 'Test BE-04' order by l.position;

-- 2) Thêm card vào todo: kỳ vọng position = 1024
select public.create_card(
  (select id from public.boards where name = 'Test BE-04'), 'todo', 'Viết báo cáo', current_date
);

-- 3) Thêm card trực tiếp vào done: kỳ vọng lỗi "Không thêm card trực tiếp vào Done"
-- select public.create_card((select id from public.boards where name = 'Test BE-04'), 'done', 'X', current_date);

-- 4) Chuyển todo → doing: completed_at và completed_on vẫn null, activity card_moved
select public.move_card(
  (select id from public.cards where title = 'Viết báo cáo'), 'doing', 2048, current_date
);

-- 5) Chuyển doing → done: kỳ vọng completed_at có giá trị, completed_on = hôm nay, activity card_completed
select public.move_card(
  (select id from public.cards where title = 'Viết báo cáo'), 'done', 3072, current_date
);
select title, completed_at, completed_on from public.cards where title = 'Viết báo cáo';

-- 6) Mở lại (done → todo): kỳ vọng completed_at và completed_on đều null, activity card_reopened
select public.move_card(
  (select id from public.cards where title = 'Viết báo cáo'), 'todo', 1024, current_date
);
select title, completed_at, completed_on from public.cards where title = 'Viết báo cáo';

-- 7) Hoàn thành lại rồi đếm theo ngày: kỳ vọng day_counts có 1 dòng với count = 1 cho hôm nay
select public.move_card(
  (select id from public.cards where title = 'Viết báo cáo'), 'done', 3072, current_date
);
select * from public.day_counts(current_date - 7, current_date);

-- 8) Xoá mềm card: day_counts vẫn đếm (kỳ vọng count không đổi)
update public.cards set archived_at = now() where title = 'Viết báo cáo';
select * from public.day_counts(current_date - 7, current_date);

-- 9) Thống kê và nhân bản board
select * from public.board_stats(current_date) where board_id = (select id from public.boards where name = 'Test BE-04');
select public.duplicate_board((select id from public.boards where name = 'Test BE-04'));

-- 10) Dọn dữ liệu test (chạy khi đã kiểm tra xong)
-- delete from public.boards where name in ('Test BE-04', 'Test BE-04 (bản sao)');

-- 11) Cô lập: đăng nhập user B, kỳ vọng không thấy board của A và mọi hàm trả về rỗng hoặc lỗi
-- set role authenticated;
-- select set_config('request.jwt.claims', '{"sub":"<UUID_USER_B>"}', false);
-- select count(*) from public.boards where name = 'Test BE-04';   -- kỳ vọng 0
-- select public.duplicate_board((select id from public.boards where name = 'Test BE-04'));  -- kỳ vọng lỗi không tìm thấy

reset role;
