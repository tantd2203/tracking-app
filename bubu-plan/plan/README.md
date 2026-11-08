# Plan task để vibe code Bubu

Thư mục này chia toàn bộ app thành **task nhỏ, độc lập**, mỗi task một file, để giao cho AI (Claude Code, Cursor…) code từng việc một rồi bạn kiểm tra.

```
plan/
├─ README.md            ← bạn đang đọc: cách dùng
├─ PROGRESS.md          ← bảng tiến độ + thứ tự làm (FE và BE xen kẽ)
├─ 00-overview.md       ← app là gì, kiến trúc, quy tắc nghiệp vụ cốt lõi
├─ 01-conventions.md    ← quy ước code, đặt tên, Git, "thế nào là xong"
├─ design/
│  ├─ README.md         ← cách xem thiết kế, token, map màn ↔ file ảnh
│  ├─ screens/*.png     ← ảnh chụp 8 màn hình từ file thiết kế
│  └─ bubu-app-v2.dc.html + support.js   ← file thiết kế gốc (bấm thử được)
├─ be/BE-01 … BE-10     ← Backend: Supabase (DB, RLS, RPC) + lớp gọi API `src/api`
└─ fe/FE-01 … FE-12     ← Frontend: màn hình, component, tương tác
```

## FE và BE chia ranh giới thế nào?

App không có server riêng; "BE" là **Supabase + lớp truy cập dữ liệu**:

| Phần   | Làm gì                                                                                                   | Nằm ở đâu                          |
| ------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **BE** | Bảng, RLS, hàm SQL (RPC), cấu hình Auth; hàm gọi Supabase có kiểu rõ ràng và hook TanStack Query         | `supabase/migrations/`, `src/api/` |
| **FE** | Màn hình, component, tương tác, animation; chỉ gọi hook từ `src/api`, **không gọi `supabase` trực tiếp** | `src/features/`, `src/components/` |

Nhờ vậy một task BE xong là có "hợp đồng" (hàm + kiểu dữ liệu) để task FE dùng, và có thể giao hai task cho hai phiên AI khác nhau.

## Quy trình mỗi task

1. Mở `PROGRESS.md`, lấy task **đầu tiên chưa xong mà các task phụ thuộc đã xong**.
2. Tạo nhánh theo tên ghi trong task, ví dụ `git checkout -b feat/fe-04-kanban`.
3. Copy phần **"Prompt cho AI"** ở cuối file task, dán cho AI. Prompt đã nhắc AI đọc `CLAUDE.md`, `00-overview.md` và file task.
4. AI code xong → bạn chạy `npm run lint && npm test && npm run build`, mở app so với ảnh thiết kế.
5. Tick các ô trong mục **"Tiêu chí hoàn thành"** của file task; còn ô nào chưa đạt thì nhờ AI sửa tiếp.
6. Commit, mở pull request, merge khi CI xanh; đánh dấu ✅ trong `PROGRESS.md`.

## Mẹo vibe code

- **Mỗi lần chỉ giao 1 task.** Task lớn hơn ~300 dòng thay đổi thì tách tiếp.
- Đính kèm ảnh trong `design/screens/` khi nhờ AI làm giao diện, AI nhìn ảnh sẽ làm sát hơn.
- Nếu AI muốn đổi token màu, cấu trúc thư mục hay schema DB ngoài phạm vi task: **dừng lại**, cập nhật file plan trước rồi mới code.
- Sau mỗi task, nhờ AI cập nhật mục "Ghi chú sau khi làm" trong file task (quyết định đã chọn, việc còn nợ) để task sau có ngữ cảnh.
