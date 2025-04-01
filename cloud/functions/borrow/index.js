// cloud/functions/borrow/index.js
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();
  
  // 借阅图书
  if (action === 'borrow') {
    const { bookId, borrowerId } = event;
    
    // 1. 检查图书状态
    const bookRes = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: 'SELECT * FROM books WHERE _id = ?',
        params: [bookId]
      }
    });
    
    if (bookRes.data.length === 0) {
      return { code: 404, message: '图书不存在' };
    }
    
    const book = bookRes.data[0];
    
    if (book.status !== 'available') {
      return { code: 400, message: '图书不可借阅' };
    }
    
    // 2. 创建借阅记录
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30天后到期
    
    await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'execute',
        query: `
          INSERT INTO borrow_records 
          (book_id, book_title, borrower_id, dormitory, borrow_time, due_time, status)
          VALUES (?, ?, ?, ?, NOW(), ?, 'borrowed')
        `,
        params: [
          bookId,
          book.title,
          borrowerId,
          book.dormitory,
          dueDate
        ]
      }
    });
    
    // 3. 更新图书状态
    await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'execute',
        query: 'UPDATE books SET status = "borrowed", current_borrower = ? WHERE _id = ?',
        params: [borrowerId, bookId]
      }
    });
    
    return { code: 200, message: '借阅成功' };
  }
  
  // 归还图书
  if (action === 'return') {
    const { bookId } = event;
    
    // 1. 检查图书状态
    const bookRes = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: 'SELECT * FROM books WHERE _id = ?',
        params: [bookId]
      }
    });
    
    if (bookRes.data.length === 0) {
      return { code: 404, message: '图书不存在' };
    }
    
    const book = bookRes.data[0];
    
    if (book.status !== 'borrowed') {
      return { code: 400, message: '图书未被借出' };
    }
    
    // 2. 更新借阅记录
    await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'execute',
        query: `
          UPDATE borrow_records 
          SET status = 'returned', return_time = NOW() 
          WHERE book_id = ? AND status = 'borrowed'
        `,
        params: [bookId]
      }
    });
    
    // 3. 更新图书状态
    await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'execute',
        query: 'UPDATE books SET status = "available", current_borrower = NULL WHERE _id = ?',
        params: [bookId]
      }
    });
    
    return { code: 200, message: '归还成功' };
  }
  
  // 获取当前借阅
  if (action === 'current') {
    const { userId } = event;
    
    const res = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: `
          SELECT r.*, b.cover_url AS book_cover
          FROM borrow_records r
          JOIN books b ON r.book_id = b._id
          WHERE r.borrower_id = ? AND r.status = 'borrowed'
          ORDER BY r.due_time ASC
        `,
        params: [userId]
      }
    });
    
    return { code: 200, data: res.data };
  }
  
  // 获取历史借阅
  if (action === 'history') {
    const { userId } = event;
    
    const res = await cloud.callFunction({
      name: 'mysql',
      data: {
        action: 'query',
        query: `
          SELECT r.*, b.cover_url AS book_cover
          FROM borrow_records r
          JOIN books b ON r.book_id = b._id
          WHERE r.borrower_id = ? AND r.status = 'returned'
          ORDER BY r.return_time DESC
          LIMIT 100
        `,
        params: [userId]
      }
    });
    
    return { code: 200, data: res.data };
  }
  
  return { code: 400, message: '无效操作' };
};
