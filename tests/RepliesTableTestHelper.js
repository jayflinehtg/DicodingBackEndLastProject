/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply({
    id = "reply-123",
    commentId = "comment-123",
    threadId = "thread-123",
    owner = "user-123",
    content = "isi balasan default",
    date = new Date().toISOString(),
    isDelete = false,
  }) {
    const query = {
      text: `INSERT INTO comment_replies(id, comment_id, thread_id, user_id, content, date, is_delete) 
             VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [id, commentId, threadId, owner, content, date, isDelete],
    };

    await pool.query(query);
  },

  // Mencari balasan berdasarkan ID
  async findReplyById(id) {
    const query = {
      text: "SELECT * FROM comment_replies WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  // Membersihkan tabel comment_replies setelah setiap test
  async cleanTable() {
    await pool.query("DELETE FROM comment_replies WHERE 1=1");
  },
};

module.exports = RepliesTableTestHelper;
