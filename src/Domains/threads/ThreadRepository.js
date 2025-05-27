class ThreadRepository {
  async addThread(newThread, owner) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyAvailableThread(threadId) {
    // method ini akan kita butuhkan nanti untuk fitur lain (seperti add comment atau get detail)
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getThreadById(threadId) {
    // method ini akan kita butuhkan nanti untuk fitur get detail thread
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getThreads() {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
  async deleteThread(threadId, owner) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = ThreadRepository;
