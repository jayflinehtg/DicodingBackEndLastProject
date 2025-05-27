// src/Applications/use_case/_test/RefreshAuthenticationUseCase.test.js

const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const AuthenticationTokenManager = require("../../security/AuthenticationTokenManager");
const RefreshAuthenticationUseCase = require("../RefreshAuthenticationUseCase");

describe("RefreshAuthenticationUseCase", () => {
  it("should throw error if use case payload not contain refresh token", async () => {
    // Arrange
    const useCasePayload = {};
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action & Assert
    await expect(
      refreshAuthenticationUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN"
    );
  });

  it("should throw error if refresh token not string", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 1,
    };
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action & Assert
    await expect(
      refreshAuthenticationUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should orchestrate the refresh authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: "some_refresh_token",
    };

    // Data yang akan dikembalikan oleh mock
    const mockDecodedPayload = { username: "dicoding", id: "user-123" };
    const mockNewAccessToken = "new_generated_access_token";

    // Entitas atau nilai yang diharapkan sebagai hasil akhir dari use case
    const expectedAccessToken = mockNewAccessToken;

    /** creating dependency of use case */
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.verifyRefreshToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockDecodedPayload));
    // mock createAccessToken sekarang mengembalikan nilai yang sudah disiapkan terpisah
    mockAuthenticationTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockNewAccessToken));

    /** creating use case instance */
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const actualAccessToken = await refreshAuthenticationUseCase.execute(
      useCasePayload
    );

    // Assert
    expect(actualAccessToken).toEqual(expectedAccessToken); // Membandingkan dengan nilai yang diharapkan

    expect(
      mockAuthenticationTokenManager.verifyRefreshToken
    ).toHaveBeenCalledWith(useCasePayload.refreshToken);
    expect(
      mockAuthenticationRepository.checkAvailabilityToken
    ).toHaveBeenCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationTokenManager.decodePayload).toHaveBeenCalledWith(
      useCasePayload.refreshToken
    );
    expect(
      mockAuthenticationTokenManager.createAccessToken
    ).toHaveBeenCalledWith(mockDecodedPayload); // Payload dari decodePayload
  });
});
