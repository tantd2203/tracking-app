# Bubu – App theo dõi công việc cá nhân

PWA dạng Kanban: mỗi card hoàn thành tô màu một ô heatmap (kiểu GitHub), có streak, báo cáo tuần/tháng và linh vật cá voi Bubu.
Đây là **project base – giai đoạn 0** theo tài liệu "Plan code – thiết kế Bubu".

## Đã có sẵn

- Vite + React 19 + TypeScript, React Router, TanStack Query
- Tailwind CSS v4 với **design token light/dark lấy từ file thiết kế** (`src/styles/index.css`)
- PWA: manifest, icon Bubu, service worker, cài được lên màn hình chính iPhone
- Linh vật `Whale` (4 tâm trạng, phun nước) và các component nền tảng: `Button3D`, `Segmented`, `Toggle`, `TextField`, `BottomSheet`, `TabBar`, `ScreenHeader`, toast + thanh hoàn tác
- Khung 3 tab Board · Thống kê · Tôi, màn Đăng nhập, trạng thái trống, chế độ tối hoạt động
- Hàm tính mức heatmap / streak / kỷ lục / tâm trạng Bubu kèm unit test (`src/lib/heat.ts`)
- Supabase client + migration đầy đủ bảng và Row Level Security (`supabase/migrations`)
- ESLint + Prettier + Vitest + GitHub Actions + cấu hình chạy sẵn cho WebStorm (`.run/`)

## Yêu cầu

- **Node.js 22.23.2** (ghi trong `.nvmrc`; tối thiểu 22.12)
- npm 10 (đi kèm Node)
- WebStorm (hoặc editor bất kỳ)

## Mở bằng WebStorm

1. **File → Open…** chọn thư mục `bubu-app`.
2. **Settings → Languages & Frameworks → Node.js**: chọn Node interpreter 22.23.2, package manager `npm`.
3. Khi WebStorm hỏi _"Run npm install"_ thì bấm chạy (hoặc mở Terminal: `npm install`).
4. **Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint**: chọn _Automatic ESLint configuration_, tick _Run eslint --fix on save_.
5. **Settings → Languages & Frameworks → JavaScript → Prettier**: chọn _Automatic Prettier configuration_, tick _Run on save_.
6. **Settings → Languages & Frameworks → TypeScript**: TypeScript chọn bản trong `node_modules/typescript` (6.0).
7. Trên thanh công cụ, dropdown Run đã có sẵn: **npm dev**, **npm test**, **npm build**, **npm lint** → bấm ▶ `npm dev` rồi mở http://localhost:5173.

> Không có `.env.local` thì app chạy **chế độ demo**: làm giao diện bình thường, đăng nhập chỉ chuyển màn.
> Trang **http://localhost:5173/dev/components** hiển thị toàn bộ component để so với file thiết kế.

## Lệnh

| Lệnh                | Việc                                                     |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Chạy dev server (mở được từ điện thoại cùng WiFi)        |
| `npm run build`     | Kiểm tra kiểu + build ra `dist/`                         |
| `npm run preview`   | Chạy thử bản build (có service worker)                   |
| `npm run typecheck` | Chỉ kiểm tra TypeScript                                  |
| `npm run lint`      | ESLint (`lint:fix` để tự sửa)                            |
| `npm run format`    | Prettier format toàn bộ (`format:check` để chỉ kiểm tra) |
| `npm test`          | Chạy unit test một lần (`test:watch` để chạy liên tục)   |

## Kết nối Supabase

1. Tạo project trên supabase.com (region Singapore).
2. Mở **SQL Editor**, dán và chạy file `supabase/migrations/0001_init.sql`
   (hoặc dùng Supabase CLI: `supabase link` rồi `supabase db push`).
3. Copy `.env.example` thành `.env.local`, điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (Settings → API).
4. Khởi động lại `npm run dev`.

Chỉ dùng **anon key**. Không bao giờ đưa khoá `service_role` vào code hoặc repo.

## Thử trên iPhone

- **Giao diện:** chạy `npm run dev`, iPhone cùng WiFi mở địa chỉ `Network: http://192.168.x.x:5173` mà terminal in ra.
- **PWA (thêm vào màn hình chính):** cần HTTPS → dùng link Preview/Production của Vercel, mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính.

## Cấu trúc thư mục

```
src/
├─ app/            router, layout có/không thanh tab, theme sáng–tối
├─ components/     Whale, Button3D, Segmented, Toggle, TextField, BottomSheet, TabBar, toast…
├─ features/
│  ├─ auth/        Đăng nhập
│  ├─ boards/      Danh sách board, Board Kanban
│  ├─ cards/       Chi tiết card
│  ├─ activity/    Thống kê – heatmap, streak, trạng thái trống
│  ├─ reports/     Báo cáo tuần/tháng (giai đoạn 7)
│  ├─ me/          Tôi
│  └─ dev/         Trang xem bộ component
├─ lib/            supabase client, xử lý ngày, tính heatmap/streak (+ test)
├─ styles/         design tokens + Tailwind
└─ main.tsx
supabase/migrations/   SQL tạo bảng + RLS
.github/workflows/     CI: lint, format, test, build
.run/                  cấu hình Run dùng chung cho WebStorm
```

## Quản lý mã nguồn

```bash
git init
git add .
git commit -m "chore: khởi tạo project base Bubu (giai đoạn 0)"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/bubu-app.git
git push -u origin main
```

- `main` luôn chạy được; làm việc trên nhánh `feat/<giai-đoạn>-<màn>` hoặc `fix/<tên>`, merge qua pull request khi CI xanh.
- Commit theo dạng `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `db:`.
- Đổi database = thêm file mới `supabase/migrations/0002_….sql`, không sửa file cũ.

## Deploy (Vercel – miễn phí)

1. Import repo GitHub trên vercel.com, framework **Vite** (tự nhận).
2. Thêm Environment Variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` cho Production + Preview.
3. Mỗi lần push: nhánh khác `main` → link Preview; merge vào `main` → Production.
   `vercel.json` đã cấu hình để mọi đường dẫn (vd. `/boards`) đều mở được app.

**Địa chỉ:**

- Production: https://bubu-app-phi.vercel.app
- Supabase: https://djcmtwevzpalkajinylx.supabase.co (project `bubu-production`, dùng cho cả local và production)

## Ghi chú kỹ thuật

- **TypeScript 6.0** (không phải 7) vì `typescript-eslint` – bộ ESLint mà WebStorm dùng – chưa hỗ trợ TypeScript 7.
- **Tailwind v4** không còn `tailwind.config.js`: token khai báo trong `src/styles/index.css` (`@theme`), dùng như `bg-surface`, `text-ink2`, `border-line`, `bg-heat-3`.
- Rung (`navigator.vibrate`) không chạy trên Safari iPhone; luôn kiểm tra `if (navigator.vibrate)` trước khi gọi.
