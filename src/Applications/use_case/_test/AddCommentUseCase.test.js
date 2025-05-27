// src/Applications/use_case/_test/AddCommentUseCase.test.js

const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddCommentUseCase = require("../AddCommentUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("AddCommentUseCase", () => {
  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "Ini adalah isi komentar.",
    };
    const mockOwnerId = "user-123";
    const mockThreadId = "thread-123";

    const dataForMockReturn = {
      id: "comment-xyz456", // ID unik dari mock repository
      content: useCasePayload.content,
      owner: mockOwnerId,
    };

    const expectedAddedComment = new AddedComment({
      id: dataForMockReturn.id,
      content: dataForMockReturn.content,
      owner: dataForMockReturn.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedComment({
          // Membuat instance baru di sini
          id: dataForMockReturn.id,
          content: dataForMockReturn.content,
          owner: dataForMockReturn.owner,
        })
      )
    );

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const actualAddedComment = await addCommentUseCase.execute(
      useCasePayload,
      mockOwnerId,
      mockThreadId
    );

    // Assert
    expect(actualAddedComment).toStrictEqual(expectedAddedComment); 
    expect(actualAddedComment).toBeInstanceOf(AddedComment); 

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      new NewComment({
        content: useCasePayload.content,
      }),
      mockOwnerId,
      mockThreadId
    );
  });

  it("should throw NotFoundError if thread is not available", async () => {
    // Arrange
    const useCasePayload = { content: "Komentar gagal" };
    const mockOwnerId = "user-123";
    const mockThreadId = "thread-tidak-ada";

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("THREAD_NOT_FOUND"))
      );

    mockCommentRepository.addComment = jest.fn(); 

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addCommentUseCase.execute(useCasePayload, mockOwnerId, mockThreadId)
    ).rejects.toThrowError(NotFoundError);

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(mockCommentRepository.addComment).not.toHaveBeenCalled();
  });
});
