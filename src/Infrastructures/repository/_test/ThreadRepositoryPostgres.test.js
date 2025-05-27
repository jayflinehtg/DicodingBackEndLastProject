const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
// const { nanoid } = require("nanoid"); // Tidak digunakan secara eksplisit di sini, bisa dihapus jika tidak ada dependensi lain

describe("ThreadRepositoryPostgres", () => {
  // Fungsi yang dijalankan setelah setiap test case
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable(); // Bersihkan juga tabel users jika ada data test user
  });

  // Fungsi yang dijalankan setelah semua test case dalam satu describe block selesai
  afterAll(async () => {
    await pool.end(); // Menutup koneksi pool database
  });

  describe("addThread function", () => {
    it("should persist new thread and return added thread correctly", async () => {
      // Arrange
      // Tambahkan user pemilik thread terlebih dahulu
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });

      const newThreadPayload = new NewThread({
        title: "Judul Thread Integration Test",
        body: "Ini adalah body dari integration test.",
      });
      const ownerId = "user-123";
      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        newThreadPayload,
        ownerId
      );

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(threads).toHaveLength(1);
      expect(threads[0].title).toBe(newThreadPayload.title);
      expect(threads[0].body).toBe(newThreadPayload.body);
      expect(threads[0].user_id).toBe(ownerId);

      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toBe("thread-123");
      expect(addedThread.title).toBe(newThreadPayload.title);
      expect(addedThread.owner).toBe(ownerId);
    });
  });

  describe("verifyAvailableThread function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const nonExistentThreadId = "thread-xxx";

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyAvailableThread(nonExistentThreadId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when thread exists", async () => {
      // Arrange
      // Tambahkan user pemilik thread terlebih dahulu
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding", // Pastikan username ada jika helper membutuhkannya
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-abc",
        owner: "user-123",
      }); // Tambahkan thread ke DB
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const existingThreadId = "thread-abc";

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyAvailableThread(existingThreadId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const nonExistentThreadId = "thread-xyz";

      // Action & Assert
      await expect(
        threadRepositoryPostgres.getThreadById(nonExistentThreadId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should return thread details correctly including username when thread is found", async () => {
      // Arrange
      const userId = "user-789";
      const username = "johndoe"; // Username yang akan di-JOIN
      const threadId = "thread-def";
      const threadDate = new Date(); // Simpan tanggal untuk perbandingan yang tepat

      await UsersTableTestHelper.addUser({
        id: userId,
        username: username, // Pastikan username disimpan oleh helper
        password: "password123", // Diperlukan oleh helper addUser Anda
        fullname: "John Doe", // Diperlukan oleh helper addUser Anda
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "Judul Test Get By Id",
        body: "Body Test Get By Id",
        owner: userId,
        date: threadDate.toISOString(), // Simpan sebagai ISO string
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetails = await threadRepositoryPostgres.getThreadById(
        threadId
      );

      // Assert
      expect(threadDetails).toBeDefined();
      expect(threadDetails.id).toEqual(threadId);
      expect(threadDetails.title).toEqual("Judul Test Get By Id");
      expect(threadDetails.body).toEqual("Body Test Get By Id");
      // === PERBAIKAN PERBANDINGAN TANGGAL ===
      expect(new Date(threadDetails.date).getTime()).toEqual(
        threadDate.getTime()
      );
      expect(threadDetails.username).toEqual(username); // Verifikasi username dari JOIN
    });
  });
});
