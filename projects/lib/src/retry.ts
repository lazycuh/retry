/**
 * Retry executing the provided function `fn` until it succeeds or fails after retrying 3 more times,
 * so `fn` will be executed at most 4 times.
 *
 * @param fn The function to be retried.
 * @param waitTimeMs The time to wait between retries in milliseconds, default is 3000ms.
 *
 * @returns Return a promise that resolves to the value returned by the provided function `fn`.
 *
 * @template T The type of returned value.
 */
export async function retry<T>(fn: () => Promise<T> | T, waitTimeMs = 3000): Promise<T> {
  try {
    return await fn();
  } catch {
    return await new Promise((resolve, reject) => {
      const maxRetries = 3;
      let isRetrying = false;
      let retryCount = 0;

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const repeater = setInterval(async () => {
        // If the async work hasn't completed yet, we want to wait for it
        if (isRetrying) {
          return;
        }

        try {
          retryCount++;
          isRetrying = true;
          resolve(await fn());
          clearInterval(repeater);
        } catch (error) {
          if (retryCount >= maxRetries) {
            clearInterval(repeater);
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        } finally {
          isRetrying = false;
        }
      }, waitTimeMs);
    });
  }
}
