const NewComment = require("../NewComment");
const InvariantError = require("../../../../Commons/exceptions/InvariantError"); // Pastikan path ini benar

describe("NewComment entities", () => {
  it("should throw InvariantError when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      // content property is missing
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError(InvariantError);
    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw InvariantError when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: 123, // content should be a string
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError(InvariantError);
    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create NewComment object correctly", () => {
    // Arrange
    const payload = {
      content: "Ini adalah isi komentar baru.",
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.content).toEqual(payload.content);
    expect(newComment).toBeInstanceOf(NewComment);
  });
});
