# FE-12 · Hoàn thiện và phát hành v1.0.0

**Phụ thuộc:** tất cả task trước, BE-10 · **Ước lượng:** 1–2 ngày · **Nhánh:** `feat/fe-12-release`

## Mục tiêu

App đủ ổn để dùng hằng ngày trên iPhone; đánh tag `v1.0.0`.

## Yêu cầu chi tiết

1. **Google:** nối nút "Tiếp tục với Google" với `useSignInWithGoogle` (BE-10).
2. **Dark mode:** rà từng màn và từng lớp phủ; không còn chữ tối trên nền tối.
3. **iPhone / PWA:**
   - Safe area tai thỏ và thanh home (header, TabBar, nút cố định đáy)
   - `apple-touch-icon`, màn khởi động (splash) cho vài cỡ iPhone phổ biến
   - Chặn zoom khi chạm đúp, chặn kéo trang quá đà (overscroll)
   - Mở từ màn hình chính không hiện thanh Safari (`display: standalone`)
4. **Mất mạng:** banner nhỏ "Mất kết nối – thay đổi sẽ không được lưu" khi `navigator.onLine === false`; vẫn mở được app (service worker đã cache).
5. **Lỗi bất ngờ:** `ErrorBoundary` toàn app với Bubu `sad` + nút "Tải lại".
6. **Hiệu năng:** tách code theo route (`lazy()`), Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 90, PWA đạt yêu cầu cài đặt.
7. **Khả năng tiếp cận:** nút chỉ có icon phải có `aria-label`; tương phản chữ đạt AA.
8. **Phát hành:** cập nhật README, CHANGELOG, `version` trong `package.json` = `1.0.0`, merge `main`, tag `v1.0.0`, kiểm tra bản Production trên Vercel.
9. **Dùng thật 3 ngày** trên iPhone, ghi lỗi gặp phải thành issue GitHub.

## Tiêu chí hoàn thành

- [ ] Toàn bộ checklist ở trên
- [ ] Không còn issue mức "chặn dùng" (blocker)
- [ ] Tag `v1.0.0` đã đẩy lên GitHub, Production chạy bản mới

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/00-overview.md, plan/fe/FE-12-polish-release.md.
Làm lần lượt từng mục 1→7 của FE-12, mỗi mục một commit riêng; dừng sau mỗi mục để mình kiểm tra trên iPhone.
```

## Ghi chú sau khi làm

…
