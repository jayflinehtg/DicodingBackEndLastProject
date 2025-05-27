/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");
const bcrypt = require("bcrypt");

const UsersTableTestHelper = {
  async addUser({
    id = "user-123",
    username = "dicoding",
    password = "password",
    fullname = "Dicoding Indonesia",
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: "INSERT INTO users VALUES($1, $2, $3, $4)",
      values: [id, username, hashedPassword, fullname],
    };

    await pool.query(query);
  },

  async findUsersById(id) {
    const query = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM users WHERE 1=1");
  },

  // Jika Anda memiliki metode getPasswordByUsername di helper ini (untuk tes lain),
  // pastikan ia mengembalikan password yang sudah ter-hash.
};

module.exports = UsersTableTestHelper;
