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

See https://docs.nmrium.org/for-developers/e2e-tests
