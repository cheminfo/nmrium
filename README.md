## Testing

There is an automatic build on each commit. You can test the application at:

https://cheminfo.github.io/nmr-displayer/

Want to play ? You can do some 1D NMR exercises ;)

https://cheminfo.github.io/nmr-displayer?sampleURL=https%3A//cheminfo.github.io/nmr-dataset2/toc.json

Also you can do some 2D NMR exercises ;)

https://cheminfo.github.io/nmr-displayer?sampleURL=https%3A//cheminfo.github.io/nmr-dataset1/data/2d.json

You can do some 1D NMR tests/ exams ;)

https://cheminfo.github.io/nmr-displayer?sampleURL=https%3A//cheminfo.github.io/nmr-dataset2/exam.json

If you have jcamps accessible from an URL and that your server allow cross-origin you can directly open your file in the nmr-displayer:

https://cheminfo.github.io/nmr-displayer?sampleURL=https%3A//cheminfo.github.io/nmr-dataset2/100-86-7/1h.dx

Link loading the default samples test cases

https://cheminfo.github.io/nmr-displayer/?sampleURL=https%3A%2F%2Fcheminfo.github.io%2Fnmr-displayer%2Fsamples.json#/

## Install and test locally

```
git clone https://github.com/cheminfo/nmr-displayer.git
cd nmr-displayer
npm i
npm start
```

## General information about the programmation

- Useful vscode plugins:
  - prettier
  - eslint
  - intellicode
  - gitlens
  - live share
  - github pull request
  - Bracket Pair Colorizer
- When you develop 2 different projects in parallel that depends of each other don't forget to use `npm link`.

## Commit messages

Please use `semantic commit messages` : https://www.conventionalcommits.org/en/v1.0.0-beta.4/

## Programming with React and D3

The idea is to use the approach described in the bottom of the document:
"React for element creation, D3 as the visualization kernel" :
https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71

## Immutable javascript

Please read the following blog post:

https://dev.to/glebec/four-ways-to-immutability-in-javascript-3b3l

And in particular we want to use immer: https://github.com/immerjs/immer

## Use as a library in a React project

### Install the package

```console
npm install nmr-displayer
```

### OpenChemLib version

This module makes use of `openchemlib/full` and registers it with `openchemlib-utlis`.  
If you use OpenChemLib somewhere else in your project, make sure to also import
from `openchemlib/full` to avoid having multiple OCL versions in your bundle.

### Use the component

```jsx
import NMRDisplayer from 'nmr-displayer';

function MyComponent() {
  return <NMRDisplayer />;
}
```

## Publish

```bash
npm version patch
git push --follow-tags
npm publish
```
