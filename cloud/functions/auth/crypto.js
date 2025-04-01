// cloud/functions/auth/crypto.js
const crypto = require('crypto')

// 生成随机盐值
function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex')
}

// 加密密码 (PBKDF2算法)
function encryptPassword(password, salt, iterations = 1000, keylen = 64, digest = 'sha512') {
  // 先对密码进行一次哈希，防止原始密码过长被截断
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
  return crypto.pbkdf2Sync(hashedPassword, salt, iterations, keylen, digest).toString('hex')
}

// 验证密码
function validatePassword(inputPassword, storedPassword, salt) {
  const encryptedInput = encryptPassword(inputPassword, salt)
  return crypto.timingSafeEqual(
    Buffer.from(encryptedInput, 'hex'),
    Buffer.from(storedPassword, 'hex')
  )
}

// 生成JWT令牌
function generateToken(payload, secret = process.env.JWT_SECRET, expiresIn = '7d') {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天过期
  })).toString('base64url')
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// 验证JWT令牌
function verifyToken(token, secret = process.env.JWT_SECRET) {
  const [encodedHeader, encodedPayload, signature] = token.split('.')
  
  // 验证签名
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')
  
  if (!crypto.timingSafeEqual(
    Buffer.from(signature, 'base64url'),
    Buffer.from(expectedSignature, 'base64url')
  )) {
    throw new Error('无效的令牌签名')
  }
  
  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
  
  // 检查过期时间
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('令牌已过期')
  }
  
  return payload
}

module.exports = {
  generateSalt,
  encryptPassword,
  validatePassword,
  generateToken,
  verifyToken
}
