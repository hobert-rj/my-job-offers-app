/**
 * A helper function that retries a given async function using an exponential backoff strategy.
 *
 * @param fn An async function that returns a Promise.
 * @param retries Number of retry attempts (default: 2).
 * @param delay Initial delay in milliseconds (default: 1000ms).
 * @returns The resolved value of the async function if successful.
 */
export const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delay: number = 1000,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
  }
};
