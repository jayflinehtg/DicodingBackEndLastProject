const NewComment = require("../../Domains/comments/entities/NewComment");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    // Dependency Injection
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository; // Kita butuh ini untuk verifikasi thread
  }

  async execute(useCasePayload, ownerId, threadId) {
    // 1. Verifikasi apakah thread tempat komentar akan ditambahkan memang ada.
    //    Kriteria: Jika thread yang diberi komentar tidak ada atau tidak valid, kembalikan 404.
    //    NotFoundError akan dilempar oleh threadRepository.verifyAvailableThread jika tidak ada.
    await this._threadRepository.verifyAvailableThread(threadId);

    // 2. Membuat entitas NewComment untuk validasi payload komentar
    const newComment = new NewComment(useCasePayload); // useCasePayload di sini adalah { content: '...' }

    // 3. Memanggil repository untuk menambahkan komentar
    //    ownerId didapatkan dari informasi autentikasi.
    //    threadId didapatkan dari parameter path URL.
    return this._commentRepository.addComment(newComment, ownerId, threadId);
  }
}

module.exports = AddCommentUseCase;
