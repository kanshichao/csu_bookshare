// cloud/functions/profile/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const usersCollection = db.collection('users')

/**
 * 获取用户资料
 */
exports.main = async (event, context) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 1. 获取用户资料
    if (action === 'getProfile') {
      const res = await usersCollection.where({
        openid
      }).get()
      
      if (res.data.length === 0) {
        return { code: 404, message: '用户不存在' }
      }

      // 过滤敏感字段
      const { password, salt, ...profile } = res.data[0]
      return {
        code: 200,
        data: profile
      }
    }

    // 2. 更新用户资料
    if (action === 'updateProfile') {
      const { profileData } = event
      
      // 验证字段
      const allowedFields = ['name', 'avatar', 'dormitory', 'contact']
      const updateData = {}
      
      Object.keys(profileData).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = profileData[key]
        }
      })

      if (Object.keys(updateData).length === 0) {
        return { code: 400, message: '无有效更新字段' }
      }

      await usersCollection.where({
        openid
      }).update({
        data: updateData
      })

      return {
        code: 200,
        message: '更新成功'
      }
    }

    // 3. 获取其他用户公开信息
    if (action === 'getPublicProfile') {
      const { userId } = event
      
      const res = await usersCollection.doc(userId).field({
        name: true,
        avatar: true,
        dormitory: true,
        createTime: true
      }).get()

      if (!res.data) {
        return { code: 404, message: '用户不存在' }
      }

      return {
        code: 200,
        data: res.data
      }
    }

    return { code: 400, message: '无效操作' }

  } catch (err) {
    console.error('profile函数错误:', err)
    return {
      code: 500,
      message: '服务器错误',
      error: err.message
    }
  }
}
