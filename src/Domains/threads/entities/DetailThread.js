const InvariantError = require("../../../Commons/exceptions/InvariantError");

class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, date, username, comments } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username; // Username pemilik thread
    this.comments = comments; // Array of DetailComment objects
  }

  _verifyPayload({ id, title, body, date, username, comments }) {
    if (!id || !title || !body || !date || !username || !comments) {
      throw new InvariantError("DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof title !== "string" ||
      typeof body !== "string" ||
      !(date instanceof Date || typeof date === "string") || // date bisa string (ISO) atau object Date
      typeof username !== "string" ||
      !Array.isArray(comments)
    ) {
      throw new InvariantError(
        "DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    }
  }
}

module.exports = DetailThread;
