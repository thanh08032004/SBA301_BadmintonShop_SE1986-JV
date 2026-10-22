# Quy tắc đóng góp code – Frontend

Mọi thành viên làm frontend phải theo file này. Leader review PR dựa trên checklist ở cuối file. PR không đạt sẽ bị yêu cầu sửa trước khi merge.

---

## 1. Git và quy trình làm việc

- `main`: bản ổn định để nộp/demo. **Không push thẳng.**
- `develop`: nhánh tích hợp. Mọi PR đều merge vào đây.
- Nhánh cá nhân tạo từ `develop`, đặt tên theo mẫu:
  - `feature/<module>-<viec>` – ví dụ `feature/delivery-websocket`
  - `fix/<module>-<loi>` – ví dụ `fix/cart-quantity-negative`
  - `chore/<viec>` – cấu hình, tài liệu, dọn dẹp
- Trước khi tạo PR: `git pull origin develop` rồi xử lý xung đột trên nhánh của mình.
- Mỗi PR chỉ làm một việc. Không trộn đổi format với đổi logic trong cùng PR.
- Không tự sửa code trong module của người khác. Cần thay đổi thì báo người phụ trách hoặc leader.
- File dùng chung (`src/app/`, `src/shared/`, `package.json`, `vite.config.js`, `eslint.config.js`) chỉ sửa sau khi leader đồng ý.

### Commit message

Theo dạng `<loai>(<module>): <mo ta ngan>`, viết thường, không dấu chấm cuối:

```
feat(cart): them nut xoa tat ca
fix(payment): sai tong tien khi co voucher
refactor(management): tach InventoryTable ra component rieng
docs(frontend): cap nhat README phan chay mock
chore: nang cap vite
```

Loại: `feat`, `fix`, `refactor`, `style` (chỉ CSS/format), `docs`, `test`, `chore`.

---

## 2. Cấu trúc thư mục

- Code của tính năng nằm trong `src/modules/<ten-module>/` theo khuôn:
  `api/`, `pages/`, `components/`, `hooks/`, `utils/`, `constants.js`, `<ten-module>.css`.
- Thư mục luôn ở dạng số nhiều: `pages`, `components`, `hooks`. Không dùng `component`, `page`, `assets` cho CSS.
- Không để file `.jsx` nằm ngay gốc module. Page vào `pages/`, phần còn lại vào `components/`.
- `src/shared/` chỉ chứa thứ **ít nhất hai module** dùng. Component riêng của một layout (header, sidebar) nằm trong `src/app/layouts/<khu>/`.
- Không commit `dist/`, `node_modules/`, `.env`, file log.

### Luật import (bắt buộc)

| Từ          | Được import                                      | Không được import    |
| ----------- | ------------------------------------------------ | -------------------- |
| `modules/A` | `shared/*`, `app/providers/*`, chính `modules/A` | `modules/B`          |
| `shared/*`  | `shared/*`                                       | `modules/*`, `app/*` |
| `app/*`     | mọi nơi                                          | –                    |

Hai module cần dùng chung một thứ thì chuyển thứ đó lên `shared/` qua một PR riêng.

- Dùng alias `@/` thay cho đường dẫn tương đối dài: `import { formatMoney } from '@/shared/utils/format'`.
- Đường dẫn tương đối chỉ dùng trong cùng một module (`./components/OrderRow`).

---

## 3. Đặt tên

| Loại             | Quy tắc                                        | Ví dụ                                 |
| ---------------- | ---------------------------------------------- | ------------------------------------- |
| Component, page  | `PascalCase.jsx`, page kết thúc bằng `Page`    | `OrderDetailPage.jsx`, `OrderRow.jsx` |
| Hook             | `useXxx.js`                                    | `useMyOrders.js`                      |
| File API         | `<module>.api.js`, export object `<module>Api` | `cart.api.js` → `cartApi`             |
| Constants, utils | `camelCase.js`                                 | `deliveryStatus.js`                   |
| CSS              | `<module>.css` hoặc `<Component>.css`          | `delivery.css`                        |
| Biến, hàm        | `camelCase`, hàm bắt đầu bằng động từ          | `loadOrders`, `handleSubmit`          |
| Hằng số          | `UPPER_SNAKE_CASE`                             | `PAGE_SIZE`, `ORDER_STATUS`           |
| Boolean          | tiền tố `is`/`has`/`can`                       | `isLoading`, `hasError`               |
| Handler          | `handleXxx` trong component, `onXxx` cho prop  | `handleSave`, `onSave`                |
| CSS class        | `kebab-case` có tiền tố module                 | `.delivery-timeline`, `.mgmt-card`    |

- Tên biến, hàm, file viết **tiếng Anh**. Chữ hiển thị cho người dùng viết **tiếng Việt có dấu**.
- Dữ liệu từ API dùng **camelCase** giống DTO Spring Boot (`orderCode`, `paymentStatus`). Mock cũ đang dùng snake_case; không viết thêm code mới phụ thuộc snake_case ngoài file `.api.js`.

---

## 4. Viết component

- Function component + hooks. Không dùng class component.
- Mỗi file export **một** component mặc định. Component phụ nhỏ (dưới khoảng 30 dòng) được để chung file.
- Một component quá **250 dòng** thì tách ra component con hoặc hook.
- Mỗi `useState` một dòng. Không khai báo nhiều state bằng dấu phẩy.
- Không viết JSX dồn trên một dòng dài. Prettier sẽ tự xuống dòng; đừng tắt nó.
- Đọc context qua hook: `useAuth()`, `useShop()`. Không gọi `useContext(...)` trực tiếp.
- Lấy token chỉ qua `getToken()` trong `shared/auth/session.js`. Không đọc `localStorage` trong component.
- Có `key` ổn định cho list (id, không dùng index nếu list có thể đổi thứ tự).
- Không để `console.log` trong code merge. `console.error` chỉ dùng ở chỗ bắt lỗi không hiển thị được cho người dùng.
- Xóa code comment-out và import thừa trước khi tạo PR.

### Trạng thái tải, lỗi, rỗng

Mọi page có tải dữ liệu phải xử lý đủ 3 trạng thái:

- Đang tải: `Spinner` của React-Bootstrap hoặc component `Loading` chung.
- Lỗi: `Alert variant="danger"` với thông báo tiếng Việt dễ hiểu, có nút “Thử lại” nếu hợp lý.
- Rỗng: component `EmptyState` chung, có câu hướng dẫn bước tiếp theo.

Nút gửi form phải bị `disabled` khi đang xử lý để không gửi hai lần.

---

## 5. Gọi API và state

- Page và component **không** gọi `fetch`, `axios` hay `apiFetch` trực tiếp.
- Mọi request đi qua `modules/<x>/api/<x>.api.js`, các file này dùng `httpClient` trong `shared/api/`.
- Không hardcode URL backend (`http://localhost:3000`, `8080`...). Dùng biến môi trường trong `.env`.
- Dữ liệu từ `ShopProvider` đọc qua `useShop()`; thao tác ghi gọi `act(() => xxxApi.fn(payload))`.
- Dữ liệu tải riêng (không qua `ShopProvider`) dùng `useAsync` trong `shared/hooks`, trả về `{ data, isLoading, error, reload }`.
- State toàn cục chỉ có: phiên đăng nhập (`AuthProvider`) và `ShopProvider` (tạm thời, sẽ bỏ khi có backend). **Không tạo thêm Context mới** nếu chưa hỏi leader.
- Validate dữ liệu ở form trước khi gửi, nhưng không tin là đủ: backend vẫn validate lại. Không kiểm tra trùng dữ liệu (ví dụ email) bằng cách tải cả danh sách về client.
- Chưa dùng TanStack Query ở phase này.

---

## 6. Giao diện và CSS

- Ưu tiên component của **React-Bootstrap** và class tiện ích của Bootstrap (`d-flex`, `gap-3`, `mb-4`...).
- CSS riêng viết trong file `.css` của module, class có tiền tố module. Không viết đè class Bootstrap toàn cục.
- **Không dùng `style={{...}}` cho bố cục tĩnh.** Chỉ được dùng inline style cho giá trị tính lúc chạy (ví dụ màu badge lấy từ dữ liệu, độ rộng thanh tiến độ).
- Màu, bo góc, khoảng cách dùng biến CSS trong `shared/styles/ui.css` (`var(--color-primary)`), không gõ mã màu mới.
- Không import CSS của module khác để mượn class. Cần dùng chung thì đưa lên `shared/styles/`.
- Mọi trang phải dùng được ở màn hình rộng 375px.
- Ảnh có `alt`. Nút chỉ có icon phải có `aria-label`.

### Format tiền, ngày

Dùng hàm chung trong `shared/utils/format.js`:

```js
formatMoney(1250000); // "1.250.000 ₫"
formatDate('2026-10-22'); // "22/10/2026"
formatDateTime(isoString); // "22/10/2026 17:20"
```

Số lượng dùng `formatNumber(1250)` → `"1.250"`. Không tự viết `toLocaleString` trong component.

### Trạng thái và nhãn

Bảng trạng thái (đơn hàng, thanh toán, giao vận, ticket) lấy từ `shared/constants/` hoặc `constants.js` của module. Không gõ chuỗi trạng thái hoặc nhãn tiếng Việt trực tiếp trong JSX khi nó đã có trong constants.

---

## 7. Format và lint

- Dự án dùng **Prettier** (`.prettierrc.json`) và **ESLint** (`eslint.config.js`). Cài extension Prettier + ESLint cho VS Code và bật “Format on Save”.
- File lưu dạng **UTF-8 không BOM**, xuống dòng **LF**, thụt lề **2 dấu cách** (đã cấu hình trong `.editorconfig`).
- Trước khi push:

```bash
npm run format
npm run lint
npm run build
npm test
```

Cả bốn lệnh phải chạy không lỗi. Không dùng `// eslint-disable` nếu chưa giải thích lý do trong PR.

---

## 8. Mock API

- Mock nằm trong `frontend/mock/` và chỉ dùng cho giai đoạn chưa có backend.
- Thêm action mới vào mock (`mock/server.mjs` hoặc `mock/actions/`) thì thêm test tương ứng trong `mock/tests/`.
- Không import file trong `mock/` từ `src/`. `src/` chỉ biết tới `/api/...` qua `httpClient`.
- Khi leader yêu cầu tích hợp backend, mock và `ShopProvider` sẽ được gỡ; code viết đúng luật ở mục 5 sẽ không phải sửa page.

---

## 9. Checklist PR

Copy vào mô tả PR và tick đủ:

```
- [ ] Nhánh tạo từ develop, PR vào develop
- [ ] Chỉ sửa trong module mình phụ trách (hoặc đã được leader đồng ý)
- [ ] Đúng cấu trúc thư mục và cách đặt tên
- [ ] Không import chéo module, không import từ mock/
- [ ] Page không gọi fetch/axios trực tiếp, mọi request qua <module>.api.js
- [ ] Dùng formatMoney/formatDate và constants chung
- [ ] Không có inline style cho bố cục tĩnh, không mã màu mới
- [ ] Có xử lý đang tải / lỗi / rỗng
- [ ] Không còn console.log, code comment-out, import thừa
- [ ] npm run format, npm run lint, npm run build, npm test đều sạch
- [ ] Đã tự test bằng tài khoản đúng role
- [ ] Có ảnh chụp màn hình nếu đổi giao diện
```
