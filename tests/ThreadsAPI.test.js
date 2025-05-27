// tests/ThreadsAPI.test.js

const pool = require("../src/Infrastructures/database/postgres/pool");
const UsersTableTestHelper = require("./UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("./AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("./ThreadsTableTestHelper");
const CommentsTableTestHelper = require("./CommentsTableTestHelper");
const RepliesTableTestHelper = require("./RepliesTableTestHelper"); // Helper untuk balasan
const container = require("../src/Infrastructures/container");
const createServer = require("../src/Infrastructures/http/createServer");

describe("/threads endpoint", () => {
  // Menggunakan nama describe dari kode Anda
  let server;
  let accessTokenPrimaryUser;
  let primaryUserId;
  let accessTokenSecondaryUser;
  let secondaryUserId;

  beforeAll(async () => {
    server = await createServer(container);
    await server.initialize();

    primaryUserId = "user-test123";
    await UsersTableTestHelper.addUser({
      id: primaryUserId,
      username: "usertest",
      password: "password123",
      fullname: "User Test",
    });
    const loginResponsePrimary = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "usertest", password: "password123" },
    });
    accessTokenPrimaryUser = JSON.parse(loginResponsePrimary.payload).data
      .accessToken;

    secondaryUserId = "user-other456";
    await UsersTableTestHelper.addUser({
      id: secondaryUserId,
      username: "otheruser",
      password: "password456",
      fullname: "Other User",
    });
    const loginResponseSecondary = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "otheruser", password: "password456" },
    });
    accessTokenSecondaryUser = JSON.parse(loginResponseSecondary.payload).data
      .accessToken;
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
    await server.stop();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and persisted thread when request payload is valid", async () => {
      const requestPayload = {
        title: "Judul Thread E2E",
        body: "Ini adalah body dari thread E2E.",
      };
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenPrimaryUser}`,
        },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseBody.status).toEqual("success");
      expect(responseBody.data.addedThread).toBeDefined();
      expect(responseBody.data.addedThread.id).toBeDefined();
      expect(responseBody.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseBody.data.addedThread.owner).toEqual(primaryUserId);
      const threads = await ThreadsTableTestHelper.findThreadById(
        responseBody.data.addedThread.id
      );
      expect(threads).toHaveLength(1);
    });

    it("should response 400 when request payload not contain needed property", async () => {
      const requestPayload = { title: "Judul Thread E2E" };
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseBody.status).toEqual("fail");
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      const requestPayload = { title: 123, body: "Body" };
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseBody.status).toEqual("fail");
    });

    it("should response 401 when request missing authentication", async () => {
      const requestPayload = { title: "Judul", body: "Body" };
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseBody.message).toEqual("Missing authentication");
    });
  });

  describe("when POST /threads/{threadId}/comments", () => {
    let testThreadId;
    beforeEach(async () => {
      const threadPayload = {
        title: "Thread untuk Komentar",
        body: "Ini body thread.",
      };
      const responseThread = await server.inject({
        method: "POST",
        url: "/threads",
        payload: threadPayload,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBodyThread = JSON.parse(responseThread.payload);
      testThreadId = responseBodyThread.data.addedThread.id;
    });

    it("should response 201 and persisted comment when request is valid", async () => {
      const requestPayload = {
        content: "Ini adalah komentar pertama yang valid.",
      };
      const response = await server.inject({
        method: "POST",
        url: `/threads/${testThreadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenPrimaryUser}`,
        },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseBody.status).toEqual("success");
      expect(responseBody.data.addedComment).toBeDefined();
      expect(responseBody.data.addedComment.owner).toEqual(primaryUserId);
      const comments = await CommentsTableTestHelper.findCommentById(
        responseBody.data.addedComment.id
      );
      expect(comments).toHaveLength(1);
    });

    it("should response 400 when request payload is invalid (missing content)", async () => {
      const requestPayload = {};
      const response = await server.inject({
        method: "POST",
        url: `/threads/${testThreadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseBody.status).toEqual("fail");
    });

    it("should response 400 when request payload has invalid data type", async () => {
      const requestPayload = { content: 12345 };
      const response = await server.inject({
        method: "POST",
        url: `/threads/${testThreadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseBody.status).toEqual("fail");
    });

    it("should response 404 when threadId is not found", async () => {
      const nonExistentThreadId = "thread-tidakada";
      const requestPayload = { content: "Komentar." };
      const response = await server.inject({
        method: "POST",
        url: `/threads/${nonExistentThreadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseBody.status).toEqual("fail");
    });

    it("should response 401 when request missing authentication", async () => {
      const requestPayload = { content: "Komentar." };
      const response = await server.inject({
        method: "POST",
        url: `/threads/${testThreadId}/comments`,
        payload: requestPayload,
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseBody.message).toEqual("Missing authentication");
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    let existingThreadId;
    let commentOwnedByPrimaryUser;
    let commentOwnedBySecondaryUser;

    beforeEach(async () => {
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: { title: "Thread untuk Hapus Komentar", body: "Isi thread." },
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      existingThreadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      const comment1Response = await server.inject({
        method: "POST",
        url: `/threads/${existingThreadId}/comments`,
        payload: { content: "Komentar milik primary user" },
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      commentOwnedByPrimaryUser = JSON.parse(comment1Response.payload).data
        .addedComment.id;

      const comment2Response = await server.inject({
        method: "POST",
        url: `/threads/${existingThreadId}/comments`,
        payload: { content: "Komentar milik secondary user" },
        headers: { Authorization: `Bearer ${accessTokenSecondaryUser}` },
      });
      commentOwnedBySecondaryUser = JSON.parse(comment2Response.payload).data
        .addedComment.id;
    });

    it("should response 200 and soft delete comment when user is the owner", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${existingThreadId}/comments/${commentOwnedByPrimaryUser}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseBody.status).toEqual("success");
      const comments = await CommentsTableTestHelper.findCommentById(
        commentOwnedByPrimaryUser
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBe(true);
    });

    it("should response 403 when user is not the owner of the comment", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${existingThreadId}/comments/${commentOwnedBySecondaryUser}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual(
        "anda tidak berhak mengakses resource ini"
      );
    });

    it("should response 404 when commentId is not found", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${existingThreadId}/comments/comment-tidakada`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual(
        "komentar tidak ditemukan di thread ini atau sudah dihapus"
      );
    });

    it("should response 404 when threadId is not found", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-tidakada/comments/${commentOwnedByPrimaryUser}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual("thread tidak ditemukan");
    });

    it("should response 401 when request missing authentication", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${existingThreadId}/comments/${commentOwnedByPrimaryUser}`,
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseBody.message).toEqual("Missing authentication");
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    let threadIdForDeleteReply;
    let commentIdForDeleteReply;
    let replyOwnedByPrimaryUser;
    let replyOwnedBySecondaryUser;

    beforeEach(async () => {
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: { title: "Thread untuk Hapus Balasan", body: "Isi thread." },
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      threadIdForDeleteReply = JSON.parse(threadResponse.payload).data
        .addedThread.id;

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${threadIdForDeleteReply}/comments`,
        payload: { content: "Komentar untuk balasan yang akan dihapus" },
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      commentIdForDeleteReply = JSON.parse(commentResponse.payload).data
        .addedComment.id;

      const reply1Response = await server.inject({
        method: "POST",
        url: `/threads/${threadIdForDeleteReply}/comments/${commentIdForDeleteReply}/replies`,
        payload: { content: "Balasan milik primary user" },
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      replyOwnedByPrimaryUser = JSON.parse(reply1Response.payload).data
        .addedReply.id;

      const reply2Response = await server.inject({
        method: "POST",
        url: `/threads/${threadIdForDeleteReply}/comments/${commentIdForDeleteReply}/replies`,
        payload: { content: "Balasan milik secondary user" },
        headers: { Authorization: `Bearer ${accessTokenSecondaryUser}` },
      });
      replyOwnedBySecondaryUser = JSON.parse(reply2Response.payload).data
        .addedReply.id;
    });

    it("should response 200 and soft delete reply when user is the owner", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadIdForDeleteReply}/comments/${commentIdForDeleteReply}/replies/${replyOwnedByPrimaryUser}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseBody.status).toEqual("success");
      const replies = await RepliesTableTestHelper.findReplyById(
        replyOwnedByPrimaryUser
      );
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toBe(true);
    });

    it("should response 403 when user is not the owner of the reply", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadIdForDeleteReply}/comments/${commentIdForDeleteReply}/replies/${replyOwnedBySecondaryUser}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual(
        "anda tidak berhak mengakses resource ini (balasan)"
      );
    });

    it("should response 404 when replyId is not found", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadIdForDeleteReply}/comments/${commentIdForDeleteReply}/replies/reply-tidakada`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual(
        "balasan tidak ditemukan di komentar ini atau sudah dihapus"
      );
    });

    it("should response 404 when commentId is not found", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadIdForDeleteReply}/comments/comment-tidakada/replies/${replyOwnedByPrimaryUser}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual(
        "komentar tidak ditemukan di thread ini atau sudah dihapus"
      );
    });

    it("should response 404 when threadId is not found", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-tidakada/comments/${commentIdForDeleteReply}/replies/${replyOwnedByPrimaryUser}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual("thread tidak ditemukan");
    });

    it("should response 401 when request missing authentication", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadIdForDeleteReply}/comments/${commentIdForDeleteReply}/replies/${replyOwnedByPrimaryUser}`,
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseBody.message).toEqual("Missing authentication");
    });
  });

  describe("when GET /threads/{threadId}", () => {
    let testThreadId;
    let commentId1, commentId2, commentId3;
    let dateComment1, dateComment2, dateComment3;

    beforeEach(async () => {
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Detail Test",
          body: "Ini adalah isi thread untuk detail.",
        },
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      const threadResponseBody = JSON.parse(threadResponse.payload);
      testThreadId = threadResponseBody.data.addedThread.id;

      dateComment1 = new Date(Date.now() - 20000);
      const commentPayload1 = { content: "Komentar pertama (paling lama)" };
      const commentResponse1 = await server.inject({
        method: "POST",
        url: `/threads/${testThreadId}/comments`,
        payload: commentPayload1,
        headers: { Authorization: `Bearer ${accessTokenSecondaryUser}` },
      });
      commentId1 = JSON.parse(commentResponse1.payload).data.addedComment.id;
      await pool.query("UPDATE comments SET date = $1 WHERE id = $2", [
        dateComment1.toISOString(),
        commentId1,
      ]);

      dateComment2 = new Date(Date.now() - 10000);
      const commentPayload2 = { content: "Komentar kedua (akan dihapus)" };
      const commentResponse2 = await server.inject({
        method: "POST",
        url: `/threads/${testThreadId}/comments`,
        payload: commentPayload2,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });
      commentId2 = JSON.parse(commentResponse2.payload).data.addedComment.id;
      await pool.query("UPDATE comments SET date = $1 WHERE id = $2", [
        dateComment2.toISOString(),
        commentId2,
      ]);
      await server.inject({
        method: "DELETE",
        url: `/threads/${testThreadId}/comments/${commentId2}`,
        headers: { Authorization: `Bearer ${accessTokenPrimaryUser}` },
      });

      dateComment3 = new Date(Date.now() - 5000);
      const commentPayload3 = { content: "Komentar ketiga (paling baru)" };
      const commentResponse3 = await server.inject({
        method: "POST",
        url: `/threads/${testThreadId}/comments`,
        payload: commentPayload3,
        headers: { Authorization: `Bearer ${accessTokenSecondaryUser}` },
      });
      commentId3 = JSON.parse(commentResponse3.payload).data.addedComment.id;
      await pool.query("UPDATE comments SET date = $1 WHERE id = $2", [
        dateComment3.toISOString(),
        commentId3,
      ]);
    });

    it("should response 200 and return thread details with comments correctly sorted and formatted", async () => {
      const response = await server.inject({
        method: "GET",
        url: `/threads/${testThreadId}`,
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseBody.status).toEqual("success");
      expect(responseBody.data.thread).toBeDefined();

      const { thread } = responseBody.data;
      expect(thread.id).toEqual(testThreadId);
      expect(thread.title).toEqual("Thread Detail Test");
      expect(thread.body).toEqual("Ini adalah isi thread untuk detail.");
      expect(thread.username).toEqual("usertest");
      expect(thread.date).toBeDefined();

      expect(thread.comments).toBeInstanceOf(Array);
      expect(thread.comments).toHaveLength(3);

      expect(thread.comments[0].id).toEqual(commentId1);
      expect(thread.comments[0].username).toEqual("otheruser");
      expect(thread.comments[0].content).toEqual(
        "Komentar pertama (paling lama)"
      );
      expect(new Date(thread.comments[0].date).getTime()).toEqual(
        dateComment1.getTime()
      );

      expect(thread.comments[1].id).toEqual(commentId2);
      expect(thread.comments[1].username).toEqual("usertest");
      expect(thread.comments[1].content).toEqual("**komentar telah dihapus**");
      expect(new Date(thread.comments[1].date).getTime()).toEqual(
        dateComment2.getTime()
      );

      expect(thread.comments[2].id).toEqual(commentId3);
      expect(thread.comments[2].username).toEqual("otheruser");
      expect(thread.comments[2].content).toEqual(
        "Komentar ketiga (paling baru)"
      );
      expect(new Date(thread.comments[2].date).getTime()).toEqual(
        dateComment3.getTime()
      );
    });

    it("should response 404 when threadId is not found", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-tidakada",
      });
      const responseBody = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseBody.status).toEqual("fail");
      expect(responseBody.message).toEqual("thread tidak ditemukan");
    });
  });
});
