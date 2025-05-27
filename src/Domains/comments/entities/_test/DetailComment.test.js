const DetailComment = require("../DetailComment");
const InvariantError = require("../../../../Commons/exceptions/InvariantError");
const DetailReply = require("../../../replies/entities/DetailReply");

describe("DetailComment entities", () => {
  it("should throw InvariantError when payload does not contain needed property (missing replies)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "johndoe",
      date: new Date().toISOString(),
      content: "sebuah komentar",
      isDelete: false,
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError(InvariantError);
    expect(() => new DetailComment(payload)).toThrowError(
      "DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw InvariantError when payload does not meet data type specification (replies not array)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "johndoe",
      date: new Date().toISOString(),
      content: "sebuah komentar",
      isDelete: false,
      replies: "bukan array",
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError(InvariantError);
    expect(() => new DetailComment(payload)).toThrowError(
      "DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create DetailComment object correctly when comment is not deleted and has replies", () => {
    // Arrange
    const replyPayload = {
      id: "reply-123",
      username: "janedoe",
      date: new Date().toISOString(),
      content: "sebuah balasan",
      isDelete: false,
    };
    const detailReply = new DetailReply(replyPayload);

    const payload = {
      id: "comment-123",
      username: "johndoe",
      date: new Date().toISOString(),
      content: "Ini adalah isi komentar asli.",
      isDelete: false,
      replies: [detailReply],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual("Ini adalah isi komentar asli.");
    expect(detailComment.replies).toEqual([detailReply]);
    expect(detailComment.replies[0]).toBeInstanceOf(DetailReply);
    expect(detailComment).toBeInstanceOf(DetailComment);
  });

  it("should create DetailComment object correctly and show masked content when comment is deleted, with replies", () => {
    // Arrange
    const payload = {
      id: "comment-456",
      username: "dicoding",
      date: "2021-08-08T07:26:21.338Z",
      content: "Ini konten rahasia yang seharusnya tidak tampil.",
      isDelete: true,
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.content).toEqual("**komentar telah dihapus**");
    expect(detailComment.replies).toEqual([]);
  });

  it("should create DetailComment object correctly with empty replies array if provided", () => {
    // Arrange
    const payload = {
      id: "comment-789",
      username: "janedoe",
      date: new Date(),
      content: "Komentar ini memiliki array balasan kosong.",
      isDelete: false,
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.content).toEqual(
      "Komentar ini memiliki array balasan kosong."
    );
    expect(detailComment.replies).toEqual([]);
  });
});
