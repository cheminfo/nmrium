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

### Debug what changed to trigger a re-render

If you have a component that re-renders because of a hook that changed but you
don't know which hook it was, you can temporarily add a call to
[`useWhatChanged`](https://github.com/simbathesailor/use-what-changed).

It will print to the console what changed at each render.

Do not forget to remove the call and the import when you have finished to debug!

```js
import { useWhatChanged } from '@simbathesailor/use-what-changed';

export default function SomeComponent() {
  const [state, setState] = useState();
  const context1 = useSomeContext();
  const context2 = useSomeOtherContext();

  useWhatChanged([state, context1, context2], 'state,context1,context2');

  return <div />;
}
```

## Testing

We use the [Vitest](https://vitest.dev/) test runner.

Keep the tests simple and focused. Do not hesitate to write many tests instead of doing everything in the same test.
This is important because in case one test fails, the others will still run.

Use `describe()` blocks to group tests in a meaningful way. It is not useful to have only one big `describe()` with the name of the file.

### Unit tests

Please write any unit test as close to the tested file as possible, in a `__tests__` subdirectory.
The test file's name should end with `.test.{js,jsx,ts,tsx}`.

For example, tests for the file located in `src/data/data1d/autoPeakPicking.js` should be written in `src/data/data1d/__tests__/autoPeakPicking.test.js`.

You can run all unit tests with `npm run test-only`.

### End-to-end tests

End-to-end (e2e) tests are written in the [`test-e2e` directory](https://github.com/cheminfo/nmrium/tree/HEAD/test-e2e).

We use [Playwright](https://playwright.dev/docs/intro/) to write and run the tests
in real browsers.

You can run all e2e tests with `npm run test-e2e`.
Note that to test your latest changes, the dev server should be running (`npm run dev`).
Otherwise, the last unminified production build from `npm run build-no-minify` will be used.

## Useful links

The entire Playwright website is a good reference. Here are a few useful links:

- <https://playwright.dev/docs/test-annotations/>
- <https://playwright.dev/docs/test-assertions/>
- <https://playwright.dev/docs/test-cli/>
- <https://playwright.dev/docs/selectors/>
- <https://playwright.dev/docs/api/class-locator/>
- <https://www.youtube.com/watch?v=LczBDR0gOhk>

## Running and debugging tests

See: <https://www.youtube.com/watch?v=JRuMGb3JE5k>

---

To run a single test, use the `--grep` command-line flag:

```console
npx playwright test --grep "my test"
```

You can grep by file name or test description.

---

If you want to do step debugging to see what happens in the page during the test,
set the `PWDEBUG` environment variable:

```console
PWDEBUG=1 npx playwright test --grep "my test"
```

---

You can also enable the `slowMo` mode, so that the actions are executed slower.

To do this, edit [`playwright.config.ts`](https://github.com/cheminfo/nmrium/blob/e01fceebfcc37d725f46d7059409b45ea285490b/playwright.config.ts#L17)
and uncomment the `slowMo` option.
