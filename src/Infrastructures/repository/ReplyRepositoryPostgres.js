const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AddedReply = require("../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply, ownerId, commentId, threadId) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: `INSERT INTO comment_replies(id, comment_id, thread_id, user_id, content, date, is_delete) 
             VALUES($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, content, user_id AS owner`,
      values: [id, commentId, threadId, ownerId, content, date, isDelete],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async verifyAvailableReplyInComment(replyId, commentId) {
    const query = {
      text: "SELECT id FROM comment_replies WHERE id = $1 AND comment_id = $2 AND is_delete = FALSE",
      values: [replyId, commentId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError(
        "balasan tidak ditemukan di komentar ini atau sudah dihapus"
      );
    }
  }

  async verifyReplyOwner(replyId, ownerId) {
    const query = {
      text: "SELECT user_id FROM comment_replies WHERE id = $1",
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("balasan tidak ditemukan");
    }

    const reply = result.rows[0];
    if (reply.user_id !== ownerId) {
      throw new AuthorizationError(
        "anda tidak berhak mengakses resource ini (balasan)"
      );
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: "UPDATE comment_replies SET is_delete = TRUE WHERE id = $1 RETURNING id",
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("balasan gagal dihapus. Id tidak ditemukan");
    }
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds || commentIds.length === 0) {
      return [];
    }

    const query = {
      text: `
        SELECT
          r.id,
          r.comment_id, 
          u.username,
          r.date,
          r.content,
          r.is_delete
        FROM comment_replies r
        INNER JOIN users u ON r.user_id = u.id
        WHERE r.comment_id = ANY($1::text[]) -- Menggunakan ANY untuk array commentIds
        ORDER BY r.date ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
