# Dockerfile for Backend Service
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 解决 npm 安装问题
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set disturl https://npmmirror.com/dist && \
    npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass && \
    npm config set phantomjs_cdnurl https://npmmirror.com/mirrors/phantomjs && \
    npm config set electron_mirror https://npmmirror.com/mirrors/electron/ && \
    npm config set puppeteer_download_host https://npmmirror.com/mirrors

# 复制 package.json 和 package-lock.json
COPY app*.json ./

# 安装系统依赖（如有需要）
RUN apk add --no-cache --virtual .build-deps \
    g++ \
    make \
    python3 \
    && npm install --production \
    && apk del .build-deps

# 设置内存限制
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 复制应用代码
COPY . .

# 设置权限
RUN chown -R node:node /app && \
    chmod -R 755 /app

# 设置环境变量
ENV NODE_ENV=production
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USER=wxapp_user
ENV MYSQL_PASSWORD=wxapp_password
ENV MYSQL_DATABASE=book_management
ENV JWT_SECRET=your_jwt_secret_key_here

# 暴露端口
EXPOSE 80

# 使用非root用户运行
USER node

# 启动命令
CMD ["npm", "start"]
