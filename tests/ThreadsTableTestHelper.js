/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool"); // Sesuaikan path jika pool Anda berbeda

const ThreadsTableTestHelper = {
  // Menambahkan thread langsung ke database untuk keperluan setup test
  async addThread({
    id = "thread-123",
    title = "judul thread",
    body = "isi thread",
    owner = "user-123", // Pastikan user ini ada di tabel users jika ada foreign key constraint
    date = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO threads(id, title, body, user_id, date) VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  },

  // Mencari thread berdasarkan ID
  async findThreadById(id) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  // Membersihkan tabel threads setelah setiap test
  async cleanTable() {
    await pool.query("DELETE FROM threads WHERE 1=1");
  },
};

module.exports = ThreadsTableTestHelper;
