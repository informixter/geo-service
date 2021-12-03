
# Установка docker-compose

```shell
apt-get update && apt-get install apt-transport-https ca-certificates curl gnupg lsb-release
```
```shell
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
```shell
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
 $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
```
```shell
apt-get update && apt-get install docker-ce docker-ce-cli containerd.io -y && apt-cache madison docker-ce
```
```shell
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```
```shell
chmod +x /usr/local/bin/docker-compose && ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```
Проверить
```shell
docker-compose --version
```