# 🚀 Syntagma Deployment Guide

## Deployment-Optionen

### 1. 🐳 Docker (Empfohlen)

**Schnellstart:**
```bash
# Klonen und Setup
git clone <repository-url>
cd syntagma
cp .env.example .env

# Mit Docker Compose
docker-compose up -d

# Zugriff: http://localhost:3001
# Admin: admin/admin123
```

**Manueller Docker Build:**
```bash
docker build -t syntagma .
docker run -d -p 3001:3001 -v syntagma_data:/app/data syntagma
```

### 2. 🖥️ Traditionelles Server-Deployment

**Automatisches Setup:**
```bash
# Entwicklungsumgebung
npm run deploy:dev

# Produktionsumgebung mit PostgreSQL
npm run deploy:prod
```

**Manuelle Installation:**
```bash
# Dependencies installieren
npm install
cd backend && npm install --production

# Environment konfigurieren
cp .env.example .env
# .env editieren mit deinen Einstellungen

# Frontend bauen
npm run build

# Datenbank initialisieren
cd backend
node database/migrate.js

# Server starten
npm start
```

### 3. ☁️ Cloud-Provider

#### Heroku
```bash
# Heroku CLI installieren, dann:
heroku create syntagma-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

#### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: syntagma
services:
- name: web
  source_dir: /
  github:
    repo: your-username/syntagma
    branch: main
  run_command: node backend/server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: "production"
databases:
- name: syntagma-db
  engine: PG
  version: "13"
```

## 🔧 Konfiguration

### Environment-Variablen (.env)

**Basis-Konfiguration:**
```bash
NODE_ENV=production
PORT=3001
DB_TYPE=sqlite # oder postgresql
JWT_SECRET=your-secure-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password
```

**PostgreSQL-Konfiguration:**
```bash
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=syntagma
DB_USER=syntagma_user
DB_PASSWORD=secure_db_password
```

### 🗄️ Datenbank-Setup

**SQLite (Standard):**
- Automatisch erstellt
- Keine zusätzliche Konfiguration erforderlich
- Perfekt für kleine bis mittlere Installationen

**PostgreSQL (Empfohlen für Produktion):**
```bash
# PostgreSQL installieren
sudo apt install postgresql postgresql-contrib

# Datenbank und User erstellen
sudo -u postgres psql
CREATE DATABASE syntagma;
CREATE USER syntagma_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE syntagma TO syntagma_user;
\q

# .env entsprechend konfigurieren
```

## 🔐 Sicherheit

### SSL/HTTPS Setup

**Mit Let's Encrypt:**
```bash
# Certbot installieren
sudo apt install certbot

# Zertifikat erstellen
sudo certbot certonly --standalone -d your-domain.com

# Nginx/Apache entsprechend konfigurieren
```

### Firewall-Konfiguration
```bash
# Nur notwendige Ports öffnen
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📊 Monitoring

### Health Checks
```bash
# Manuelle Prüfung
npm run health:check

# URL für Load Balancer
GET /api/health
```

### Logs
```bash
# Logs anzeigen
tail -f logs/syntagma.log

# Docker Logs
docker-compose logs -f
```

## 🔄 Updates

### Automatische Updates
```bash
# Git Pull + Restart
git pull origin main
npm install
npm run build
# Restart service
```

### Backup vor Updates
```bash
# SQLite Backup
cp data/syntagma.db data/syntagma.db.backup.$(date +%Y%m%d)

# PostgreSQL Backup
pg_dump syntagma > backup_$(date +%Y%m%d).sql
```

## 🌐 Web Server Integration

### Nginx (Empfohlen)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
</VirtualHost>
```

## 🚨 Troubleshooting

### Häufige Probleme

**Port bereits belegt:**
```bash
# Port prüfen
lsof -i :3001
# Anderen Port in .env setzen
```

**Datenbank-Verbindungsfehler:**
```bash
# PostgreSQL Status prüfen
systemctl status postgresql
# Credentials in .env überprüfen
```

**Permissions-Fehler:**
```bash
# Datei-Berechtigungen setzen
chmod 755 deploy.sh
chown -R node:node /app/data
```

## 📞 Support

- 📖 [Vollständige Dokumentation](docs/)
- 🐛 [Issue Tracker](issues/)
- 💬 [Diskussionen](discussions/)

---

**Standard-Credentials nach Installation:**
- Username: `admin`
- Password: `admin123`

**⚠️ WICHTIG: Ändern Sie diese Credentials nach der ersten Anmeldung!**
