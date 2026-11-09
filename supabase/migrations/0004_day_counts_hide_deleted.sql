-- =====================================================================
-- Bubu – migration 0004: day_counts không đếm card đã xoá mềm.
-- Xoá card thì heatmap, streak và báo cáo của ngày đó giảm theo. Không sửa 0002/0003: thay hàm bằng create or replace.
-- Xoá vẫn là xoá mềm (archived_at) để nút Hoàn tác còn hoạt động.
-- =====================================================================

-- ---------- Đếm card hoàn thành theo ngày (bỏ card đã xoá mềm) ----------
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
    and c.archived_at is null
  group by c.completed_on
  order by c.completed_on;
end $$;
