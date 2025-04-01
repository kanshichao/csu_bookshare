# Dockerfile for MySQL service
FROM mysql:8.0

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 复制初始化脚本
COPY ./docker/mysql/init.sql /docker-entrypoint-initdb.d/
COPY ./docker/mysql/conf.d/my.cnf /etc/mysql/conf.d/my.cnf

# 暴露端口
EXPOSE 3306

# 设置环境变量
ENV MYSQL_ROOT_PASSWORD=your_strong_password
ENV MYSQL_DATABASE=book_management
ENV MYSQL_USER=wxapp_user
ENV MYSQL_PASSWORD=wxapp_password

# 设置数据卷
VOLUME /var/lib/mysql
