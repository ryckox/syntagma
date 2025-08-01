#!/bin/bash

# Syntagma Deployment Script
# Usage: ./deploy.sh [environment] [database_type]
# Example: ./deploy.sh production postgresql

set -e

ENVIRONMENT=${1:-production}
DB_TYPE=${2:-sqlite}

echo "🚀 Deploying Syntagma to $ENVIRONMENT with $DB_TYPE database..."

# Create directory structure
create_directories() {
    echo "📁 Creating directory structure..."
    mkdir -p data
    mkdir -p uploads
    mkdir -p logs
    mkdir -p backups
    mkdir -p ssl
}

# Setup environment file
setup_environment() {
    echo "⚙️ Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 Created .env file from example. Please edit it with your settings!"
        
        # Generate secure secrets
        JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        
        # Update .env with generated secrets
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
        sed -i "s/DB_TYPE=.*/DB_TYPE=$DB_TYPE/" .env
        
        echo "✅ Generated secure JWT and session secrets"
    fi
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Frontend
    npm install
    npm run build
    
    # Backend
    cd backend
    npm install --production
    cd ..
}

# Setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    cd backend
    
    if [ "$DB_TYPE" = "postgresql" ]; then
        echo "Setting up PostgreSQL database..."
        # Create database and user if they don't exist
        # This requires PostgreSQL to be installed and running
        node database/setup-postgresql.js
    fi
    
    # Run migrations
    node database/migrate.js
    
    # Seed initial data if needed
    if [ "$ENVIRONMENT" = "development" ] || [ "$SEED_DEMO_DATA" = "true" ]; then
        echo "🌱 Seeding demo data..."
        node database/seed.js
    fi
    
    cd ..
}

# Setup SSL (Let's Encrypt)
setup_ssl() {
    if [ "$ENVIRONMENT" = "production" ] && command -v certbot &> /dev/null; then
        echo "🔒 Setting up SSL certificate..."
        # This is just an example - adjust domain and email
        # certbot certonly --standalone -d your-domain.com --email your-email@domain.com --agree-tos
    fi
}

# Setup systemd service (Linux)
setup_systemd() {
    if [ "$ENVIRONMENT" = "production" ] && command -v systemctl &> /dev/null; then
        echo "🔧 Setting up systemd service..."
        
        cat > /etc/systemd/system/syntagma.service << EOF
[Unit]
Description=Syntagma Regelwerk Management System
After=network.target

[Service]
Type=simple
User=syntagma
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
ExecStart=/usr/bin/node backend/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

        systemctl daemon-reload
        systemctl enable syntagma
        echo "✅ Systemd service created. Start with: sudo systemctl start syntagma"
    fi
}

# Main deployment process
main() {
    create_directories
    setup_environment
    install_dependencies
    setup_database
    setup_ssl
    setup_systemd
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env file with your specific configuration"
    echo "2. Configure your web server (nginx/apache) if needed"
    echo "3. Start the application:"
    echo "   - Development: npm run dev"
    echo "   - Production: npm start"
    echo "   - Docker: docker-compose up -d"
    echo "   - Systemd: sudo systemctl start syntagma"
    echo ""
    echo "🌐 Access your application at: http://localhost:3001"
    echo "👤 Default admin credentials: admin/admin123 (CHANGE THESE!)"
}

# Run main function
main
