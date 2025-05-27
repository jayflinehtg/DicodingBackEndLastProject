const NewThread = require("../NewThread");

describe("NewThread entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      title: "sebuah thread",
      // body property is missing
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      title: 123, // title should be a string
      body: "ini adalah isi thread",
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  // Optional: Test for title length if you added that validation
  it("should throw error when title contains more than 50 characters", () => {
    // Arrange
    const payload = {
      title: "a".repeat(51), // 51 characters
      body: "ini adalah isi thread",
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.TITLE_LIMIT_CHAR"
    );
  });

  it("should create NewThread object correctly", () => {
    // Arrange
    const payload = {
      title: "Judul Thread Baru",
      body: "Ini adalah isi dari thread baru.",
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread).toBeInstanceOf(NewThread);
  });
});
