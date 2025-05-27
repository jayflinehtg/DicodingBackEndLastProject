const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const DetailComment = require("../../../Domains/comments/entities/DetailComment");
const DetailThread = require("../../../Domains/threads/entities/DetailThread");
const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const DetailReply = require("../../../Domains/replies/entities/DetailReply");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrate the get thread detail action correctly with comments and replies", async () => {
    // Arrange
    const mockThreadId = "thread-123";

    const mockThreadData = {
      id: mockThreadId,
      title: "Judul Thread Test",
      body: "Isi body thread test.",
      date: new Date("2023-01-01T10:00:00.000Z"),
      username: "userPemilikThread",
    };

    const mockRawComments = [
      {
        id: "comment-001",
        username: "userKomentar1",
        date: new Date("2023-01-01T10:05:00.000Z"),
        content: "Ini komentar pertama.",
        is_delete: false,
      },
      {
        id: "comment-002",
        username: "userKomentar2",
        date: new Date("2023-01-01T10:10:00.000Z"),
        content: "Ini komentar kedua yang sudah dihapus.",
        is_delete: true,
      },
    ];

    const mockRawReplies = [
      {
        id: "reply-c1-001",
        comment_id: "comment-001",
        username: "userBalasan1",
        date: new Date("2023-01-01T10:06:00.000Z"),
        content: "Ini balasan pertama untuk comment-001.",
        is_delete: false,
      },
      {
        id: "reply-c1-002",
        comment_id: "comment-001",
        username: "userBalasan2",
        date: new Date("2023-01-01T10:07:00.000Z"),
        content: "Balasan ini sudah dihapus.",
        is_delete: true,
      },
    ];

    const expectedDetailRepliesForComment1 = [
      new DetailReply({
        id: "reply-c1-001",
        username: "userBalasan1",
        date: new Date("2023-01-01T10:06:00.000Z"),
        content: "Ini balasan pertama untuk comment-001.",
        isDelete: false,
      }),
      new DetailReply({
        id: "reply-c1-002",
        username: "userBalasan2",
        date: new Date("2023-01-01T10:07:00.000Z"),
        content: "**balasan telah dihapus**",
        isDelete: true,
      }),
    ];

    const expectedProcessedComments = [
      new DetailComment({
        id: "comment-001",
        username: "userKomentar1",
        date: new Date("2023-01-01T10:05:00.000Z"),
        content: "Ini komentar pertama.",
        isDelete: false,
        replies: expectedDetailRepliesForComment1,
      }),
      new DetailComment({
        id: "comment-002",
        username: "userKomentar2",
        date: new Date("2023-01-01T10:10:00.000Z"),
        content: "**komentar telah dihapus**",
        isDelete: true,
        replies: [],
      }),
    ];

    const expectedDetailThreadInstance = new DetailThread({
      id: mockThreadData.id,
      title: mockThreadData.title,
      body: mockThreadData.body,
      date: mockThreadData.date,
      username: mockThreadData.username,
      comments: expectedProcessedComments,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(mockThreadData);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(mockRawComments);
    mockReplyRepository.getRepliesByCommentIds = jest
      .fn()
      .mockResolvedValue(mockRawReplies);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const actualDetailThread = await getThreadDetailUseCase.execute(
      mockThreadId
    );

    // Assert
    expect(actualDetailThread).toBeInstanceOf(DetailThread);
    expect(actualDetailThread.id).toEqual(expectedDetailThreadInstance.id);
    expect(actualDetailThread.title).toEqual(
      expectedDetailThreadInstance.title
    );
    expect(actualDetailThread.body).toEqual(expectedDetailThreadInstance.body);
    expect(actualDetailThread.date).toEqual(expectedDetailThreadInstance.date);
    expect(actualDetailThread.username).toEqual(
      expectedDetailThreadInstance.username
    );

    expect(actualDetailThread.comments).toHaveLength(
      expectedProcessedComments.length
    );
    actualDetailThread.comments.forEach((comment, index) => {
      const expectedComment = expectedProcessedComments[index];
      expect(comment.id).toEqual(expectedComment.id);
      expect(comment.username).toEqual(expectedComment.username);
      expect(comment.date).toEqual(expectedComment.date);
      expect(comment.content).toEqual(expectedComment.content);

      expect(comment.replies).toHaveLength(expectedComment.replies.length);
      comment.replies.forEach((reply, replyIndex) => {
        const expectedReply = expectedComment.replies[replyIndex];
        expect(reply.id).toEqual(expectedReply.id);
        expect(reply.username).toEqual(expectedReply.username);
        expect(reply.date).toEqual(expectedReply.date);
        expect(reply.content).toEqual(expectedReply.content);
      });
    });

    expect(actualDetailThread).toStrictEqual(expectedDetailThreadInstance);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      mockThreadId
    );
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      mockThreadId
    );
    if (mockRawComments.length > 0) {
      expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(
        mockRawComments.map((c) => c.id)
      );
    } else {
      expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
    }
  });

  it("should orchestrate the get thread detail action correctly when no comments", async () => {
    const mockThreadId = "thread-no-comments";
    const mockThreadData = {
      id: mockThreadId,
      title: "Thread Tanpa Komentar",
      body: "Isi.",
      date: new Date(),
      username: "userX",
    };
    const mockRawCommentsEmpty = [];
    const mockRawRepliesEmpty = [];

    const expectedDetailThreadInstance = new DetailThread({
      id: mockThreadData.id,
      title: mockThreadData.title,
      body: mockThreadData.body,
      date: mockThreadData.date,
      username: mockThreadData.username,
      comments: [],
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(mockThreadData);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(mockRawCommentsEmpty);
    mockReplyRepository.getRepliesByCommentIds = jest
      .fn()
      .mockResolvedValue(mockRawRepliesEmpty);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const actualDetailThread = await getThreadDetailUseCase.execute(
      mockThreadId
    );
    expect(actualDetailThread).toStrictEqual(expectedDetailThreadInstance);
    expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if thread is not found", async () => {
    const mockThreadId = "thread-tidak-ada";
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("THREAD_NOT_FOUND"))
      );
    mockCommentRepository.getCommentsByThreadId = jest.fn();
    mockReplyRepository.getRepliesByCommentIds = jest.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(
      getThreadDetailUseCase.execute(mockThreadId)
    ).rejects.toThrowError(NotFoundError);
  });
});
