// src/Infrastructures/repository/_test/CommentRepositoryPostgres.test.js

const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const { nanoid } = require("nanoid");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  let testUserId;
  let testThreadId;
  let userDicodingId; // User tambahan untuk variasi komentar di getCommentsByThreadId

  beforeEach(async () => {
    testUserId = `user-${nanoid(5)}`;
    userDicodingId = `user-dicoding-${nanoid(5)}`;

    await UsersTableTestHelper.addUser({
      id: testUserId,
      username: `user${nanoid(3)}`,
      password: "password123",
      fullname: "Test User Comment",
    });
    await UsersTableTestHelper.addUser({
      id: userDicodingId,
      username: "dicoding",
      password: "password123",
      fullname: "Dicoding User Test",
    });

    testThreadId = `thread-${nanoid(5)}`;
    await ThreadsTableTestHelper.addThread({
      id: testThreadId,
      title: "Test Thread for Comments",
      body: "This is a test thread.",
      owner: testUserId,
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist new comment and return added comment correctly", async () => {
      const newCommentPayload = new NewComment({
        content: "Ini adalah komentar integration test.",
      });
      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const addedComment = await commentRepositoryPostgres.addComment(
        newCommentPayload,
        testUserId,
        testThreadId
      );
      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe(newCommentPayload.content);
      expect(comments[0].user_id).toBe(testUserId);
      expect(comments[0].thread_id).toBe(testThreadId);
      expect(comments[0].is_delete).toBe(false);
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toBe("comment-123");
      expect(addedComment.content).toBe(newCommentPayload.content);
      expect(addedComment.owner).toBe(testUserId);
    });
  });

  describe("verifyAvailableCommentInThread function", () => {
    it("should throw NotFoundError when comment is not found in thread or is deleted", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      const nonExistentCommentId = "comment-xxx";
      await expect(
        commentRepositoryPostgres.verifyAvailableCommentInThread(
          nonExistentCommentId,
          testThreadId
        )
      ).rejects.toThrowError(NotFoundError);
      await expect(
        commentRepositoryPostgres.verifyAvailableCommentInThread(
          nonExistentCommentId,
          testThreadId
        )
      ).rejects.toThrowError(
        "komentar tidak ditemukan di thread ini atau sudah dihapus"
      );
    });

    it("should not throw NotFoundError when comment is available and not deleted", async () => {
      const commentId = "comment-testverify";
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: testThreadId,
        owner: testUserId,
        content: "Komentar untuk verifikasi",
        isDelete: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      await expect(
        commentRepositoryPostgres.verifyAvailableCommentInThread(
          commentId,
          testThreadId
        )
      ).resolves.not.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if comment exists but is marked as deleted", async () => {
      const commentId = "comment-deleted";
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: testThreadId,
        owner: testUserId,
        content: "Komentar yang sudah dihapus",
        isDelete: true,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      await expect(
        commentRepositoryPostgres.verifyAvailableCommentInThread(
          commentId,
          testThreadId
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if comment exists but in different thread", async () => {
      const anotherThreadId = `thread-${nanoid(5)}`;
      await ThreadsTableTestHelper.addThread({
        id: anotherThreadId,
        owner: testUserId,
      });
      const commentId = "comment-otherthead";
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: anotherThreadId,
        owner: testUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      await expect(
        commentRepositoryPostgres.verifyAvailableCommentInThread(
          commentId,
          testThreadId
        )
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("verifyCommentOwner function", () => {
    let commentId;
    beforeEach(async () => {
      commentId = `comment-ownercheck-${nanoid(3)}`;
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: testThreadId,
        owner: testUserId,
        content: "Komentar untuk cek pemilik",
      });
    });

    it("should not throw AuthorizationError when user is the owner", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, testUserId)
      ).resolves.not.toThrowError(AuthorizationError);
    });

    it("should throw AuthorizationError when user is not the owner", async () => {
      const notOwnerId = "user-notowner";
      await UsersTableTestHelper.addUser({
        id: notOwnerId,
        username: "notowner",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, notOwnerId)
      ).rejects.toThrowError(AuthorizationError);
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, notOwnerId)
      ).rejects.toThrowError("anda tidak berhak mengakses resource ini");
    });

    it("should throw NotFoundError if comment does not exist (for safety)", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      const nonExistentCommentId = "comment-xxx-owner";
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(
          nonExistentCommentId,
          testUserId
        )
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("deleteCommentById function", () => {
    it("should soft delete the comment (set is_delete to true)", async () => {
      const commentId = "comment-todelete";
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: testThreadId,
        owner: testUserId,
        content: "Komentar yang akan dihapus",
        isDelete: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      await commentRepositoryPostgres.deleteCommentById(commentId);
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBe(true);
    });

    it("should throw NotFoundError if comment to delete is not found", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      const nonExistentCommentId = "comment-xxx-delete";
      await expect(
        commentRepositoryPostgres.deleteCommentById(nonExistentCommentId)
      ).rejects.toThrowError(NotFoundError);
      await expect(
        commentRepositoryPostgres.deleteCommentById(nonExistentCommentId)
      ).rejects.toThrowError("komentar gagal dihapus. Id tidak ditemukan");
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return an empty array if thread has no comments", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        testThreadId
      );
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(0);
    });

    it("should return all comments for a thread with correct details and order", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        nanoid
      );
      const usernameTestUser = (
        await UsersTableTestHelper.findUsersById(testUserId)
      )[0].username;
      const usernameDicodingUser = (
        await UsersTableTestHelper.findUsersById(userDicodingId)
      )[0].username;

      const date1 = new Date("2023-01-01T10:00:00.000Z");
      const date2 = new Date("2023-01-01T10:05:00.000Z");
      const date3 = new Date("2023-01-01T10:02:00.000Z");

      await CommentsTableTestHelper.addComment({
        id: "comment-001",
        threadId: testThreadId,
        owner: testUserId,
        content: "Komentar pertama",
        date: date1.toISOString(),
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-003",
        threadId: testThreadId,
        owner: userDicodingId,
        content: "Komentar ketiga",
        date: date3.toISOString(),
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-002",
        threadId: testThreadId,
        owner: testUserId,
        content: "Komentar kedua (dihapus)",
        date: date2.toISOString(),
        isDelete: true,
      });

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        testThreadId
      );

      expect(comments).toHaveLength(3);

      // === PERBAIKAN PERBANDINGAN TANGGAL ===
      expect(comments[0].id).toEqual("comment-001");
      expect(comments[0].username).toEqual(usernameTestUser);
      expect(new Date(comments[0].date).getTime()).toEqual(date1.getTime());
      expect(comments[0].content).toEqual("Komentar pertama");
      expect(comments[0].is_delete).toBe(false);

      expect(comments[1].id).toEqual("comment-003");
      expect(comments[1].username).toEqual(usernameDicodingUser);
      expect(new Date(comments[1].date).getTime()).toEqual(date3.getTime());
      expect(comments[1].content).toEqual("Komentar ketiga");
      expect(comments[1].is_delete).toBe(false);

      expect(comments[2].id).toEqual("comment-002");
      expect(comments[2].username).toEqual(usernameTestUser);
      expect(new Date(comments[2].date).getTime()).toEqual(date2.getTime());
      expect(comments[2].content).toEqual("Komentar kedua (dihapus)");
      expect(comments[2].is_delete).toBe(true);
    });
  });
});
