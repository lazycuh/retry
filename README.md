# retry [![](https://circleci.com/gh/babybeet/retry.svg?style=svg&logo=appveyor)](https://app.circleci.com/pipelines/github/babybeet/retry?branch=main)

Convenient utilities to retry executing some operation until success or failure at most 3 times.

## Table of contents

<!-- toc -->

- [Installation](#installation)
- [Available APIs](#available-apis)
  - [`retry` function](#retry-function)
  - [`@Retryable` decorator](#retryable-decorator)

<!-- tocstop -->

## Installation

- `npm`

  ```
  npm i -S @babybeet/retry
  ```

- `pnpm`

  ```
  pnpm i -S @babybeet/retry
  ```

- `yarn`

  ```
  yarn add @babybeet/retry
  ```

## Available APIs

### `retry` function

To imperatively retry some operation, wrap your function/method call inside `retry` as followed:

```ts
import { retry } from '@babybeet/retry';

...

const allUsers = await retry(() => fetchAllUsers(), 1000); // Wait 1000ms between retries, default is 3000ms

...
```

### `@Retryable` decorator

Alternatively, you can decorate your methods using `@Retryable` decorator to add retrying logic to them, be sure that your `tsconfig.json` file has `experimentalDecorators` setting enabled, for example:

```json
{
  "compilerOptions": {
    ...
    "experimentalDecorators": true,
    ...
  },
}
```

```ts
import { Retryable } from '@babybeet/retry';

...

class UserService {

  @Retryable(2000) // Wait 2000ms between retries, default is 3000ms
  fetchUsers() {
    ...
  }
}

...
```

When `userService.fetchUsers()` is called, any failures will cause it to rerun until either succeeding or failing at most 3 times after the initial failure.
