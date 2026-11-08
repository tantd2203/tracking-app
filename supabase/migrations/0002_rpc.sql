-- =====================================================================
-- Bubu – migration 0002: hàm SQL (RPC) cho các thao tác cần "tất cả hoặc không gì cả"
-- Theo plan/be/BE-04-rpc-functions.md.
-- Mọi hàm: security invoker (RLS vẫn áp dụng), kiểm tra auth.uid() khác null.
-- Không sửa 0001_init.sql: trigger handle_new_user được thay bằng create or replace.
-- =====================================================================

-- ---------- Tạo board + 3 list mặc định ----------
-- Trả về board vừa tạo. List: todo (pos 1), doing (pos 2), done (pos 3, là list hoàn thành).
create or replace function public.create_board(
  p_name text,
  p_description text default '',
  p_color smallint default 0
)
returns public.boards
language plpgsql
security invoker
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_board public.boards;
begin
  if v_uid is null then raise exception 'Chưa đăng nhập' using errcode = '42501'; end if;

  insert into public.boards (user_id, name, description, color)
  values (v_uid, p_name, coalesce(p_description, ''), coalesce(p_color, 0))
  returning * into v_board;

  insert into public.lists (user_id, board_id, key, name, position, is_done_list) values
    (v_uid, v_board.id, 'todo', 'To Do', 1, false),
    (v_uid, v_board.id, 'doing', 'Doing', 2, false),
    (v_uid, v_board.id, 'done', 'Done', 3, true);

  return v_board;
end $$;

-- ---------- Nhân bản board ----------
-- Sao chép tên (+ " (bản sao)"), 3 list, mọi card chưa xoá kèm nhãn và checklist.
-- Không chép completed_at / completed_on để không làm nhạt heatmap của ngày cũ.
create or replace function public.duplicate_board(p_board_id uuid)
returns public.boards
language plpgsql
security invoker
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_src public.boards;
  v_new public.boards;
  v_card record;
  v_new_card_id uuid;
begin
  if v_uid is null then raise exception 'Chưa đăng nhập' using errcode = '42501'; end if;

  select * into v_src from public.boards where id = p_board_id and archived_at is null;
  if not found then raise exception 'Không tìm thấy board'; end if;

  v_new := public.create_board(left(v_src.name || ' (bản sao)', 40), v_src.description, v_src.color);

  for v_card in
    select c.id, c.title, c.description, c.due_date, c.priority, c.position, l.key as list_key
    from public.cards c
    join public.lists l on l.id = c.list_id
    where c.board_id = p_board_id and c.archived_at is null
    order by c.position
  loop
    insert into public.cards (user_id, board_id, list_id, title, description, due_date, priority, position)
    values (
      v_uid,
      v_new.id,
      (select l.id from public.lists l where l.board_id = v_new.id and l.key = v_card.list_key),
      v_card.title,
      v_card.description,
      v_card.due_date,
      v_card.priority,
      v_card.position
    )
    returning id into v_new_card_id;

    insert into public.card_labels (card_id, label_id, user_id)
    select v_new_card_id, cl.label_id, v_uid
    from public.card_labels cl
    where cl.card_id = v_card.id;

    insert into public.checklist_items (user_id, card_id, text, done, position)
    select v_uid, v_new_card_id, ci.text, ci.done, ci.position
    from public.checklist_items ci
    where ci.card_id = v_card.id;
  end loop;

  return v_new;
end $$;

-- ---------- Thêm card cuối list ----------
-- Không cho thêm trực tiếp vào list Done (phải đi qua move_card để ghi đúng ngày hoàn thành).
create or replace function public.create_card(
  p_board_id uuid,
  p_list text,
  p_title text,
  p_local_date date
)
returns public.cards
language plpgsql
security invoker
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_list public.lists;
  v_pos double precision;
  v_card public.cards;
begin
  if v_uid is null then raise exception 'Chưa đăng nhập' using errcode = '42501'; end if;
  if btrim(coalesce(p_title, '')) = '' then raise exception 'Tên card không được để trống'; end if;

  select * into v_list from public.lists where board_id = p_board_id and key = p_list;
  if not found then raise exception 'Không tìm thấy list %', p_list; end if;
  if v_list.is_done_list then raise exception 'Không thêm card trực tiếp vào Done'; end if;

  select coalesce(max(c.position), 0) + 1024 into v_pos
  from public.cards c
  where c.list_id = v_list.id and c.archived_at is null;

  insert into public.cards (user_id, board_id, list_id, title, position)
  values (v_uid, p_board_id, v_list.id, btrim(p_title), v_pos)
  returning * into v_card;

  insert into public.activities (user_id, board_id, card_id, type, meta, local_date)
  values (v_uid, p_board_id, v_card.id, 'card_created', jsonb_build_object('list', p_list), p_local_date);

  return v_card;
end $$;

-- ---------- Chuyển card giữa các list ----------
-- Vào Done từ list khác: set completed_at = now(), completed_on = p_local_date, ghi card_completed.
-- Ra khỏi Done: xoá completed_at / completed_on, ghi card_reopened.
-- Đổi sang list khác (không liên quan Done): ghi card_moved.
-- Cùng list: chỉ đổi vị trí, không ghi activity.
create or replace function public.move_card(
  p_card_id uuid,
  p_to_list text,
  p_position double precision,
  p_local_date date
)
returns public.cards
language plpgsql
security invoker
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_card public.cards;
  v_from public.lists;
  v_to public.lists;
  v_result public.cards;
  v_type text;
  v_meta jsonb;
begin
  if v_uid is null then raise exception 'Chưa đăng nhập' using errcode = '42501'; end if;

  select * into v_card from public.cards where id = p_card_id and archived_at is null for update;
  if not found then raise exception 'Không tìm thấy card'; end if;

  select * into v_from from public.lists where id = v_card.list_id;
  select * into v_to from public.lists where board_id = v_card.board_id and key = p_to_list;
  if not found then raise exception 'Không tìm thấy list %', p_to_list; end if;

  if v_to.id = v_from.id then
    update public.cards set position = p_position, updated_at = now()
    where id = p_card_id
    returning * into v_result;
    return v_result;
  end if;

  update public.cards set
    list_id = v_to.id,
    position = p_position,
    completed_at = case
      when v_to.is_done_list then now()
      when v_from.is_done_list then null
      else completed_at
    end,
    completed_on = case
      when v_to.is_done_list then p_local_date
      when v_from.is_done_list then null
      else completed_on
    end,
    updated_at = now()
  where id = p_card_id
  returning * into v_result;

  if v_to.is_done_list then
    v_type := 'card_completed';
    v_meta := jsonb_build_object('from', v_from.key);
  elsif v_from.is_done_list then
    v_type := 'card_reopened';
    v_meta := jsonb_build_object('to', v_to.key);
  else
    v_type := 'card_moved';
    v_meta := jsonb_build_object('from', v_from.key, 'to', v_to.key);
  end if;

  insert into public.activities (user_id, board_id, card_id, type, meta, local_date)
  values (v_uid, v_result.board_id, v_result.id, v_type, v_meta, p_local_date);

  return v_result;
end $$;

-- ---------- Đếm card hoàn thành theo ngày (kể cả card đã xoá mềm) ----------
create or replace function public.day_counts(p_from date, p_to date)
returns table (day date, count int)
language plpgsql
stable
security invoker
set search_path = public
as $$
#variable_conflict use_column
begin
  return query
  select c.completed_on, count(*)::int
  from public.cards c
  where c.completed_on between p_from and p_to
  group by c.completed_on
  order by c.completed_on;
end $$;

-- ---------- Card hoàn thành trong một ngày (kể cả card đã xoá mềm) ----------
create or replace function public.day_cards(p_day date)
returns table (card_id uuid, title text, board_id uuid, board_name text, completed_at timestamptz)
language plpgsql
stable
security invoker
set search_path = public
as $$
#variable_conflict use_column
begin
  return query
  select c.id, c.title, c.board_id, b.name, c.completed_at
  from public.cards c
  join public.boards b on b.id = c.board_id
  where c.completed_on = p_day
  order by c.completed_at;
end $$;

-- ---------- Thống kê theo board (không đếm card đã xoá mềm) ----------
-- overdue = card chưa xong (không ở list Done) và due_date < p_today.
create or replace function public.board_stats(p_today date)
returns table (board_id uuid, total int, doing int, done int, overdue int)
language plpgsql
stable
security invoker
set search_path = public
as $$
#variable_conflict use_column
begin
  return query
  select
    b.id,
    count(c.id)::int,
    (count(c.id) filter (where l.key = 'doing'))::int,
    (count(c.id) filter (where l.key = 'done'))::int,
    (count(c.id) filter (where l.is_done_list = false and c.due_date < p_today))::int
  from public.boards b
  left join public.cards c on c.board_id = b.id and c.archived_at is null
  left join public.lists l on l.id = c.list_id
  where b.archived_at is null
  group by b.id;
end $$;

-- ---------- Trigger: tạo profile + board mẫu khi có user mới ----------
-- Chạy với quyền definer nên ghi user_id = new.id thủ công.
-- User đã có trước migration này không được tạo board mẫu.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_board_id uuid;
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, split_part(new.email, '@', 1));

  insert into public.boards (user_id, name)
  values (new.id, 'Việc của tôi')
  returning id into v_board_id;

  insert into public.lists (user_id, board_id, key, name, position, is_done_list) values
    (new.id, v_board_id, 'todo', 'To Do', 1, false),
    (new.id, v_board_id, 'doing', 'Doing', 2, false),
    (new.id, v_board_id, 'done', 'Done', 3, true);

  return new;
end;
$$;

-- ---------- Quyền thực thi ----------
-- Supabase cấp execute mặc định cho anon; chỉ user đã đăng nhập được gọi các hàm này.
revoke all on function public.create_board(text, text, smallint) from public, anon;
revoke all on function public.duplicate_board(uuid) from public, anon;
revoke all on function public.create_card(uuid, text, text, date) from public, anon;
revoke all on function public.move_card(uuid, text, double precision, date) from public, anon;
revoke all on function public.day_counts(date, date) from public, anon;
revoke all on function public.day_cards(date) from public, anon;
revoke all on function public.board_stats(date) from public, anon;

grant execute on function public.create_board(text, text, smallint) to authenticated;
grant execute on function public.duplicate_board(uuid) to authenticated;
grant execute on function public.create_card(uuid, text, text, date) to authenticated;
grant execute on function public.move_card(uuid, text, double precision, date) to authenticated;
grant execute on function public.day_counts(date, date) to authenticated;
grant execute on function public.day_cards(date) to authenticated;
grant execute on function public.board_stats(date) to authenticated;
