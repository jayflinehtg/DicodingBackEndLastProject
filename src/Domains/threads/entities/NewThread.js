const InvariantError = require('../../../Commons/exceptions/InvariantError');

class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body } = payload;

    this.title = title;
    this.body = body;
  }

  _verifyPayload({ title, body }) {
    if (!title || !body) {
      throw new InvariantError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== "string" || typeof body !== "string") {
      throw new InvariantError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 50) {
      throw new InvariantError('NEW_THREAD.TITLE_LIMIT_CHAR');
    }
  }
}

module.exports = NewThread;
