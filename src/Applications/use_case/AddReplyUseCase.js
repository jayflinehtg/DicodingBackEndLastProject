const NewReply = require("../../Domains/replies/entities/NewReply");

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, ownerId, threadId, commentId) {
    // 1. Verifikasi apakah thread tempat komentar berada memang ada.
    await this._threadRepository.verifyAvailableThread(threadId);

    // 2. Verifikasi apakah komentar yang akan dibalas memang ada di dalam thread tersebut.
    await this._commentRepository.verifyAvailableCommentInThread(
      commentId,
      threadId
    );

    // 3. Membuat entitas NewReply untuk validasi payload balasan
    const newReply = new NewReply(useCasePayload);

    // 4. Memanggil repository untuk menambahkan balasan
    return this._replyRepository.addReply(
      newReply,
      ownerId,
      commentId,
      threadId
    );
  }
}

module.exports = AddReplyUseCase;
