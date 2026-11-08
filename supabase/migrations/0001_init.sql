-- =====================================================================
-- Bubu – schema khởi tạo (theo tab "Plan code – thiết kế Bubu", mục 6)
-- Chạy bằng: supabase db push   hoặc dán vào SQL Editor trên dashboard.
-- Mọi bảng có user_id mặc định auth.uid() + RLS "chỉ thấy dòng của mình".
-- =====================================================================

-- ---------- Hồ sơ người dùng ----------
create table public.profiles (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  dark_mode     boolean not null default false,
  reminder_time time,
  language      text not null default 'vi',
  created_at    timestamptz not null default now()
);

-- Tự tạo profile khi có tài khoản mới
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Board / List / Card ----------
create table public.boards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  description text not null default '',
  color       smallint not null default 0 check (color between 0 and 3),
  pinned      boolean not null default false,
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);

create table public.lists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  board_id     uuid not null references public.boards (id) on delete cascade,
  key          text not null check (key in ('todo', 'doing', 'done')),
  name         text not null,
  position     double precision not null,
  -- "Hoàn thành" là thuộc tính của list, không phụ thuộc tên
  is_done_list boolean not null default false,
  unique (board_id, key)
);

create table public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  board_id     uuid not null references public.boards (id) on delete cascade,
  list_id      uuid not null references public.lists (id) on delete cascade,
  title        text not null,
  description  text not null default '',
  due_date     date,
  priority     text not null default 'none' check (priority in ('none', 'low', 'med', 'high')),
  position     double precision not null,
  completed_at timestamptz,
  -- ngày theo giờ máy lúc hoàn thành: heatmap/streak/báo cáo đếm theo cột này
  completed_on date,
  archived_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index cards_list_position_idx on public.cards (list_id, position);
create index cards_user_completed_idx on public.cards (user_id, completed_on);

-- ---------- Nhãn (dùng chung mọi board), checklist ----------
create table public.labels (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name    text not null,
  color   smallint not null default 0 check (color between 0 and 4)
);

create table public.card_labels (
  card_id  uuid not null references public.cards (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (card_id, label_id)
);

create table public.checklist_items (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  card_id  uuid not null references public.cards (id) on delete cascade,
  text     text not null,
  done     boolean not null default false,
  position double precision not null
);

-- ---------- Activity log (chỉ thêm, không sửa) ----------
create table public.activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  board_id    uuid references public.boards (id) on delete set null,
  card_id     uuid references public.cards (id) on delete set null,
  type        text not null check (type in ('card_created', 'card_moved', 'card_completed', 'card_reopened')),
  meta        jsonb not null default '{}',
  occurred_at timestamptz not null default now(),
  local_date  date not null
);

create index activities_user_date_idx on public.activities (user_id, local_date);

-- ---------- Row Level Security ----------
do $$
declare t text;
begin
  foreach t in array array['profiles', 'boards', 'lists', 'cards', 'labels', 'card_labels', 'checklist_items', 'activities']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end $$;

-- Activity log: không cho sửa / xoá từ app
drop policy "own rows" on public.activities;
create policy "read own" on public.activities for select using (user_id = auth.uid());
create policy "insert own" on public.activities for insert with check (user_id = auth.uid());
