const DetailThread = require("../DetailThread");
const InvariantError = require("../../../../Commons/exceptions/InvariantError");
const DetailComment = require("../../../comments/entities/DetailComment"); // Import DetailComment

describe("DetailThread entities", () => {
  it("should throw InvariantError when payload does not contain needed property", () => {
    const payload = {
      id: "thread-123",
      title: "Judul Thread",
      body: "Isi Thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
      // comments is missing
    };
    expect(() => new DetailThread(payload)).toThrowError(
      "DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw InvariantError when payload does not meet data type specification", () => {
    const payload = {
      id: "thread-123",
      title: "Judul Thread",
      body: "Isi Thread",
      date: "2021-08-08T07:19:09.775Z",
      username: 123,
      comments: [],
    };
    expect(() => new DetailThread(payload)).toThrowError(
      "DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw InvariantError when comments is not an array", () => {
    const payload = {
      id: "thread-123",
      title: "Judul Thread",
      body: "Isi Thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
      comments: "bukan array",
    };
    expect(() => new DetailThread(payload)).toThrowError(
      "DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create DetailThread object correctly", () => {
    // Arrange
    const commentPayload = {
      id: "comment-123",
      username: "johndoe",
      date: "2021-08-08T07:22:33.555Z",
      content: "sebuah komentar",
      isDelete: false,
      replies: [], // <-- TAMBAHKAN INI
    };
    const detailComment = new DetailComment(commentPayload);

    const payload = {
      id: "thread-abc",
      title: "Judul Thread Detail",
      body: "Ini adalah body dari thread detail.",
      date: new Date().toISOString(),
      username: "userThreadOwner",
      comments: [detailComment, detailComment],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
    expect(detailThread.comments).toHaveLength(2);
    expect(detailThread.comments[0]).toBeInstanceOf(DetailComment);
    expect(detailThread).toBeInstanceOf(DetailThread);
  });
});
