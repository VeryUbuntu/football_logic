# Deployment Guide (Ubuntu)

This guide covers how to deploy the **Football Logic** application on an Ubuntu server using two methods: **Docker** (Recommended) or **Node.js + PM2**.

## Prerequisites
- An Ubuntu Server (20.04 or 22.04 LTS recommended).
- SSH Access to the server.
- Git installed (`sudo apt update && sudo apt install git`).

---

## Option A: Docker Deployment (Recommended)
Docker provides the most stable and isolated environment.

### 1. Install Docker
```bash
# Update package index
sudo apt update
sudo apt install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify
sudo docker run hello-world
```

### 2. Clone & Build
```bash
git clone https://github.com/VeryUbuntu/football_logic.git
cd football_logic

# Build the Docker Image (This may take a few minutes)
sudo docker build -t football-logic .
```

### 3. Run Container
```bash
# Run on port 3000 (auto-restart enabled)
sudo docker run -d -p 3000:3000 --restart always --name football-app football-logic
```

Access your app at `http://<YOUR_SERVER_IP>:3000/command`.

---

## Option B: Manual Deployment (Node.js + PM2)

### 1. Install Node.js (v18+)
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js v18
nvm install 18
nvm use 18
```

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/VeryUbuntu/football_logic.git
cd football_logic

# Install dependencies
npm install
```

### 3. Build & configure
Next.js needs to build for production.
```bash
# Set environment info (Optional if you have a .env file)
# export NEXT_PUBLIC_SUPABASE_URL=... 

# Build project
npm run build
```

### 4. Start with PM2 (Process Manager)
PM2 keeps your app running in the background.
```bash
# Install PM2 globally
npm install pm2 -g

# Start the app
pm2 start npm --name "football-logic" -- start

# Save PM2 list so it restarts on reboot
pm2 save
pm2 startup
```

---

## Nginx Reverse Proxy (Optional but Recommended)
To serve your app on port 80 (HTTP) instead of 3000.

1. **Install Nginx**:
   ```bash
   sudo apt install nginx
   ```

2. **Configure Nginx**:
   Create a config file: `sudo nano /etc/nginx/sites-available/football_logic`
   
   Add content:
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable & Restart**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/football_logic /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default if needed
   sudo nginx -t
   sudo systemctl restart nginx
   ```

Now your app is live at `http://<YOUR_SERVER_IP>/command`!
