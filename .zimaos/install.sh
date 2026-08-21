# Download the latest runner package
curl -o actions-runner-linux-x64-2.336.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.336.0/actions-runner-linux-x64-2.336.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.336.0.tar.gz

cd /var/lib/casaos/apps/roms-manager
sudo chmod 644 /var/lib/casaos/apps/roms-manager/docker-compose.yml

mkdir -p /media/ZimaOS-HD/AppData/.mongo/roms-manager

cd ~/AppData/actions-runner/_work/roms-manager-server/roms-manager-server
DOCKER_CONFIG=~/AppData/actions-runner/docker-config docker build -t roms-manager:latest .
docker image list

cd ~/AppData/actions-runner/_work/roms-manager-server/roms-manager-server
DOCKER_CONFIG=~/AppData/actions-runner/docker-config docker compose up -d --force-recreate

