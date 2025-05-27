const NewReply = require("../NewReply");
const InvariantError = require("../../../../Commons/exceptions/InvariantError"); // Sesuaikan path jika perlu

describe("NewReply entities", () => {
  it("should throw InvariantError when payload does not contain needed property", () => {
    // Arrange
    const payload = {
      // content property is missing
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError(InvariantError);
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw InvariantError when payload does not meet data type specification", () => {
    // Arrange
    const payload = {
      content: 12345,
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError(InvariantError);
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create NewReply object correctly", () => {
    // Arrange
    const payload = {
      content: "Ini adalah isi balasan baru.",
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.content).toEqual(payload.content);
    expect(newReply).toBeInstanceOf(NewReply);
  });
});
