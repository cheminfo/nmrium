## Testing

There is an automatic build on each commit. You can test the application at:

https://cheminfo.github.io/nmr-displayer/

## Install and test locally

```
git clone https://github.com/cheminfo/nmr-displayer.git
cd nmr-displayer
npm i
npm start
```

## General information about the programmation

* Useful vscode plugins:
  * prettier
  * eslint
  * intellicode
  * gitlens
  * live share
  * github pull request
  * Bracket Pair Colorizer
* Storybook
  * Use storybook for on-line demonstration on gh-pages. An example is in the project https://zakodium.github.io/react-ocl/?path=/story/highlighting--fixed-highlight `npm run storybook`
  * Create a travis script that creates the storybook on gh-pages after each commit. Thjis       will allow to easily test the project
* When you develop 2 different projects in parallel that depends of each other don't forget to   use `npm link`.


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