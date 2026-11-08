# BE-09 · API hồ sơ & cài đặt

**Phụ thuộc:** BE-03 · **Ước lượng:** 1–2 giờ · **Nhánh:** `feat/be-09-profile-api`

## Mục tiêu

Dữ liệu cho màn Tôi (FE-11): tên, email, ngày tham gia, chế độ tối đồng bộ giữa các máy.

## Yêu cầu chi tiết

`src/api/profile.ts`:

```ts
export function useProfile(): UseQueryResult<Profile & { email: string; memberSince: string }> // "11/2025"
export function useUpdateProfile(): Mutation<
  Profile,
  Partial<Pick<Profile, 'display_name' | 'dark_mode' | 'reminder_time' | 'language'>>
>
```

- `memberSince` lấy từ `profiles.created_at`, định dạng `MM/YYYY`.
- Đồng bộ theme: khi profile tải xong, nếu `dark_mode` khác theme hiện tại thì gọi `applyTheme()` (`src/app/theme.ts`). Khi người dùng bật/tắt công tắc: đổi theme ngay + `useUpdateProfile({ dark_mode })`.
- Chữ cái avatar = chữ cái đầu của **2 từ cuối** trong `display_name` (tên tiếng Việt), ví dụ "Nguyễn Minh Anh" → "MA"; chỉ 1 từ thì lấy 1 chữ. Viết `initials()` trong `src/lib/text.ts` + test.

## File dự kiến

`src/api/profile.ts`, `src/lib/text.ts`, `src/lib/text.test.ts`, `src/app/theme.ts`

## Tiêu chí hoàn thành

- [ ] Bật chế độ tối trên máy A, mở máy B sau khi đăng nhập cũng tối
- [ ] Đổi tên hiển thị lưu được
- [ ] `initials('Nguyễn Minh Anh') === 'MA'`, `initials('bubu') === 'B'`

## Prompt cho AI

```
Dự án Bubu. Đọc CLAUDE.md, plan/01-conventions.md, plan/be/BE-09-profile-api.md, src/app/theme.ts.
Làm task BE-09: src/api/profile.ts, đồng bộ dark_mode với theme, src/lib/text.ts (initials) + test.
```

## Ghi chú sau khi làm

…
