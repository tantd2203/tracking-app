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

- Mục 1 (Google): đã làm rồi gỡ bỏ theo yêu cầu. Màn đăng nhập chỉ còn bằng email.
- Mục 2 (dark mode): đã rà mã màu cứng và thêm override `text-brand` cho dark (`#7dd3fc`) để đạt tương phản. Đã kiểm tra màn đăng nhập và trang components. Chưa kiểm tra các màn cần đăng nhập ở dark mode.
- Mục 3 (iPhone/PWA): đã làm: splash cho 6 cỡ iPhone (`public/splash/`, thẻ `apple-touch-startup-image` trong `index.html`, precache trong `vite.config.ts`), chặn zoom chạm đúp và overscroll (`touch-action: manipulation`, `overscroll-behavior-y: none`), toast tôn trọng safe-area. Header, TabBar và nút cố định đáy đã có `safe-top` / `safe-bottom`. `display: standalone` và apple-touch-icon đã có từ trước.
  - Splash dùng nền sáng cho cả dark mode. Có thể làm splash tối sau nếu cần.
  - Chưa kiểm tra trên iPhone thật: splash có hiện đúng cỡ, có thanh Safari khi mở từ màn hình chính không, và chạm đúp.
- Các mục 4–9 chưa làm. Theo prompt của task, dừng sau mỗi mục để kiểm tra trên iPhone, mỗi mục một commit riêng.
- Mục 8 (tag `v1.0.0`) và mục 9 (dùng thật 3 ngày) cần bạn quyết định và làm trên thiết bị.
