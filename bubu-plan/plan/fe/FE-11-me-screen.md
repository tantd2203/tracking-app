# FE-11 · Màn Tôi

**Phụ thuộc:** BE-09, BE-08 · **Ước lượng:** 2 giờ · **Nhánh:** `feat/fe-11-me`

## Mục tiêu

Hoàn thiện màn Tôi theo thiết kế (bản base mới có chế độ tối + đăng xuất).

## Tham chiếu

- Ảnh: `plan/design/screens/08-me.png`
- Hook: `useProfile`, `useUpdateProfile` (BE-09), `useStreakSummary` (BE-08), `useSignOut` (BE-03)

## Yêu cầu chi tiết

1. Thẻ hồ sơ: avatar vuông bo 18px nền brand, bóng khối, chữ cái `initials()`; tên 20px/900; email; "Thành viên từ 11/2025" màu brand. Chạm tên → sheet sửa tên hiển thị.
2. Hàng 3 ô số: Streak (màu brand) · Kỷ lục · Card xong (cả năm).
3. Danh sách cài đặt (mỗi dòng có ô icon màu):
   - **Chế độ tối** – `Toggle`, đổi ngay + lưu vào profile.
   - **Nhắc nhở hằng ngày** – hiện "20:00" mờ + nhãn "Sắp có" (làm sau v1.0).
   - **Ngôn ngữ** – "Tiếng Việt" (chỉ hiển thị).
4. Nút "Đăng xuất" (nút phụ, cả chiều ngang) → `useSignOut` → `/login`.
5. Chân trang: "Bubu v0.x.x" (`__APP_VERSION__`). Link "Xem bộ component" chỉ hiện khi `import.meta.env.DEV`.
6. **Không** làm mục "Dữ liệu demo" của prototype.

## File dự kiến

`src/features/me/{MePage,ProfileCard,EditNameSheet}.tsx`

## Tiêu chí hoàn thành

- [ ] Thông tin, số liệu đúng tài khoản đang đăng nhập
- [ ] Chế độ tối lưu và đồng bộ giữa các máy
- [ ] Đổi tên hiển thị → lời chào ở Danh sách board đổi theo
- [ ] Khớp ảnh 08 ở light và dark

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/01-conventions.md, plan/fe/FE-11-me-screen.md.
Xem ảnh plan/design/screens/08-me.png (đính kèm). Làm task FE-11 với useProfile, useUpdateProfile, useStreakSummary, useSignOut.
Liệt kê file trước khi code.
```

## Ghi chú sau khi làm

- Đã làm: `ProfileCard` (avatar chữ cái, chạm tên để sửa, email, "Thành viên từ MM/YYYY"), `EditNameSheet` (sửa tên hiển thị, không cho để trống), `MePage` (3 ô Streak / Kỷ lục / Card xong lấy từ `useStreakSummary`, công tắc chế độ tối lưu vào profile, "Nhắc nhở hằng ngày" 20:00 kèm nhãn "Sắp có", "Ngôn ngữ" chỉ hiển thị, nút Đăng xuất, phiên bản và link bộ component chỉ hiện ở chế độ dev).
- Lời chào ở Danh sách board lấy `display_name` từ profile, nên đổi tên là đổi theo.
- Không làm mục "Dữ liệu demo" theo spec.
- `npm run lint`, `npm test` (88 test) và `npm run build` đều qua.
- Chưa kiểm tra: đổi tên rồi lời chào đổi theo trên Supabase thật, chế độ tối đồng bộ giữa hai máy, và giao diện light/dark so với ảnh 08.
