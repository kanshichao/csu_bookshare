# Dockerfile for Backend Service
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USER=wxapp_user
ENV MYSQL_PASSWORD=wxapp_password
ENV MYSQL_DATABASE=book_management
ENV JWT_SECRET=your_jwt_secret_key_here

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
