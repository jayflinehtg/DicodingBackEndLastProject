const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteReplyUseCase = require("../DeleteReplyUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("DeleteReplyUseCase", () => {
  it("should orchestrate the delete reply action correctly", async () => {
    // Arrange
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-123";
    const mockReplyId = "reply-123";
    const mockOwnerId = "user-123";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyAvailableReplyInComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(
      mockThreadId,
      mockCommentId,
      mockReplyId,
      mockOwnerId
    );

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(
      mockReplyRepository.verifyAvailableReplyInComment
    ).toHaveBeenCalledWith(mockReplyId, mockCommentId);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      mockReplyId,
      mockOwnerId
    );
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(
      mockReplyId
    );
  });

  it("should throw NotFoundError if thread is not available", async () => {
    // Arrange
    const mockThreadId = "thread-not-found";
    const mockCommentId = "comment-123";
    const mockReplyId = "reply-123";
    const mockOwnerId = "user-123";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("THREAD_NOT_FOUND"))
      );
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn();
    mockReplyRepository.verifyAvailableReplyInComment = jest.fn();
    mockReplyRepository.verifyReplyOwner = jest.fn();
    mockReplyRepository.deleteReplyById = jest.fn();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        mockThreadId,
        mockCommentId,
        mockReplyId,
        mockOwnerId
      )
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).not.toHaveBeenCalled();
    expect(
      mockReplyRepository.verifyAvailableReplyInComment
    ).not.toHaveBeenCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if comment is not available in thread", async () => {
    // Arrange
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-not-found";
    const mockReplyId = "reply-123";
    const mockOwnerId = "user-123";

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
    mockReplyRepository.verifyAvailableReplyInComment = jest.fn();
    mockReplyRepository.verifyReplyOwner = jest.fn();
    mockReplyRepository.deleteReplyById = jest.fn();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        mockThreadId,
        mockCommentId,
        mockReplyId,
        mockOwnerId
      )
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(
      mockReplyRepository.verifyAvailableReplyInComment
    ).not.toHaveBeenCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if reply is not available in comment", async () => {
    // Arrange
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-123";
    const mockReplyId = "reply-not-found";
    const mockOwnerId = "user-123";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyAvailableReplyInComment = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("REPLY_NOT_FOUND_IN_COMMENT"))
      );
    mockReplyRepository.verifyReplyOwner = jest.fn();
    mockReplyRepository.deleteReplyById = jest.fn();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        mockThreadId,
        mockCommentId,
        mockReplyId,
        mockOwnerId
      )
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(
      mockReplyRepository.verifyAvailableReplyInComment
    ).toHaveBeenCalledWith(mockReplyId, mockCommentId);
    expect(mockReplyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });

  it("should throw AuthorizationError if user is not the owner of the reply", async () => {
    // Arrange
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-123";
    const mockReplyId = "reply-123";
    const mockOwnerId = "user-not-owner"; // User yang bukan pemilik

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyAvailableReplyInComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new AuthorizationError("NOT_REPLY_OWNER"))
      );
    mockReplyRepository.deleteReplyById = jest.fn();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        mockThreadId,
        mockCommentId,
        mockReplyId,
        mockOwnerId
      )
    ).rejects.toThrowError(AuthorizationError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(
      mockReplyRepository.verifyAvailableReplyInComment
    ).toHaveBeenCalledWith(mockReplyId, mockCommentId);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      mockReplyId,
      mockOwnerId
    );
    expect(mockReplyRepository.deleteReplyById).not.toHaveBeenCalled();
  });
});
