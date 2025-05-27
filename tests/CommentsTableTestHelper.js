/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool"); // Sesuaikan path jika pool Anda berbeda

const CommentsTableTestHelper = {
  // Menambahkan komentar langsung ke database untuk keperluan setup test
  async addComment({
    id = "comment-123",
    threadId = "thread-123", // Pastikan thread ini ada
    owner = "user-123", // Pastikan user ini ada
    content = "isi komentar default",
    date = new Date().toISOString(),
    isDelete = false,
  }) {
    const query = {
      text: "INSERT INTO comments(id, thread_id, user_id, content, date, is_delete) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, threadId, owner, content, date, isDelete],
    };

    await pool.query(query);
  },

  // Mencari komentar berdasarkan ID
  async findCommentById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  // Membersihkan tabel comments setelah setiap test
  async cleanTable() {
    await pool.query("DELETE FROM comments WHERE 1=1");
  },
};

module.exports = CommentsTableTestHelper;
