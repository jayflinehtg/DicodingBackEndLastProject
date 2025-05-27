const DetailComment = require("../../Domains/comments/entities/DetailComment");
const DetailThread = require("../../Domains/threads/entities/DetailThread");
const DetailReply = require("../../Domains/replies/entities/DetailReply");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    // 1. Dapatkan data thread utama
    const threadData = await this._threadRepository.getThreadById(threadId);

    // 2. Dapatkan semua komentar mentah untuk thread tersebut
    const rawComments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    // 3. Jika ada komentar, ambil semua balasan untuk komentar-komentar tersebut
    let repliesByCommentId = {};
    if (rawComments.length > 0) {
      const commentIds = rawComments.map((comment) => comment.id);
      const rawReplies = await this._replyRepository.getRepliesByCommentIds(
        commentIds
      );
      // Proses dan kelompokkan balasan
      rawReplies.forEach((reply) => {
        if (!repliesByCommentId[reply.comment_id]) {
          repliesByCommentId[reply.comment_id] = [];
        }
        repliesByCommentId[reply.comment_id].push(
          new DetailReply({
            id: reply.id,
            content: reply.content,
            date: reply.date,
            username: reply.username,
            isDelete: reply.is_delete,
          })
        );
      });
    }

    // 4. Proses setiap komentar mentah menjadi instance DetailComment, sertakan balasannya
    const processedComments = rawComments.map((comment) => {
      const commentReplies = repliesByCommentId[comment.id] || [];

      return new DetailComment({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content,
        isDelete: comment.is_delete,
        replies: commentReplies,
      });
    });

    // 5. Buat instance DetailThread dengan data yang sudah diproses
    const detailThread = new DetailThread({
      id: threadData.id,
      title: threadData.title,
      body: threadData.body,
      date: threadData.date,
      username: threadData.username,
      comments: processedComments,
    });

    return detailThread;
  }
}

module.exports = GetThreadDetailUseCase;
