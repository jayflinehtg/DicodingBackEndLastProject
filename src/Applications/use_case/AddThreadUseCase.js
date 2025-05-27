const NewThread = require("../../Domains/threads/entities/NewThread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, ownerId) {
    // 1. Membuat entitas NewThread untuk validasi payload
    const newThread = new NewThread(useCasePayload);

    // 2. Memanggil repository untuk menambahkan thread
    return this._threadRepository.addThread(newThread, ownerId);
  }
}

module.exports = AddThreadUseCase;
