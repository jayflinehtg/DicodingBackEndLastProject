// src/Applications/use_case/_test/AddThreadUseCase.test.js

const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const AddThreadUseCase = require("../AddThreadUseCase");

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "Judul Thread Uji Coba",
      body: "Ini adalah isi dari thread uji coba.",
    };
    const mockOwnerId = "user-123";

    const dataForMockReturn = {
      id: "thread-xyz789",
      title: useCasePayload.title,
      owner: mockOwnerId,
    };
    const expectedAddedThread = new AddedThread({
      id: dataForMockReturn.id,
      title: dataForMockReturn.title,
      owner: dataForMockReturn.owner,
    });

    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue(
        new AddedThread({
          // Membuat instance baru di sini
          id: dataForMockReturn.id,
          title: dataForMockReturn.title,
          owner: dataForMockReturn.owner,
        })
      ),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const actualAddedThread = await addThreadUseCase.execute(
      useCasePayload,
      mockOwnerId
    );

    // Assert
    // 1. Memastikan use case mengembalikan objek AddedThread yang benar.
    expect(actualAddedThread).toStrictEqual(expectedAddedThread);
    expect(actualAddedThread).toBeInstanceOf(AddedThread);

    // 2. Memastikan bahwa `addThread` pada mockThreadRepository dipanggil dengan argumen yang benar.
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
      mockOwnerId
    );
  });
});
