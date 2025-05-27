class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, replyId, ownerId) {
    // 1. Verifikasi apakah thread tempat komentar/balasan berada memang ada.
    await this._threadRepository.verifyAvailableThread(threadId);

    // 2. Verifikasi apakah komentar tempat balasan berada memang ada di dalam thread tersebut.
    await this._commentRepository.verifyAvailableCommentInThread(
      commentId,
      threadId
    );

    // 3. Verifikasi apakah balasan yang akan dihapus memang ada di dalam komentar tersebut.
    await this._replyRepository.verifyAvailableReplyInComment(
      replyId,
      commentId
    );

    // 4. Verifikasi apakah pengguna yang mencoba menghapus adalah pemilik balasan.
    await this._replyRepository.verifyReplyOwner(replyId, ownerId);

    // 5. Lakukan soft delete pada balasan.
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
