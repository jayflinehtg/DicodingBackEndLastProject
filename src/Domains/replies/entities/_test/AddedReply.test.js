const AddedReply = require("../AddedReply");
const InvariantError = require("../../../../Commons/exceptions/InvariantError");

describe("AddedReply entities", () => {
  it("should throw InvariantError when payload does not contain needed property", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "Isi Balasan",
    };

    // Action & Assert
    expect(() => new AddedReply(payload)).toThrowError(InvariantError);
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw InvariantError when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "Isi Balasan",
      owner: "user-123",
    };

    // Action & Assert
    expect(() => new AddedReply(payload)).toThrowError(InvariantError);
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddedReply object correctly", () => {
    // Arrange
    const payload = {
      id: "reply-xyz",
      content: "Isi balasan yang ditambahkan.",
      owner: "user-abc",
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
    expect(addedReply).toBeInstanceOf(AddedReply);
  });
});
