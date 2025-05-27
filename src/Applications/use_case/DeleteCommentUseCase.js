class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, ownerId) {
    // 1. Verifikasi apakah thread tempat komentar berada memang ada.
    await this._threadRepository.verifyAvailableThread(threadId);

    // 2. Verifikasi apakah komentar yang akan dihapus memang ada di dalam thread tersebut.
    await this._commentRepository.verifyAvailableCommentInThread(
      commentId,
      threadId
    );

    // 3. Verifikasi apakah pengguna yang mencoba menghapus adalah pemilik komentar.
    await this._commentRepository.verifyCommentOwner(commentId, ownerId);

    // 4. Lakukan soft delete pada komentar.
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
