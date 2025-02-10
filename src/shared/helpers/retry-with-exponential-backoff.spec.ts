// Optionally, increase Jest's timeout to ensure the test doesn't time out.
jest.setTimeout(30000);

import { retryWithExponentialBackoff } from './retry-with-exponential-backoff';

describe('retryWithExponentialBackoff', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the value if the function succeeds on the first try', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const promise = retryWithExponentialBackoff(fn);

    // No timer advancement is needed because the function resolves immediately.
    await expect(promise).resolves.toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry the function until it succeeds', async () => {
    // Simulate that the function fails once, then succeeds.
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    const promise = retryWithExponentialBackoff(fn, 2, 1000);

    // For the first failure, the helper waits 1000ms.
    // Advance timers asynchronously by 1000ms.
    await jest.advanceTimersByTimeAsync(1000);
    // Allow any pending microtasks to complete.
    await Promise.resolve();

    await expect(promise).resolves.toBe('success');
    // Expected calls: initial call (fail) and one retry call (success) = 2 calls.
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
