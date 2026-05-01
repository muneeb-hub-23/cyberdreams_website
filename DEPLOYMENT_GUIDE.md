# 🚀 Cyber Dreams - Deployment Guide

## Quick Start (Local Testing)

### Option 1: Python Server (Recommended)
```bash
cd d:\Under_Developement\cyberdreams_website
python -m http.server 8000
```
Then open: `http://localhost:8000`

### Option 2: Node.js Server
```bash
npx http-server -p 8000
```

### Option 3: PHP Server
```bash
php -S localhost:8000
```

### Option 4: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 🌐 Production Deployment

### 1. **Netlify** (Easiest - Free)

#### Via Drag & Drop:
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login
3. Drag the entire project folder to Netlify
4. Done! Your site is live

#### Via Netlify CLI:
```bash
npm install -g netlify-cli
cd d:\Under_Developement\cyberdreams_website
netlify deploy --prod
```

**Custom Domain Setup:**
- Go to Domain Settings in Netlify
- Add your custom domain
- Update DNS records as instructed

---

### 2. **Vercel** (Fast & Free)

```bash
npm install -g vercel
cd d:\Under_Developement\cyberdreams_website
vercel --prod
```

Or use the Vercel dashboard to import from Git.

---

### 3. **GitHub Pages** (Free)

1. Create a GitHub repository
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```
3. Go to Settings → Pages
4. Select branch: `main`
5. Click Save

Your site will be live at: `https://yourusername.github.io/repo-name`

---

### 4. **IIS (Windows Server)**

1. **Install IIS** (if not already installed)
   - Control Panel → Programs → Turn Windows features on/off
   - Enable "Internet Information Services"

2. **Copy Files**
   ```bash
   xcopy /E /I d:\Under_Developement\cyberdreams_website C:\inetpub\wwwroot\cyberdreams
   ```

3. **Configure IIS**
   - Open IIS Manager
   - Right-click "Sites" → Add Website
   - Site name: Cyber Dreams
   - Physical path: `C:\inetpub\wwwroot\cyberdreams`
   - Binding: HTTP, Port 80 (or HTTPS, Port 443)

4. **SSL Certificate** (for HTTPS)
   - Use Let's Encrypt or purchase SSL certificate
   - Import certificate in IIS
   - Update bindings to use HTTPS

**Note:** The `web.config` file is already configured with:
- HTTPS redirect
- Security headers
- Compression
- Caching

---

### 5. **Apache Server**

1. **Copy Files**
   ```bash
   sudo cp -r /path/to/cyberdreams_website /var/www/html/cyberdreams
   ```

2. **Create .htaccess** (convert web.config rules)
   ```apache
   # HTTPS Redirect
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Security Headers
   Header set X-Frame-Options "SAMEORIGIN"
   Header set X-XSS-Protection "1; mode=block"
   Header set X-Content-Type-Options "nosniff"
   
   # Enable Compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
   </IfModule>
   
   # Browser Caching
   <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType text/css "access plus 1 month"
       ExpiresByType application/javascript "access plus 1 month"
   </IfModule>
   ```

3. **Configure Virtual Host**
   ```apache
   <VirtualHost *:80>
       ServerName cyberdreams.com
       DocumentRoot /var/www/html/cyberdreams
       <Directory /var/www/html/cyberdreams>
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

4. **Restart Apache**
   ```bash
   sudo systemctl restart apache2
   ```

---

### 6. **Nginx**

1. **Copy Files**
   ```bash
   sudo cp -r /path/to/cyberdreams_website /var/www/cyberdreams
   ```

2. **Configure Nginx**
   Create `/etc/nginx/sites-available/cyberdreams`:
   ```nginx
   server {
       listen 80;
       server_name cyberdreams.com www.cyberdreams.com;
       root /var/www/cyberdreams;
       index index.html;
       
       # HTTPS Redirect
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name cyberdreams.com www.cyberdreams.com;
       root /var/www/cyberdreams;
       index index.html;
       
       # SSL Configuration
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       # Security Headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Strict-Transport-Security "max-age=31536000" always;
       
       # Compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
       
       # Caching
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

3. **Enable Site & Restart**
   ```bash
   sudo ln -s /etc/nginx/sites-available/cyberdreams /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### 7. **cPanel Hosting**

1. **Login to cPanel**
2. **File Manager**
   - Navigate to `public_html`
   - Upload all files (or use FTP)
3. **Domain Setup**
   - Ensure domain points to your hosting
4. **SSL Certificate**
   - Use cPanel's AutoSSL or Let's Encrypt

---

## 🔒 SSL/HTTPS Setup

### Free SSL with Let's Encrypt:

#### For Apache/Nginx:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d cyberdreams.com -d www.cyberdreams.com
```

#### For IIS:
Use [win-acme](https://www.win-acme.com/) or purchase SSL certificate

---

## 🌍 Domain Configuration

### DNS Records:

**A Record:**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: cyberdreams.com
TTL: 3600
```

**For Netlify/Vercel:**
Follow their specific DNS instructions in the dashboard.

---

## ✅ Pre-Deployment Checklist

- [ ] Test all links and navigation
- [ ] Verify contact form functionality
- [ ] Check responsive design on mobile/tablet
- [ ] Test background music controls
- [ ] Verify all images load correctly
- [ ] Test WhatsApp and phone links
- [ ] Check all animations work smoothly
- [ ] Validate HTML/CSS
- [ ] Test in multiple browsers
- [ ] Optimize images (if needed)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure SEO meta tags
- [ ] Test page load speed
- [ ] Verify SSL certificate works
- [ ] Test 404 error page
- [ ] Check security headers

---

## 🔧 Post-Deployment

### 1. **Google Analytics**
Add tracking code before `</head>` in `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. **Google Search Console**
- Add and verify your site
- Submit sitemap (create sitemap.xml)

### 3. **Social Media Meta Tags**
Already included in HTML, update with your actual URLs:
```html
<meta property="og:url" content="https://cyberdreams.com">
<meta property="og:image" content="https://cyberdreams.com/assets/images/logo.png">
```

### 4. **Performance Monitoring**
- Use Google PageSpeed Insights
- Monitor with GTmetrix
- Set up uptime monitoring (UptimeRobot)

---

## 📊 Performance Optimization

### Image Optimization:
```bash
# Install ImageMagick or use online tools
# Compress images without quality loss
```

### Minify CSS/JS (Optional):
```bash
npm install -g clean-css-cli uglify-js
cleancss -o assets/css/style.min.css assets/css/style.css
uglifyjs assets/js/main.js -o assets/js/main.min.js
```

Then update HTML to use minified versions.

---

## 🆘 Troubleshooting

### Music Not Playing:
- Check browser console for errors
- Ensure audio file path is correct
- Verify browser autoplay policies
- User interaction required for autoplay

### Animations Not Working:
- Check if CDN libraries are loading
- Verify internet connection
- Check browser console for errors

### Images Not Loading:
- Verify file paths are correct
- Check file permissions (755 for directories, 644 for files)
- Ensure images are in correct folder

### 404 Errors:
- Check server configuration
- Verify .htaccess or web.config
- Ensure all files are uploaded

---

## 📞 Support

For deployment assistance:
- **Email**: muneebbaig200@gmail.com
- **Phone**: 03175648951
- **WhatsApp**: [Chat Now](https://wa.me/923175648951)

---

**Happy Deploying! 🚀**

*Cyber Dreams - CODE • CREATE • CONQUER*
