class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance("AddThreadUseCase");
    const { id: ownerId } = request.auth.credentials;
    const { title, body } = request.payload;
    const addedThread = await addThreadUseCase.execute(
      { title, body },
      ownerId
    );

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance("AddCommentUseCase");
    const { id: ownerId } = request.auth.credentials;
    const { threadId } = request.params;
    const { content } = request.payload;
    const addedComment = await addCommentUseCase.execute(
      { content },
      ownerId,
      threadId
    );

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      "DeleteCommentUseCase"
    );
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await deleteCommentUseCase.execute(threadId, commentId, ownerId);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }

  async getThreadDetailHandler(request, h) {
    const getThreadDetailUseCase = this._container.getInstance(
      "GetThreadDetailUseCase"
    );
    const { threadId } = request.params;
    const thread = await getThreadDetailUseCase.execute(threadId);

    const response = h.response({
      status: "success",
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance("AddReplyUseCase");

    const { id: ownerId } = request.auth.credentials;

    const { threadId, commentId } = request.params;

    const { content } = request.payload;
    const addedReply = await addReplyUseCase.execute(
      { content },
      ownerId,
      threadId,
      commentId
    );

    const response = h.response({
      status: "success",
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase =
      this._container.getInstance("DeleteReplyUseCase");

    const { id: ownerId } = request.auth.credentials;

    const { threadId, commentId, replyId } = request.params;

    await deleteReplyUseCase.execute(threadId, commentId, replyId, ownerId);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
