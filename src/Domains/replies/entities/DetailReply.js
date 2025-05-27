const InvariantError = require("../../../Commons/exceptions/InvariantError");

class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      username,
      date,
      content,
      isDelete, // 'isDelete' atau 'is_delete' sesuai data dari repository
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    // Konten akan disesuaikan berdasarkan status isDelete
    this.content = isDelete ? "**balasan telah dihapus**" : content;
  }

  _verifyPayload({
    id,
    username,
    date,
    content, // isDelete tidak wajib di payload awal jika logika repository sudah menanganinya
  }) {
    if (
      !id ||
      !username ||
      !date ||
      content === undefined ||
      content === null
    ) {
      throw new InvariantError("DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      !(date instanceof Date || typeof date === "string") || // date bisa string (ISO) atau object Date
      typeof content !== "string"
    ) {
      throw new InvariantError("DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = DetailReply;
