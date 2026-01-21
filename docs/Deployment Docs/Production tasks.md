Remaining issues before production deployment:

Critical Issues:
2. HTTPS required for production

Production server uses https://iodd.com but needs SSL certificates configured on Ubuntu server

Action: Install SSL certificates (Let's Encrypt or commercial) and configure Nginx/Apache as reverse proxy

3. Production .env file

Ensure /webs/iodd/server3/s32_iodd-data-api/.env exists on Ubuntu server with correct values

Action: Copy and verify .env file on production server

6. PM2 startup script

On Ubuntu, run pm2 startup and pm2 save to ensure application starts on server reboot

Action: SSH to Ubuntu server and run:

pm2 startup
pm2 save

Copy
bash
7. Database connection

Verify production database at 92.112.184.206:3033 is accessible from Ubuntu server

Action: Test connection from Ubuntu server

8. File permissions

Ensure .env file on Ubuntu has restricted permissions (600 or 640)

Action: Run chmod 600 /webs/iodd/server3/s32_iodd-data-api/.env on Ubuntu

Optional/Minor Issues:
5. Backup tmp files

Delete _config_v*.tmp.js files in client folder before deployment

Action: Run rm /Users/Shared/repos/IODD_prod-master/client3/c32_iodd-app/_config_v*.tmp.js

All code-related issues (1, 4, 9, 10) are resolved.


