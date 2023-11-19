import { retry } from './retry';

describe('retry()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('Should return a result when no error is thrown', async () => {
    const task = jest.fn().mockResolvedValue(1);

    expect(await retry(task)).toEqual(1);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('Should retry at most 3 times until succeeding, then return a result', async () => {
    const task = jest
      .fn()
      .mockRejectedValueOnce(new Error('Expected 1'))
      .mockRejectedValueOnce(new Error('Expected 2'))
      .mockRejectedValueOnce(new Error('Expected 3'))
      .mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(1), 10_000);
        });
      });

    jest.advanceTimersByTimeAsync(20_000);

    expect(await retry(task)).toEqual(1);

    expect(task).toHaveBeenCalledTimes(4);
  });

  it('Should retry at most 3 times after the initial failure, then throws', async () => {
    const task = jest
      .fn()
      .mockRejectedValueOnce(new Error('Expected 1'))
      .mockRejectedValueOnce(new Error('Expected 2'))
      .mockRejectedValueOnce(new Error('Expected 3'))
      .mockRejectedValueOnce(new Error('Expected 4'))
      .mockRejectedValueOnce(new Error('Expected 5'));

    jest.advanceTimersByTimeAsync(20_000);

    await expect(retry(task)).rejects.toEqual(new Error('Expected 4'));

    expect(task).toHaveBeenCalledTimes(4);
  });
});
