# General information for NMRium development

## Useful Visual Studio Code plugins

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare)
- [GitHub Pull Requests and Issues](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github)
- [Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer)

## Commit messages

Please use conventional commit messages: https://www.conventionalcommits.org/en/v1.0.0/

## Programming with React and D3

The idea is to use the approach described in the bottom of the document:
[React for element creation, D3 as the visualization kernel](https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71)

### Immutable JavaScript

Please read the following blog post:

https://dev.to/glebec/four-ways-to-immutability-in-javascript-3b3l

And in particular we use Immer: https://github.com/immerjs/immer

## Testing

We use the [Jest](https://jestjs.io/docs/getting-started) test runner.

Keep the tests simple and focused. Do not hesitate to write many tests instead of doing everything in the same test.
This is important because in case one test fails, the others will still run.

Use `describe()` blocks to group tests in a meaningful way. It is not useful to have only one big `describe()` with the name of the file.

### Unit tests

Please write any unit test as close to the tested file as possible, in a `__tests__` subdirectory.
The test file's name should end with `.test.{js,jsx,ts,tsx}`.

For example, tests for the file located in `src/data/data1d/autoPeakPicking.js` should be written in `src/data/data1d/__tests__/autoPeakPicking.test.js`.

You can run all unit tests with `npm run test-only`.

### End-to-end tests

End-to-end (e2e) tests are written in the `test-e2e` directory.

We use [Playwright](https://playwright.dev/docs/intro) to run the tests in real browsers.

You can run all e2e tests with `npm run test-e2e-jest`.
Note that a server with the application should be running. It can be the dev server (`npm run dev`) or a server with the production build (`npm run build && npm run test-e2e-server`).
