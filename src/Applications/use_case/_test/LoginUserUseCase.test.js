// src/Applications/use_case/_test/LoginUserUseCase.test.js

const UserRepository = require("../../../Domains/users/UserRepository");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const AuthenticationTokenManager = require("../../security/AuthenticationTokenManager");
const PasswordHash = require("../../security/PasswordHash");
const LoginUserUseCase = require("../LoginUserUseCase");
const NewAuth = require("../../../Domains/authentications/entities/NewAuth");

describe("LoginUserUseCase", () => {
  // Mengubah nama describe agar sesuai dengan UseCase yang diuji
  it("should orchestrate the login user action correctly", async () => {
    // Mengubah nama test case
    // Arrange
    const useCasePayload = {
      username: "dicoding",
      password: "secret",
    };

    // Data yang akan dikembalikan oleh mock-mock yang relevan
    const mockUserId = "user-123";
    const mockEncryptedPassword = "encrypted_password";
    const mockAccessToken = "access_token_from_mock";
    const mockRefreshToken = "refresh_token_from_mock";

    // Entitas yang diharapkan sebagai hasil akhir dari use case
    const expectedNewAuth = new NewAuth({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    });

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.getPasswordByUsername = jest
      .fn()
      .mockResolvedValue(mockEncryptedPassword);
    mockPasswordHash.comparePassword = jest.fn().mockResolvedValue(undefined); 
    mockUserRepository.getIdByUsername = jest
      .fn()
      .mockResolvedValue(mockUserId);
    mockAuthenticationTokenManager.createAccessToken = jest
      .fn()
      .mockResolvedValue(mockAccessToken); // Kembalikan token spesifik dari mock
    mockAuthenticationTokenManager.createRefreshToken = jest
      .fn()
      .mockResolvedValue(mockRefreshToken); // Kembalikan token spesifik dari mock
    mockAuthenticationRepository.addToken = jest
      .fn()
      .mockResolvedValue(undefined);

    /** creating use case instance */
    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualNewAuth = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(actualNewAuth).toStrictEqual(expectedNewAuth);
    expect(actualNewAuth).toBeInstanceOf(NewAuth);

    expect(mockUserRepository.getPasswordByUsername).toHaveBeenCalledWith(
      useCasePayload.username
    );
    expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(
      useCasePayload.password,
      mockEncryptedPassword
    );
    expect(mockUserRepository.getIdByUsername).toHaveBeenCalledWith(
      useCasePayload.username
    );
    expect(
      mockAuthenticationTokenManager.createAccessToken
    ).toHaveBeenCalledWith({
      username: useCasePayload.username,
      id: mockUserId,
    });
    expect(
      mockAuthenticationTokenManager.createRefreshToken
    ).toHaveBeenCalledWith({
      username: useCasePayload.username,
      id: mockUserId,
    });
    expect(mockAuthenticationRepository.addToken).toHaveBeenCalledWith(
      mockRefreshToken
    );
  });
});
