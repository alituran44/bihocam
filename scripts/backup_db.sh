#!/usr/bin/env bash
# BiHocam Otomatik Veritabani Yedekleme Scripti
# Kullanım: ./scripts/backup_db.sh veya crontab ile gunde bir kez calistirilir.
# Ornek crontab: 0 3 * * * /home/ec2-user/bihocam/scripts/backup_db.sh >> /home/ec2-user/bihocam/backups/backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
DB_FILE="${PROJECT_ROOT}/backend/bihocam.db"
BACKUP_FILE="${BACKUP_DIR}/bihocam_backup_${TIMESTAMP}.db.gz"

mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_FILE}" ]; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] HATA: Veritabani dosyasi bulunamadi: ${DB_FILE}"
    exit 1
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Yedekleme baslatiliyor..."

# SQLite online backup kullanarak dosya kilitlenme riskini onle
if command -v sqlite3 >/dev/null 2>&1; then
    TEMP_BACKUP="${BACKUP_DIR}/temp_${TIMESTAMP}.db"
    sqlite3 "${DB_FILE}" ".backup '${TEMP_BACKUP}'"
    gzip -c "${TEMP_BACKUP}" > "${BACKUP_FILE}"
    rm -f "${TEMP_BACKUP}"
else
    # sqlite3 CLI yoksa gzip ile dogrudan kopyala
    gzip -c "${DB_FILE}" > "${BACKUP_FILE}"
fi

BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Basariyla yedeklendi: ${BACKUP_FILE} (Boyut: ${BACKUP_SIZE})"

# 14 gunden eski yedekleri temizle (disk dolmasini onleme)
find "${BACKUP_DIR}" -name "bihocam_backup_*.db.gz" -type f -mtime +14 -delete
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 14 gunden eski yedekler temizlendi."
