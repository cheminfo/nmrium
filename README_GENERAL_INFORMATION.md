### General information about the programmation

- Useful vscode plugins:
  - prettier
  - eslint
  - intellicode
  - gitlens
  - live share
  - github pull request
  - Bracket Pair Colorizer
- When you develop 2 different projects in parallel that depends of each other don't forget to use `npm link`.

### Commit messages

Please use `semantic commit messages` : https://www.conventionalcommits.org/en/v1.0.0/

### Programming with React and D3

The idea is to use the approach described in the bottom of the document:
"React for element creation, D3 as the visualization kernel" :
https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71

### Immutable javascript

Please read the following blog post:

https://dev.to/glebec/four-ways-to-immutability-in-javascript-3b3l

And in particular we want to use immer: https://github.com/immerjs/immer

## Publish

```bash
npm version patch
git push --follow-tags
npm publish
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/nmrium.svg
[npm-url]: https://npmjs.org/package/nmrium
[ci-image]: https://github.com/cheminfo/nmrium/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/cheminfo/nmrium/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/nmrium.svg
[download-url]: https://npmjs.org/package/nmrium
