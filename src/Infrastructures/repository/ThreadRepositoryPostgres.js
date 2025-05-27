const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const AddedThread = require("../../Domains/threads/entities/AddedThread");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread, owner) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads (id, title, body, date, user_id) VALUES($1, $2, $3, $4, $5) RETURNING id, title, user_id AS owner",
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);
    return new AddedThread({ ...result.rows[0] });
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("thread tidak ditemukan");
    }
  }

  async getThreadById(threadId) {
    // Query untuk mengambil detail thread dan username pemiliknya
    const query = {
      text: `
        SELECT
          threads.id,
          threads.title,
          threads.body,
          threads.date,
          users.username
        FROM threads
        INNER JOIN users ON threads.user_id = users.id
        WHERE threads.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("thread tidak ditemukan");
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
