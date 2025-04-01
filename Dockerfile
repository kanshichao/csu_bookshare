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
COPY package*.json ./

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

# 生产镜像
FROM node:16-alpine
WORKDIR /app

# 复制云函数
COPY --from=builder /app/cloud/functions ./mysql

# 安装云函数依赖
RUN find ./mysql -name "package.json" -execdir npm install \;

# 安装全局依赖
RUN npm install -g serve

# 暴露端口
EXPOSE 80

# 使用非root用户运行
USER node

# 启动命令
CMD ["npm", "start"]
