# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` to `.env` on production server
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Update `Remote_Host` to your production domain with HTTPS
- [ ] Verify `JWT_SECRET` is secure (64+ character random string)
- [ ] Update database credentials for production database
- [ ] Update email credentials for production email service

### 2. SSL/HTTPS Setup
- [ ] Obtain SSL certificate (Let's Encrypt, AWS Certificate Manager, etc.)
- [ ] Configure web server (nginx/Apache) for HTTPS
- [ ] Ensure all `Remote_Host` URLs use `https://`
- [ ] Test SSL configuration with SSL Labs

### 3. Security Verification
- [ ] Verify `.env` is in `.gitignore` and not committed
- [ ] Confirm rate limiting is active (100 req/15min)
- [ ] Test authentication middleware on protected routes
- [ ] Verify cookies are set with `secure: true` in production
- [ ] Confirm security headers are present in responses

### 4. Database Security
- [ ] Use separate production database
- [ ] Restrict database user permissions (no DROP, CREATE)
- [ ] Enable database SSL connections if available
- [ ] Set up database backups
- [ ] Review and remove any test/debug data

### 5. Application Security
- [ ] Remove all `console.log` statements with sensitive data
- [ ] Verify no tokens are exposed in client-side code
- [ ] Test SQL injection protection
- [ ] Verify CORS settings allow only production domains
- [ ] Test rate limiting with load testing tool

## Deployment Steps

### Step 1: Prepare Production Server

```bash
# Install Node.js (v16+ recommended)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/iodd
sudo chown $USER:$USER /var/www/iodd
```

### Step 2: Deploy Application

```bash
# Clone or copy application to server
cd /var/www/iodd
git clone <your-repo-url> .

# Install dependencies
cd server3/s32_iodd-data-api
npm install

# Copy production environment file
cp .env.production .env

# Edit .env with production values
nano .env
```

### Step 3: Configure Web Server (nginx)

Create `/etc/nginx/sites-available/iodd`:

```nginx
server {
    listen 80;
    server_name iodd.com www.iodd.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name iodd.com www.iodd.com;

    ssl_certificate /etc/letsencrypt/live/iodd.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iodd.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client application
    location / {
        root /var/www/iodd/client3/c32_iodd-app;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api2 {
        proxy_pass http://localhost:54182;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/iodd /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Start Application with PM2

```bash
cd /var/www/iodd/server3/s32_iodd-data-api

# Start with PM2
pm2 start api/IODD-Server_u1.08.mjs --name iodd-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command output instructions

# Monitor application
pm2 logs iodd-api
pm2 monit
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d iodd.com -d www.iodd.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Post-Deployment Verification

### 1. Test HTTPS
```bash
curl -I https://iodd.com
# Should return 200 OK with security headers
```

### 2. Test API Endpoints
```bash
# Test public endpoint
curl https://iodd.com/api2/projects

# Test rate limiting (send 101 requests)
for i in {1..101}; do curl https://iodd.com/api2/projects; done
# Should get 429 Too Many Requests on 101st request
```

### 3. Test Authentication
```bash
# Should require authentication
curl https://iodd.com/api2/member -X POST
# Should return 401 Unauthorized
```

### 4. Security Scan
- Run SSL Labs test: https://www.ssllabs.com/ssltest/
- Check security headers: https://securityheaders.com/
- Verify OWASP Top 10 protections

## Monitoring & Maintenance

### Application Logs
```bash
# View PM2 logs
pm2 logs iodd-api

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

### Database Backups
```bash
# Create backup script
cat > /var/www/iodd/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h 92.112.184.206 -P 3033 -u iodd-user -p iodd2 > /var/backups/iodd_$DATE.sql
# Keep only last 7 days
find /var/backups/iodd_*.sql -mtime +7 -delete
EOF

chmod +x /var/www/iodd/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /var/www/iodd/backup-db.sh
```

### Security Updates
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Update Node.js packages
cd /var/www/iodd/server3/s32_iodd-data-api
npm audit
npm audit fix

# Restart application
pm2 restart iodd-api
```

## Rollback Procedure

If issues occur after deployment:

```bash
# Stop current version
pm2 stop iodd-api

# Restore previous version
cd /var/www/iodd
git checkout <previous-commit-hash>

# Restore database backup if needed
mysql -h 92.112.184.206 -P 3033 -u iodd-user -p iodd2 < /var/backups/iodd_YYYYMMDD_HHMMSS.sql

# Restart application
pm2 restart iodd-api
```

## Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs iodd-api --lines 100

# Check environment variables
pm2 env 0

# Verify Node.js version
node --version  # Should be 16+
```

### Database Connection Issues
```bash
# Test database connection
mysql -h 92.112.184.206 -P 3033 -u iodd-user -p iodd2

# Check firewall rules
sudo ufw status
```

### SSL Certificate Issues
```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate manually
sudo certbot renew
```

### High Memory Usage
```bash
# Restart application
pm2 restart iodd-api

# Check for memory leaks
pm2 monit

# Increase PM2 max memory restart
pm2 start api/IODD-Server_u1.08.mjs --name iodd-api --max-memory-restart 500M
```

## Performance Optimization

### Enable Compression
Add to nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

### Enable Caching
Add to nginx configuration:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Connection Pooling
Already configured in application with mysql2/promise.

## Security Incident Response

### If Credentials Are Compromised:

1. **Immediately**:
   ```bash
   # Rotate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Update .env with new secret
   pm2 restart iodd-api
   
   # Change database password
   # Update .env with new password
   
   # Change email password
   # Update .env with new password
   ```

2. **Within 24 hours**:
   - Review access logs: `sudo grep "POST /api2/login" /var/log/nginx/access.log`
   - Check database logs for suspicious queries
   - Notify affected users
   - Force re-authentication for all users

3. **Follow-up**:
   - Investigate breach source
   - Implement additional monitoring
   - Update security procedures
   - Consider implementing 2FA

## Support Contacts

- **Technical Issues**: support@iodd.com
- **Security Issues**: security@iodd.com
- **Emergency**: [Emergency contact number]

## Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
