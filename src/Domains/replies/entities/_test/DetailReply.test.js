const DetailReply = require("../DetailReply");
const InvariantError = require("../../../../Commons/exceptions/InvariantError");

describe("DetailReply entities", () => {
  it("should throw InvariantError when payload does not contain needed property", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "johndoe",
      content: "sebuah balasan",
      isDelete: false,
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrowError(InvariantError);
    expect(() => new DetailReply(payload)).toThrowError(
      "DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw InvariantError when payload does not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "johndoe",
      date: 12345, // date should be string or Date object
      content: "sebuah balasan",
      isDelete: false,
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrowError(InvariantError);
    expect(() => new DetailReply(payload)).toThrowError(
      "DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create DetailReply object correctly when reply is not deleted", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "johndoe",
      date: new Date().toISOString(),
      content: "Ini adalah isi balasan asli.",
      isDelete: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual("Ini adalah isi balasan asli.");
    expect(detailReply).toBeInstanceOf(DetailReply);
  });

  it("should create DetailReply object correctly and show masked content when reply is deleted", () => {
    // Arrange
    const payload = {
      id: "reply-456",
      username: "dicoding",
      date: "2021-08-08T07:59:48.766Z",
      content: "Ini konten rahasia yang seharusnya tidak tampil.",
      isDelete: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual("**balasan telah dihapus**");
    expect(detailReply).toBeInstanceOf(DetailReply);
  });

  it("should create DetailReply object correctly even if isDelete is undefined (default to not deleted)", () => {
    // Arrange
    const payload = {
      id: "reply-789",
      username: "janedoe",
      date: new Date(),
      content: "Balasan ini tidak memiliki flag isDelete.",
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.content).toEqual(
      "Balasan ini tidak memiliki flag isDelete."
    );
  });
});
