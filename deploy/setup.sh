#!/usr/bin/env bash
# Cégverzum — One-time server setup for Ubuntu 24.04 (Hetzner CX22)
# Usage: sudo bash setup.sh
set -euo pipefail

REPO_URL="https://github.com/szaboleonardhenrik/cegverzum.git"
APP_DIR="/opt/cegverzum"
DB_NAME="cegverzum"
DB_USER="cegverzum"
DOMAIN="cegverzum.hu"

echo "=== Cégverzum Server Setup ==="

# --- Prompt for secrets ---
read -sp "PostgreSQL password for '$DB_USER': " DB_PASS
echo
read -sp "SECRET_KEY (64+ random chars): " SECRET_KEY
echo

# --- 1. System user ---
echo ">>> Creating system user..."
if ! id -u cegverzum &>/dev/null; then
    useradd --system --create-home --shell /usr/sbin/nologin cegverzum
fi

# --- 2. System packages ---
echo ">>> Installing packages..."
apt-get update
apt-get install -y \
    nginx \
    python3.12-venv \
    python3-pip \
    postgresql \
    redis-server \
    certbot \
    python3-certbot-nginx \
    git \
    curl

# --- 3. Node.js 20 LTS ---
echo ">>> Installing Node.js 20..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# --- 4. PostgreSQL setup ---
echo ">>> Setting up PostgreSQL..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# --- 5. Clone repo ---
echo ">>> Cloning repository..."
if [ ! -d "$APP_DIR" ]; then
    git clone "$REPO_URL" "$APP_DIR"
else
    echo "    $APP_DIR already exists, pulling latest..."
    cd "$APP_DIR" && git pull origin main
fi
chown -R cegverzum:cegverzum "$APP_DIR"

# --- 6. Backend: Python venv + deps ---
echo ">>> Setting up Python venv..."
sudo -u cegverzum python3 -m venv "$APP_DIR/backend/venv"
sudo -u cegverzum "$APP_DIR/backend/venv/bin/pip" install --upgrade pip
sudo -u cegverzum "$APP_DIR/backend/venv/bin/pip" install -r "$APP_DIR/backend/requirements.txt"

# --- 7. Backend: .env ---
echo ">>> Writing production .env..."
cat > "$APP_DIR/backend/.env" <<EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ORIGINS=https://$DOMAIN
NAV_API_URL=https://api.onlineszamla.nav.gov.hu/invoiceService/v3
NAV_LOGIN=
NAV_PASSWORD=
NAV_SIGNATURE_KEY=
NAV_TAX_NUMBER=
NAV_SOFTWARE_ID=
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
EOF
chown cegverzum:cegverzum "$APP_DIR/backend/.env"
chmod 600 "$APP_DIR/backend/.env"

# --- 8. Frontend: build ---
echo ">>> Building frontend..."
cd "$APP_DIR/frontend"
sudo -u cegverzum npm ci
sudo -u cegverzum npm run build

# --- 9. Log directory ---
echo ">>> Creating log directory..."
mkdir -p /var/log/cegverzum
chown cegverzum:cegverzum /var/log/cegverzum

# --- 10. Systemd services ---
echo ">>> Installing systemd services..."
cp "$APP_DIR/deploy/cegverzum-api.service" /etc/systemd/system/
cp "$APP_DIR/deploy/cegverzum-celery.service" /etc/systemd/system/
cp "$APP_DIR/deploy/cegverzum-celery-beat.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable cegverzum-api cegverzum-celery cegverzum-celery-beat

# --- 11. Nginx ---
echo ">>> Configuring Nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/cegverzum
ln -sf /etc/nginx/sites-available/cegverzum /etc/nginx/sites-enabled/cegverzum
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# --- 12. SSL certificate ---
echo ">>> Setting up SSL with Certbot..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --redirect -m "admin@$DOMAIN"

# --- 13. Database migrations ---
echo ">>> Running database migrations..."
cd "$APP_DIR/backend"
sudo -u cegverzum "$APP_DIR/backend/venv/bin/alembic" upgrade head

# --- 14. Seed admin user ---
echo ">>> Seeding admin user..."
sudo -u cegverzum "$APP_DIR/backend/venv/bin/python" seed_admin.py

# --- 15. Start services ---
echo ">>> Starting services..."
systemctl start cegverzum-api
systemctl start cegverzum-celery
systemctl start cegverzum-celery-beat

echo ""
echo "=== Setup complete! ==="
echo "  Site:   https://$DOMAIN"
echo "  API:    https://$DOMAIN/api/"
echo "  Admin:  admin@cegverzum.hu / admin123 (CHANGE THIS!)"
echo ""
echo "  Check status: systemctl status cegverzum-api"
echo "  View logs:    journalctl -u cegverzum-api -f"
echo ""
echo "  IMPORTANT: Update NAV credentials in $APP_DIR/backend/.env"
echo "  IMPORTANT: Change the admin password immediately!"
