// src/Applications/use_case/_test/AddUserUseCase.test.js

const RegisterUser = require("../../../Domains/users/entities/RegisterUser");
const RegisteredUser = require("../../../Domains/users/entities/RegisteredUser");
const UserRepository = require("../../../Domains/users/UserRepository");
const PasswordHash = require("../../security/PasswordHash");
const AddUserUseCase = require("../AddUserUseCase");

describe("AddUserUseCase", () => {
  it("should orchestrating the add user action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    };

    const dataForMockReturn = {
      id: "user-123", // ID yang akan dikembalikan oleh mock addUser
      username: useCasePayload.username,
      fullname: useCasePayload.fullname,
    };

    // Entitas yang diharapkan sebagai hasil akhir dari use case.
    const expectedRegisteredUser = new RegisteredUser({
      id: dataForMockReturn.id,
      username: dataForMockReturn.username,
      fullname: dataForMockReturn.fullname,
    });

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.verifyAvailableUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockPasswordHash.hash = jest
      .fn()
      .mockImplementation(() => Promise.resolve("encrypted_password"));

    // Mock addUser: sekarang mengembalikan instance BARU dari RegisteredUser
    mockUserRepository.addUser = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new RegisteredUser({
          // Membuat instance baru di sini
          id: dataForMockReturn.id,
          username: dataForMockReturn.username,
          fullname: dataForMockReturn.fullname,
        })
      )
    );

    const addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualRegisteredUser = await addUserUseCase.execute(useCasePayload);

    // Assert
    expect(actualRegisteredUser).toStrictEqual(expectedRegisteredUser);
    expect(actualRegisteredUser).toBeInstanceOf(RegisteredUser);

    expect(mockUserRepository.verifyAvailableUsername).toHaveBeenCalledWith(
      useCasePayload.username
    );
    expect(mockPasswordHash.hash).toHaveBeenCalledWith(useCasePayload.password);
    expect(mockUserRepository.addUser).toHaveBeenCalledWith(
      new RegisterUser({
        username: useCasePayload.username,
        password: "encrypted_password",
        fullname: useCasePayload.fullname,
      })
    );
  });
});
