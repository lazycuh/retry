import { retry } from './retry';

/**
 * A decorator that can be applied to any method that returns a promise to automatically retries
 * in case of a failure. Retrying will happen at most 3 times, and the wait time between retries
 * is controlled by the `waitTimeMs` parameter in milliseconds.
 *
 * @param waitTimeMs How long to wait between retries in milliseconds, default is 3000ms.
 */
export function Retryable<T>(waitTimeMs = 3000) {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
  ) => {
    const original = descriptor.value as (...args: unknown[]) => Promise<T>;

    descriptor.value = function interceptor(...args: unknown[]) {
      return retry(() => original.apply(this, args), waitTimeMs);
    };
    return descriptor;
  };
}
