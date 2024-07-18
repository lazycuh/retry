import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Retryable } from './retryable.decorator';

describe('@Retryable()', () => {
  class TestClass {
    @Retryable()
    async performAction() {
      return this.speak();
    }

    async speak() {
      return Promise.resolve('Hello World');
    }
  }

  const testClass = new TestClass();

  beforeEach(() => {
    vi.spyOn(testClass, 'performAction');
    vi.useFakeTimers();
  });

  it('Should return a result when no error is thrown', async () => {
    vi.spyOn(testClass, 'speak');

    expect(await testClass.performAction()).toEqual('Hello World');
    expect(testClass.performAction).toHaveBeenCalledTimes(1);
    expect(testClass.speak).toHaveBeenCalledTimes(1);
  });

  it('Should retry at most 3 times until succeeding, then return a result', async () => {
    vi.spyOn(testClass, 'speak')
      .mockRejectedValueOnce(new Error('Expected 1'))
      .mockRejectedValueOnce(new Error('Expected 2'))
      .mockRejectedValueOnce(new Error('Expected 3'))
      .mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('Hi');
          }, 10_000);
        });
      });

    void vi.advanceTimersByTimeAsync(20_000);

    expect(await testClass.performAction()).toEqual('Hi');
    expect(testClass.performAction).toHaveBeenCalledTimes(1);
    expect(testClass.speak).toHaveBeenCalledTimes(4);
  });

  it('Should retry at most 3 times after the initial failure, then throws', async () => {
    vi.spyOn(testClass, 'speak')
      .mockRejectedValueOnce(new Error('Expected 1'))
      .mockRejectedValueOnce(new Error('Expected 2'))
      .mockRejectedValueOnce(new Error('Expected 3'))
      .mockRejectedValueOnce(new Error('Expected 4'))
      .mockRejectedValueOnce(new Error('Expected 5'));

    void vi.advanceTimersByTimeAsync(50_000);

    await expect(testClass.performAction()).rejects.toEqual(new Error('Expected 4'));
    expect(testClass.performAction).toHaveBeenCalledTimes(1);
    expect(testClass.speak).toHaveBeenCalledTimes(4);
  });
});
