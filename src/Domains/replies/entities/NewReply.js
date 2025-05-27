const InvariantError = require("../../../Commons/exceptions/InvariantError");

class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content } = payload;
    this.content = content;
  }

  _verifyPayload({ content }) {
    if (!content) {
      throw new InvariantError("NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (typeof content !== "string") {
      throw new InvariantError("NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
    // Tambahan validasi lain jika diperlukan (misalnya, panjang minimal/maksimal)
  }
}

module.exports = NewReply;
