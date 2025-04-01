// cloud/functions/auth/index.js
const cloud = require('wx-server-sdk');
const { encryptPassword, validatePassword } = require('./crypto');
cloud.init();

exports.main = async (event, context) => {
  const { action } = event;
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  
  // 学号密码登录
  if (action === 'login') {
    const { studentId, password } = event;
    
    // 1. 查询MySQL验证用户
    const mysqlRes = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: 'SELECT * FROM users WHERE student_id = ?',
        params: [studentId]
      }
    });
    
    if (mysqlRes.data.length === 0) {
      return { code: 404, message: '用户不存在' };
    }
    
    const user = mysqlRes.data[0];
    
    // 2. 验证密码
    if (!validatePassword(password, user.password, user.salt)) {
      return { code: 401, message: '密码错误' };
    }
    
    // 3. 返回用户信息(过滤敏感字段)
    const { password: _, salt: __, ...safeUser } = user;
    return { code: 200, data: safeUser };
  }
  
  // 修改密码
  if (action === 'change_password') {
    const { oldPassword, newPassword } = event;
    const userId = wxContext.OPENID;
    
    // 1. 获取用户当前密码
    const mysqlRes = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: 'SELECT password, salt FROM users WHERE _id = ?',
        params: [userId]
      }
    });
    
    if (mysqlRes.data.length === 0) {
      return { code: 404, message: '用户不存在' };
    }
    
    const { password: storedPassword, salt } = mysqlRes.data[0];
    
    // 2. 验证旧密码
    if (!validatePassword(oldPassword, storedPassword, salt)) {
      return { code: 401, message: '原密码错误' };
    }
    
    // 3. 更新密码
    const newSalt = generateSalt();
    const newEncryptedPwd = encryptPassword(newPassword, newSalt);
    
    await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'execute',
        query: 'UPDATE users SET password = ?, salt = ? WHERE _id = ?',
        params: [newEncryptedPwd, newSalt, userId]
      }
    });
    
    return { code: 200, message: '密码修改成功' };
  }
  
  return { code: 400, message: '无效操作' };
};
