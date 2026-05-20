# Migration: Update ZaloCRM PWA1 + Golden Design trên server Docker Compose

Tài liệu này hướng dẫn update hệ thống ZaloCRM **đang chạy trên server bằng Docker Compose** lên bản có Mobile PWA v1 + Modern Golden Design, đồng thời giữ nguyên database, MinIO files và Docker volumes.

## Mục tiêu

- Update code/app image lên bản mới.
- Không mất dữ liệu PostgreSQL.
- Không mất file upload trong MinIO/file storage.
- Có backup trước khi update.
- Có lệnh rollback nếu app mới lỗi.

## Nguyên tắc an toàn

Không chạy các lệnh này khi update production:

```bash
docker compose down -v
docker volume rm ...
docker system prune -a --volumes
rm -rf backups
```

Các lệnh trên có thể xóa database volume hoặc file upload.

---

## 1. SSH vào server và vào thư mục ZaloCRM

```bash
ssh <user>@<server-ip>
cd /path/to/ZaloCRM
```

Kiểm tra đang đúng thư mục:

```bash
ls docker-compose.yml frontend backend
```

Kết quả mong đợi: thấy `docker-compose.yml`, `frontend`, `backend`.

---

## 2. Kiểm tra trạng thái hiện tại

```bash
docker compose ps
```

Kết quả mong đợi tối thiểu:

```text
zalo-crm-app     Up
zalo-crm-db      Up (healthy)
zalo-crm-minio   Up (healthy)
```

Lưu lại commit hiện tại để rollback app nếu cần:

```bash
git rev-parse HEAD | tee /tmp/zalocrm-predeploy-sha.txt
```

Kiểm tra không có sửa đổi local ngoài ý muốn:

```bash
git status --short --branch
```

Nếu có file tracked bị modified, nên dừng lại và kiểm tra trước khi update.

---

## 3. Backup database trước khi update

Tạo thư mục backup nếu chưa có:

```bash
mkdir -p backups
```

Backup PostgreSQL:

```bash
BACKUP_FILE="backups/pre-pwa1-golden-$(date +%Y%m%d-%H%M).sql"
docker exec zalo-crm-db pg_dump -U crmuser zalocrm > "$BACKUP_FILE"
ls -lh "$BACKUP_FILE"
```

Kết quả mong đợi: file `.sql` có size lớn hơn `0`.

Kiểm tra database vẫn healthy:

```bash
docker exec zalo-crm-db pg_isready -U crmuser -d zalocrm
```

Kết quả mong đợi:

```text
/var/run/postgresql:5432 - accepting connections
```

Nếu server của bạn dùng `DB_USER` hoặc `DB_NAME` khác, xem trong `.env` rồi thay `crmuser` và `zalocrm` tương ứng.

---

## 4. Update code

### Cách A: Pull từ branch/release đã chứa PWA1 + Golden Design

Dùng cách này nếu repository remote đã có branch/tag chứa bản update.

```bash
git fetch origin
git checkout <branch-or-tag-can-deploy>
git pull --ff-only origin <branch-or-tag-can-deploy>
```

Ví dụ nếu đã merge vào `main`:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

### Cách B: Apply patch bundle lên core branch hiện tại

Dùng cách này nếu bạn đang giữ core branch riêng và muốn apply phần PWA/design như bản vá.

Kiểm tra patch files tồn tại:

```bash
ls docs/superpowers/patches/
```

Apply theo thứ tự:

```bash
git apply --check docs/superpowers/patches/2026-05-20-pwa1-mobile.patch
git am docs/superpowers/patches/2026-05-20-pwa1-mobile.patch

git apply --check docs/superpowers/patches/2026-05-20-golden-design.patch
git am docs/superpowers/patches/2026-05-20-golden-design.patch
```

Nếu branch hiện tại rất gần baseline `5a47da9`, có thể dùng patch gộp:

```bash
git apply --check docs/superpowers/patches/2026-05-20-pwa1-golden-design-combined.patch
git apply docs/superpowers/patches/2026-05-20-pwa1-golden-design-combined.patch
```

Khuyến nghị: dùng patch tách lớp PWA trước, Design sau để conflict dễ xử lý hơn.

---

## 5. Kiểm tra code sau update

```bash
git log --oneline --decorate -5
```

Nếu deploy bản đã đóng gói trong worktree hiện tại, nên thấy các commit tương tự:

```text
750b03d chore: add pwa and design patch bundle
8c5ce90 feat(ui): preserve golden redesign snapshot
bef9c07 feat(pwa): add mobile offline app shell
```

Kiểm tra metadata PWA/golden:

```bash
grep -n 'manifest.webmanifest\|#D6A84F' frontend/index.html
grep -n 'Be Vietnam Pro\|Space Grotesk' frontend/src/assets/main.css
grep -n 'golden-dark' frontend/src/plugins/vuetify.ts
```

Kết quả mong đợi: cả 3 lệnh đều có output.

---

## 6. Build trước khi restart app

Nếu server có đủ Node dependencies:

```bash
npm --prefix frontend run build
```

Nếu lỗi do thiếu dependency local, vẫn có thể build bằng Docker ở bước sau.

Build app image:

```bash
docker compose build app
```

Kiểm tra dung lượng:

```bash
df -h /
docker system df
```

Nếu dung lượng thấp, chỉ prune build cache an toàn:

```bash
docker builder prune
```

Không prune volumes trên production nếu chưa chắc chắn.

---

## 7. Deploy app, giữ nguyên database và MinIO

Chỉ recreate app service:

```bash
docker compose up -d --build app
```

Lệnh này rebuild/recreate `zalo-crm-app`, nhưng giữ nguyên Docker volumes của DB/MinIO.

Kiểm tra containers:

```bash
docker compose ps
```

Kết quả mong đợi:

```text
zalo-crm-app     Up
zalo-crm-db      Up (healthy)
zalo-crm-minio   Up (healthy)
```

Xem log app:

```bash
docker logs zalo-crm-app --tail 100
```

Kết quả tốt:

- Prisma schema sync thành công hoặc báo database already in sync.
- App chạy trên `0.0.0.0:3000`.
- Không có lỗi database auth.
- Không crash loop.

---

## 8. Verify sau deploy

Kiểm tra homepage:

```bash
curl -I http://localhost:3080/
```

Kết quả mong đợi:

```text
HTTP/1.1 200 OK
```

Kiểm tra PWA metadata:

```bash
curl -s http://localhost:3080/ | grep -E 'manifest.webmanifest|#D6A84F'
curl -s http://localhost:3080/manifest.webmanifest | grep -E '"theme_color":"#D6A84F"|"background_color":"#070A12"'
```

Kiểm tra CSS theme/font:

```bash
for css in $(curl -s http://localhost:3080/ | grep -o '/assets/[^" ]*\.css'); do
  echo "--- $css"
  curl -s "http://localhost:3080$css" | grep -E 'Be Vietnam Pro|Space Grotesk|golden-dark|#070a12|#d6a84f' || true
done
```

Kiểm tra setup status:

```bash
curl -s http://localhost:3080/api/v1/setup/status
```

Nếu hệ thống đang chạy đã có user, kết quả đúng là:

```json
{"needsSetup":false}
```

Nếu trả `true` trên production đang có dữ liệu, dừng lại kiểm tra vì app có thể đang trỏ nhầm database/volume.

Mở browser:

```text
http://<server-ip-or-domain>:3080/
```

Kết quả mong đợi:

- Trang login hiển thị dark/golden design.
- Font tiếng Việt đẹp hơn (`Be Vietnam Pro`).
- Không bị ép về setup nếu hệ thống đã có user.
- Đăng nhập user hiện tại được.

---

## 9. Rollback app nếu bản mới lỗi

Rollback code/app trước, chưa restore DB ngay:

```bash
PREDEPLOY_SHA=$(cat /tmp/zalocrm-predeploy-sha.txt)
git checkout "$PREDEPLOY_SHA"
docker compose up -d --build app
```

Verify rollback:

```bash
curl -I http://localhost:3080/
docker logs zalo-crm-app --tail 100
```

Chỉ restore DB nếu thật sự có lỗi dữ liệu/schema và đã xác nhận backup đúng.

Restore DB từ backup:

```bash
docker compose stop app
cat backups/pre-pwa1-golden-YYYYmmdd-HHMM.sql | docker exec -i zalo-crm-db psql -U crmuser zalocrm
docker compose up -d app
```

Thay `YYYYmmdd-HHMM` bằng file backup thật đã tạo ở bước 3.

---

## 10. Checklist hoàn tất

Sau deploy, lưu lại các thông tin này:

```bash
git rev-parse HEAD
docker compose ps
ls -lh backups/pre-pwa1-golden-*.sql
docker volume ls | grep -E 'pg_data|minio_data|file_storage'
```

Checklist:

- [ ] Đã backup database trước deploy.
- [ ] Không chạy `docker compose down -v`.
- [ ] App container đang Up.
- [ ] DB container healthy.
- [ ] MinIO container healthy.
- [ ] Homepage HTTP 200.
- [ ] Manifest theme color là `#D6A84F`.
- [ ] Manifest background là `#070A12`.
- [ ] `/api/v1/setup/status` trả `needsSetup:false` trên hệ thống đã có user.
- [ ] Browser login hiển thị giao diện golden dark.
- [ ] User hiện tại đăng nhập được.

## Ghi chú về Redis

Nếu log có dòng tương tự:

```text
REDIS_URL not set — using in-memory mode
```

Đây không phải lỗi deploy nếu hệ thống đang chạy single-instance và trước đó cũng không dùng Redis. Nếu muốn dùng Redis cho production nhiều instance, cần bật profile Redis và cấu hình `REDIS_URL=redis://redis:6379` riêng trong một migration khác.
