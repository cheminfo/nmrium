# NMRium

React component to display and process nuclear magnetic resonance (NMR) spectra.

<h3 align="center">

  <a href="https://www.zakodium.com">
    <img src="https://www.zakodium.com/brand/zakodium-logo-white.svg" width="50" alt="Zakodium logo" />
  </a>

  <p>
    Maintained by <a href="https://www.zakodium.com">Zakodium</a>
  </p>

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]
[![DOI](https://www.zenodo.org/badge/192117023.svg)](https://www.zenodo.org/badge/latestdoi/192117023)

</h3>

## Use it

Visit https://www.nmrium.org for examples of usage.

## Use as a library in a React project

### Install the package

```console
npm install nmrium
```

### OpenChemLib version

This module makes use of `openchemlib/full`.  
If you use OpenChemLib somewhere else in your project, make sure to also import
from `openchemlib/full` to avoid having multiple OCL versions in your bundle.

### Use the component

```jsx
import NMRium from 'nmrium';

function MyComponent() {
  return <NMRium />;
}
```

## Development and testing

See [General information for NMRium development](./README_DEV.md).

There is an automatic build on each commit. You can test the latest build from `main` at:

https://dev.nmrium.org/

Want to play ? You can do some 1D NMR exercises ;)

https://www.nmrium.org/teaching#?toc=https://cheminfo.github.io/nmr-dataset2/toc.json

Also you can do some 2D NMR exercises ;)

https://www.nmrium.org/teaching#?toc=https%3A%2F%2Fcheminfo.github.io%2Fnmr-dataset-nils%2Ftoc_01_simple.json

### Install and test locally

```console
git clone https://github.com/cheminfo/nmrium.git
cd nmrium
npm i
npm start
```

## Funding

|                                              |                                                                                                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="images/zakodium.svg" width="200">  | [Zakodium sàrl](https://www.zakodium.com)                                                                                                                                                                                                                                             |
| <img src="images/idnmr.png" height="80">     | [Initiative zur Verbesserung der NMR-Datenqualität (IDNMR)](https://idnmr.uni-koeln.de/)                                                                                                                                                                                              |
| <img src="images/nfdi4chem.png" width="200"> | [NFDI4Chem Chemistry Consortium in the NFDI](https://www.nfdi4chem.de/)                                                                                                                                                                                                               |
| <img src="images/univalle.svg" height="100"> | [Universidad del Valle / Cali, Colombia](https://darmn.correounivalle.edu.co/)                                                                                                                                                                                                        |
| <img src="images/bigmap.jpg" height="100">   | This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 957189. The project is part of BATTERY 2030+, the large-scale European research initiative for inventing the sustainable batteries of the future. |

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/nmrium.svg
[npm-url]: https://npmjs.org/package/nmrium
[ci-image]: https://github.com/cheminfo/nmrium/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/nmrium/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/nmrium.svg
[download-url]: https://npmjs.org/package/nmrium
