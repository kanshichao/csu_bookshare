// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');
const profileRoutes = require('./routes/profile');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 80;

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/profile', profileRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 数据库连接检查
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection established successfully');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;
