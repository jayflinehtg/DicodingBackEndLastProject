// src/Applications/use_case/_test/DeleteCommentUseCase.test.js

const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("DeleteCommentUseCase", () => {
  it("should orchestrate the delete comment action correctly", async () => {
    // Arrange
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-123";
    const mockOwnerId = "user-123";

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed functions */
    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(
      mockThreadId,
      mockCommentId,
      mockOwnerId
    );

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      mockCommentId,
      mockOwnerId
    );
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(
      mockCommentId
    );
  });

  it("should throw NotFoundError if thread is not available", async () => {
    // Arrange
    const mockThreadId = "thread-not-found";
    const mockCommentId = "comment-123";
    const mockOwnerId = "user-123";

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("THREAD_NOT_FOUND"))
      );
    // Inisialisasi mock lain agar bisa dicek .not.toHaveBeenCalled()
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn();
    mockCommentRepository.verifyCommentOwner = jest.fn();
    mockCommentRepository.deleteCommentById = jest.fn();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(mockThreadId, mockCommentId, mockOwnerId)
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).not.toHaveBeenCalled();
    expect(mockCommentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(mockCommentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if comment is not available in thread", async () => {
    // Arrange
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-not-found";
    const mockOwnerId = "user-123";

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
    // Inisialisasi mock lain
    mockCommentRepository.verifyCommentOwner = jest.fn();
    mockCommentRepository.deleteCommentById = jest.fn();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(mockThreadId, mockCommentId, mockOwnerId)
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(mockCommentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(mockCommentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it("should throw AuthorizationError if user is not the owner of the comment", async () => {
    // Arrange
    const mockThreadId = "thread-123";
    const mockCommentId = "comment-123";
    const mockOwnerId = "user-not-owner"; // User yang bukan pemilik

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new AuthorizationError("NOT_COMMENT_OWNER"))
      );
    // Inisialisasi mock lain
    mockCommentRepository.deleteCommentById = jest.fn();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(mockThreadId, mockCommentId, mockOwnerId)
    ).rejects.toThrowError(AuthorizationError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(
      mockCommentRepository.verifyAvailableCommentInThread
    ).toHaveBeenCalledWith(mockCommentId, mockThreadId);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      mockCommentId,
      mockOwnerId
    );
    expect(mockCommentRepository.deleteCommentById).not.toHaveBeenCalled();
  });
});
