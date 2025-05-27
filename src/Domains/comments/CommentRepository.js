class CommentRepository {
  async addComment(newComment, ownerId, threadId) {
    // newComment adalah instance dari entitas NewComment
    // ownerId adalah string (user_id yang membuat komentar)
    // threadId adalah string (id thread tempat komentar ditambahkan)
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyCommentOwner(commentId, ownerId) {
    // Method ini akan dibutuhkan untuk Kriteria 3: Menghapus Komentar
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteCommentById(commentId) {
    // Method ini akan dibutuhkan untuk Kriteria 3: Menghapus Komentar (soft delete)
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getCommentsByThreadId(threadId) {
    // Method ini akan dibutuhkan untuk Kriteria 4: Melihat Detail Thread
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyAvailableCommentInThread(commentId, threadId) {
    // Method ini akan dibutuhkan untuk Kriteria 3 (menghapus komentar)
    // dan juga untuk fitur opsional (menambah/menghapus balasan)
    // untuk memastikan komentar ada di thread yang benar sebelum aksi.
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  // Anda bisa menambahkan method lain yang relevan dengan komentar di sini
}

module.exports = CommentRepository;
