const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment, ownerId, threadId) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: "INSERT INTO comments(id, thread_id, user_id, content, date, is_delete) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id AS owner",
      values: [id, threadId, ownerId, content, date, isDelete],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async verifyAvailableCommentInThread(commentId, threadId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1 AND thread_id = $2 AND is_delete = FALSE",
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError(
        "komentar tidak ditemukan di thread ini atau sudah dihapus"
      );
    }
  }

  async verifyCommentOwner(commentId, ownerId) {
    const query = {
      text: "SELECT user_id FROM comments WHERE id = $1",
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("komentar tidak ditemukan");
    }

    const comment = result.rows[0];
    if (comment.user_id !== ownerId) {
      throw new AuthorizationError("anda tidak berhak mengakses resource ini");
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1 RETURNING id",
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("komentar gagal dihapus. Id tidak ditemukan");
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT
          comments.id,
          users.username,
          comments.date,
          comments.content,
          comments.is_delete 
        FROM comments
        INNER JOIN users ON comments.user_id = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
