const LoginUserUseCase = require("../../../../Applications/use_case/LoginUserUseCase");
const RefreshAuthenticationUseCase = require("../../../../Applications/use_case/RefreshAuthenticationUseCase");
const LogoutUserUseCase = require("../../../../Applications/use_case/LogoutUserUseCase");

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler =
      this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    console.log(
      "[AuthenticationsHandler] Menerima request POST /authentications..."
    );
    console.log(
      "[AuthenticationsHandler] Payload request:",
      JSON.stringify(request.payload, null, 2)
    );

    try {
      const loginUserUseCase = this._container.getInstance(
        LoginUserUseCase.name
      );
      console.log(
        "[AuthenticationsHandler] LoginUserUseCase berhasil didapatkan dari container."
      );

      const { accessToken, refreshToken } = await loginUserUseCase.execute(
        request.payload
      );
      console.log(
        "[AuthenticationsHandler] LoginUserUseCase BERHASIL dieksekusi."
      );

      const response = h.response({
        status: "success",
        data: {
          accessToken,
          refreshToken,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "[AuthenticationsHandler] TERJADI ERROR saat eksekusi LoginUserUseCase atau di dalamnya!"
      );
      console.error(error);
      throw error;
    }
  }

  async putAuthenticationHandler(request) {
    const refreshAuthenticationUseCase = this._container.getInstance(
      RefreshAuthenticationUseCase.name
    );
    const accessToken = await refreshAuthenticationUseCase.execute(
      request.payload
    );

    return {
      status: "success",
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    const logoutUserUseCase = this._container.getInstance(
      LogoutUserUseCase.name
    );
    await logoutUserUseCase.execute(request.payload);
    return {
      status: "success",
    };
  }
}

module.exports = AuthenticationsHandler;
