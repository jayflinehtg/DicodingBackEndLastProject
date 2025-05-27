const InvariantError = require("../../../Commons/exceptions/InvariantError");

class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content } = payload;
    this.content = content;
  }

  _verifyPayload({ content }) {
    if (!content) {
      throw new InvariantError("NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (typeof content !== "string") {
      throw new InvariantError("NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = NewComment;
