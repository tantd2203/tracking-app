-- =====================================================================
-- Bubu – migration 0003: day_cards không liệt kê card đã xoá mềm.
-- Chỉ đổi danh sách "card xong trong ngày". day_counts được đổi riêng ở migration 0004.
-- Không sửa 0002_rpc.sql: thay hàm bằng create or replace.
-- =====================================================================

-- ---------- Card hoàn thành trong một ngày (bỏ card đã xoá mềm) ----------
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
    and c.archived_at is null
  order by c.completed_at;
end $$;
