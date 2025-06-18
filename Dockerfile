FROM node:23

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖
RUN npm install

# 暴露端口
EXPOSE 5322

# 启动命令会在 docker-compose.yml 中指定 