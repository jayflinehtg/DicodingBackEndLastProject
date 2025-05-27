const AddedComment = require("../AddedComment");
const InvariantError = require("../../../../Commons/exceptions/InvariantError"); // Pastikan path ini benar

describe("AddedComment entities", () => {
  it("should throw InvariantError when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "Isi Komentar",
      // owner property is missing
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError(InvariantError);
    expect(() => new AddedComment(payload)).toThrowError(
      "ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw InvariantError when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123, // id should be a string
      content: "Isi Komentar",
      owner: "user-123",
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError(InvariantError);
    expect(() => new AddedComment(payload)).toThrowError(
      "ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddedComment object correctly", () => {
    // Arrange
    const payload = {
      id: "comment-xyz",
      content: "Isi komentar yang ditambahkan.",
      owner: "user-abc",
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
    expect(addedComment).toBeInstanceOf(AddedComment);
  });
});
