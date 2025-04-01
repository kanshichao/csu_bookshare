// cloud/functions/mysql/index.js
const cloud = require('wx-server-sdk')
const mysql = require('mysql2/promise')
cloud.init()

// 从环境变量获取数据库配置
const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE
} = process.env

// 创建连接池
const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: parseInt(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  charset: 'utf8mb4'
})

// 健康检查间隔(5分钟)
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000
let lastHealthCheck = 0

// 执行健康检查
async function checkConnectionHealth() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    return true
  } catch (err) {
    console.error('MySQL健康检查失败:', err)
    return false
  }
}

// 主处理函数
exports.main = async (event, context) => {
  const { action, query, params = [] } = event
  let connection

  try {
    // 定期健康检查
    const now = Date.now()
    if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
      const isHealthy = await checkConnectionHealth()
      if (!isHealthy) {
        throw new Error('MySQL连接异常')
      }
      lastHealthCheck = now
    }

    // 获取连接
    connection = await pool.getConnection()

    // 处理不同操作类型
    switch (action) {
      case 'query':
        // 查询操作
        const [rows] = await connection.query(query, params)
        return {
          code: 200,
          data: rows
        }

      case 'execute':
        // 执行操作(INSERT/UPDATE/DELETE)
        const [result] = await connection.execute(query, params)
        return {
          code: 200,
          data: result
        }

      case 'transaction':
        // 事务处理
        await connection.beginTransaction()
        try {
          for (const item of params) {
            await connection.query(item.query, item.params)
          }
          await connection.commit()
          return { code: 200, message: '事务执行成功' }
        } catch (err) {
          await connection.rollback()
          throw err
        }

      default:
        throw new Error('不支持的操作类型')
    }
  } catch (error) {
    console.error('MySQL操作错误:', error)
    return {
      code: 500,
      message: '数据库操作失败',
      error: error.message
    }
  } finally {
    if (connection) connection.release()
  }
}
