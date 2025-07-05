# DevTinder

## Deployment

- Update mongoDB password (optional: for security reasons)
- Allow ec2 instance public ip on mongoDB server
- npm install pm2 -g
- pm2 start --name "devTinder-backend" -- start
- pm2 logs
- pm2 list, pm2 flush <name>, pm2 stop <name>, pm2 delete <name>
- sudo nano /etc/nginx/sites-available/default
- nginx config for adding proxy pass /api to port 3000

  server_name 51.20.92.222

  location / {
  try_files $uri /index.html;
  }

  location /api/ {
  proxy_pass http://localhost:3000/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
  }

- After nginx configuration restart nginx
- sudo systemctl restart nginx
- sudo systemctl daemon-reload (if above command for restart not working or give warning)
