const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const { nanoid } = require("nanoid");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  let testUserId;
  let testThreadId;
  let testCommentId;
  let anotherUserId;

  beforeEach(async () => {
    testUserId = `user-owner-${nanoid(5)}`;
    anotherUserId = `user-another-${nanoid(5)}`;
    await UsersTableTestHelper.addUser({
      id: testUserId,
      username: `owner${nanoid(3)}`,
    });
    await UsersTableTestHelper.addUser({
      id: anotherUserId,
      username: `another${nanoid(3)}`,
    });

    testThreadId = `thread-${nanoid(5)}`;
    await ThreadsTableTestHelper.addThread({
      id: testThreadId,
      owner: testUserId,
    });

    testCommentId = `comment-${nanoid(5)}`;
    await CommentsTableTestHelper.addComment({
      id: testCommentId,
      threadId: testThreadId,
      owner: testUserId,
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist new reply and return added reply correctly", async () => {
      // Arrange
      const newReplyPayload = new NewReply({
        content: "Ini adalah balasan integration test.",
      });
      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(
        newReplyPayload,
        testUserId,
        testCommentId,
        testThreadId
      );

      // Assert
      const repliesInDb = await RepliesTableTestHelper.findReplyById(
        "reply-123"
      );
      expect(repliesInDb).toHaveLength(1);
      expect(repliesInDb[0].content).toBe(newReplyPayload.content);
      expect(repliesInDb[0].user_id).toBe(testUserId);
      expect(repliesInDb[0].comment_id).toBe(testCommentId);
      expect(repliesInDb[0].thread_id).toBe(testThreadId);
      expect(repliesInDb[0].is_delete).toBe(false);

      expect(addedReply).toBeInstanceOf(AddedReply);
      expect(addedReply.id).toEqual("reply-123");
      expect(addedReply.content).toEqual(newReplyPayload.content);
      expect(addedReply.owner).toEqual(testUserId);
    });
  });

  describe("getRepliesByCommentIds function", () => {
    it("should return an empty array if commentIds is null", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(
        null
      );
      expect(replies).toBeInstanceOf(Array);
      expect(replies).toHaveLength(0);
    });

    it("should return an empty array if commentIds is undefined", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(
        undefined
      );
      expect(replies).toBeInstanceOf(Array);
      expect(replies).toHaveLength(0);
    });

    it("should return an empty array if commentIds array is empty", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([]);
      expect(replies).toBeInstanceOf(Array);
      expect(replies).toHaveLength(0);
    });

    it("should return replies for the given comment IDs, ordered by date ascending, with all fields", async () => {
      // Nama tes diperjelas
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);

      const usernameTestUser = (
        await UsersTableTestHelper.findUsersById(testUserId)
      )[0].username;
      const usernameAnotherUser = (
        await UsersTableTestHelper.findUsersById(anotherUserId)
      )[0].username;

      const dateReply1 = new Date(Date.now() - 30000); // Paling lama
      const dateReply2 = new Date(Date.now() - 10000); // Paling baru
      const dateReply3 = new Date(Date.now() - 20000); // Di tengah

      const commentId2 = `comment2-${nanoid(5)}`;
      await CommentsTableTestHelper.addComment({
        id: commentId2,
        threadId: testThreadId,
        owner: anotherUserId,
      });

      // Balasan untuk testCommentId
      await RepliesTableTestHelper.addReply({
        id: "reply-tc1-r1",
        commentId: testCommentId,
        threadId: testThreadId,
        owner: testUserId,
        content: "Balasan pertama untuk komen test",
        date: dateReply1.toISOString(),
        isDelete: false,
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-tc1-r2",
        commentId: testCommentId,
        threadId: testThreadId,
        owner: anotherUserId,
        content: "Balasan kedua untuk komen test (dihapus)",
        date: dateReply3.toISOString(),
        isDelete: true,
      });

      // Balasan untuk commentId2
      await RepliesTableTestHelper.addReply({
        id: "reply-c2-r1",
        commentId: commentId2,
        threadId: testThreadId,
        owner: testUserId,
        content: "Balasan untuk komen kedua",
        date: dateReply2.toISOString(),
        isDelete: false,
      });

      // Action
      const fetchedReplies =
        await replyRepositoryPostgres.getRepliesByCommentIds([
          testCommentId,
          commentId2,
        ]);

      // Assert
      expect(fetchedReplies).toHaveLength(3); // Total 3 balasan untuk kedua commentId

      // Verifikasi balasan untuk testCommentId (seharusnya ada 2 dan terurut)
      const repliesForTestCommentId = fetchedReplies.filter(
        (r) => r.comment_id === testCommentId
      );
      expect(repliesForTestCommentId).toHaveLength(2);

      expect(repliesForTestCommentId[0].id).toEqual("reply-tc1-r1");
      expect(repliesForTestCommentId[0].username).toEqual(usernameTestUser);
      expect(repliesForTestCommentId[0].content).toEqual(
        "Balasan pertama untuk komen test"
      );
      expect(new Date(repliesForTestCommentId[0].date).getTime()).toEqual(
        dateReply1.getTime()
      );
      expect(repliesForTestCommentId[0].is_delete).toBe(false);
      expect(repliesForTestCommentId[0].comment_id).toEqual(testCommentId);

      expect(repliesForTestCommentId[1].id).toEqual("reply-tc1-r2");
      expect(repliesForTestCommentId[1].username).toEqual(usernameAnotherUser);
      expect(repliesForTestCommentId[1].content).toEqual(
        "Balasan kedua untuk komen test (dihapus)"
      );
      expect(new Date(repliesForTestCommentId[1].date).getTime()).toEqual(
        dateReply3.getTime()
      );
      expect(repliesForTestCommentId[1].is_delete).toBe(true);
      expect(repliesForTestCommentId[1].comment_id).toEqual(testCommentId);

      // Verifikasi balasan untuk commentId2 (seharusnya ada 1)
      const repliesForCommentId2 = fetchedReplies.filter(
        (r) => r.comment_id === commentId2
      );
      expect(repliesForCommentId2).toHaveLength(1);
      expect(repliesForCommentId2[0].id).toEqual("reply-c2-r1");
      expect(repliesForCommentId2[0].username).toEqual(usernameTestUser);
      expect(repliesForCommentId2[0].content).toEqual(
        "Balasan untuk komen kedua"
      );
      expect(new Date(repliesForCommentId2[0].date).getTime()).toEqual(
        dateReply2.getTime()
      );
      expect(repliesForCommentId2[0].is_delete).toBe(false);
      expect(repliesForCommentId2[0].comment_id).toEqual(commentId2);

      // Verifikasi urutan global berdasarkan tanggal (karena query di repository sudah ORDER BY date ASC)
      expect(new Date(fetchedReplies[0].date).getTime()).toEqual(
        dateReply1.getTime()
      ); // reply-tc1-r1
      expect(new Date(fetchedReplies[1].date).getTime()).toEqual(
        dateReply3.getTime()
      ); // reply-tc1-r2
      expect(new Date(fetchedReplies[2].date).getTime()).toEqual(
        dateReply2.getTime()
      ); // reply-c2-r1
    });
  });

  describe("verifyAvailableReplyInComment function", () => {
    it("should throw NotFoundError when reply is not found in the specified comment or is deleted", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      const nonExistentReplyId = "reply-xxx";
      await expect(
        replyRepositoryPostgres.verifyAvailableReplyInComment(
          nonExistentReplyId,
          testCommentId
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when reply is available in the specified comment and not deleted", async () => {
      const replyId = "reply-verifyavail";
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId: testCommentId,
        threadId: testThreadId,
        owner: testUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      await expect(
        replyRepositoryPostgres.verifyAvailableReplyInComment(
          replyId,
          testCommentId
        )
      ).resolves.not.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if reply exists but is marked as deleted", async () => {
      const replyId = "reply-isdeleted";
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId: testCommentId,
        threadId: testThreadId,
        owner: testUserId,
        isDelete: true,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      await expect(
        replyRepositoryPostgres.verifyAvailableReplyInComment(
          replyId,
          testCommentId
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if reply exists but in a different comment", async () => {
      const anotherCommentId = `comment-another-${nanoid(5)}`;
      await CommentsTableTestHelper.addComment({
        id: anotherCommentId,
        threadId: testThreadId,
        owner: testUserId,
      });
      const replyId = "reply-diffcomment";
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId: anotherCommentId,
        threadId: testThreadId,
        owner: testUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      await expect(
        replyRepositoryPostgres.verifyAvailableReplyInComment(
          replyId,
          testCommentId
        )
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("verifyReplyOwner function", () => {
    let replyIdOwnedByTestUser;
    beforeEach(async () => {
      replyIdOwnedByTestUser = `reply-owner-${nanoid(5)}`;
      await RepliesTableTestHelper.addReply({
        id: replyIdOwnedByTestUser,
        commentId: testCommentId,
        threadId: testThreadId,
        owner: testUserId,
      });
    });

    it("should not throw AuthorizationError when user is the owner of the reply", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(
          replyIdOwnedByTestUser,
          testUserId
        )
      ).resolves.not.toThrowError(AuthorizationError);
    });

    it("should throw AuthorizationError when user is not the owner of the reply", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(
          replyIdOwnedByTestUser,
          anotherUserId
        )
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should throw NotFoundError if reply does not exist (for safety in verifyReplyOwner)", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      const nonExistentReplyId = "reply-nonexistent-ownercheck";
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(nonExistentReplyId, testUserId)
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("deleteReplyById function", () => {
    it("should soft delete the reply (set is_delete to true)", async () => {
      const replyId = "reply-todelete";
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId: testCommentId,
        threadId: testThreadId,
        owner: testUserId,
        isDelete: false,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      await replyRepositoryPostgres.deleteReplyById(replyId);
      const replies = await RepliesTableTestHelper.findReplyById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toBe(true);
    });

    it("should throw NotFoundError if reply to delete is not found", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, nanoid);
      const nonExistentReplyId = "reply-nonexistent-delete";
      await expect(
        replyRepositoryPostgres.deleteReplyById(nonExistentReplyId)
      ).rejects.toThrowError(NotFoundError);
    });
  });
});
