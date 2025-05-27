const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddReplyUseCase = require("../AddReplyUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("AddReplyUseCase", () => {
  it("should orchestrate the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "Ini adalah isi balasan.",
    };
    const mockOwnerId = "user-123";
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-123";

    // Data yang akan digunakan oleh mock repository untuk membuat objek kembalian
    const dataForMockReturn = {
      id: "reply-xyz789", // ID unik dari mock repository
      content: useCasePayload.content,
      owner: mockOwnerId,
    };

    // Entitas yang diharapkan sebagai hasil akhir dari use case
    const expectedAddedReply = new AddedReply({
      id: dataForMockReturn.id,
      content: dataForMockReturn.content,
      owner: dataForMockReturn.owner,
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed functions */
    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.addReply = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedReply({
          // Membuat instance baru di sini
          id: dataForMockReturn.id,
          content: dataForMockReturn.content,
          owner: dataForMockReturn.owner,
        })
      )
    );

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const actualAddedReply = await addReplyUseCase.execute(
      useCasePayload,
      mockOwnerId,
      mockThreadId,
      mockCommentId
    );

    // Assert
    expect(actualAddedReply).toStrictEqual(expectedAddedReply);
    expect(actualAddedReply).toBeInstanceOf(AddedReply);

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new NewReply({ content: useCasePayload.content }),
      mockOwnerId,
      mockCommentId,
      mockThreadId
    );
  });

  it("should throw NotFoundError if thread is not available", async () => {
    // Arrange
    const useCasePayload = { content: "Balasan gagal karena thread tidak ada" };
    const mockOwnerId = "user-123";
    const mockThreadId = "thread-tidak-ada";
    const mockCommentId = "comment-123";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("THREAD_NOT_FOUND"))
      );
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn();
    mockReplyRepository.addReply = jest.fn();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(
        useCasePayload,
        mockOwnerId,
        mockThreadId,
        mockCommentId
      )
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).not.toHaveBeenCalled();
    expect(mockReplyRepository.addReply).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if comment is not available in thread", async () => {
    // Arrange
    const useCasePayload = { content: "Balasan gagal karena komen tidak ada" };
    const mockOwnerId = "user-123";
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-tidak-ada";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("COMMENT_NOT_FOUND_IN_THREAD"))
      );
    mockReplyRepository.addReply = jest.fn();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(
        useCasePayload,
        mockOwnerId,
        mockThreadId,
        mockCommentId
      )
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(mockReplyRepository.addReply).not.toHaveBeenCalled();
  });
});
