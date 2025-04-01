// cloud/functions/books/index.js
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();
  
  // 获取图书列表
  if (action === 'list') {
    const { dormitory, category, search } = event;
    
    let query = 'SELECT * FROM books WHERE dormitory = ?';
    const params = [dormitory];
    
    if (category) {
      query += ' AND main_category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY create_time DESC LIMIT 100';
    
    const res = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: query,
        params: params
      }
    });
    
    return { code: 200, data: res.data };
  }
  
  // 获取图书详情
  if (action === 'detail') {
    const { bookId } = event;
    
    const res = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: `
          SELECT b.*, u.name AS borrower_name 
          FROM books b
          LEFT JOIN users u ON b.current_borrower = u._id
          WHERE b._id = ?
        `,
        params: [bookId]
      }
    });
    
    if (res.data.length === 0) {
      return { code: 404, message: '图书不存在' };
    }
    
    return { code: 200, data: res.data[0] };
  }
  
  return { code: 400, message: '无效操作' };
};
