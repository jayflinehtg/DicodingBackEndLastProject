const InvariantError = require("../../../Commons/exceptions/InvariantError");

class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, isDelete, replies } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? "**komentar telah dihapus**" : content;
    this.replies = replies;
  }

  _verifyPayload({ id, username, date, content, replies }) {
    if (
      !id ||
      !username ||
      !date ||
      content === undefined ||
      content === null ||
      !replies
    ) {
      throw new InvariantError("DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      !(date instanceof Date || typeof date === "string") ||
      typeof content !== "string" ||
      !Array.isArray(replies)
    ) {
      throw new InvariantError(
        "DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    }
  }
}

module.exports = DetailComment;
