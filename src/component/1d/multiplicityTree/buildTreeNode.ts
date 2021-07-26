import lodashGet from 'lodash/get';

import {
  getMultiplicityNumber,
  getPascal,
} from '../../panels/extra/utilities/MultiplicityUtilities';

import { TREE_LEVEL_COLORS } from './TreeColors';

function createTreeNodes(signal, spectrumData) {
  function buildTreeNodesData(
    multiplicityIndex,
    jIndices,
    treeNodesData,
    startX,
  ) {
    if (multiplicityIndex >= signal.multiplicity.length) {
      return treeNodesData;
    }
    // re-use colors if needed
    const color =
      TREE_LEVEL_COLORS[multiplicityIndex % TREE_LEVEL_COLORS.length];

    const jIndex = jIndices.findIndex(
      (_jIndex) => _jIndex === multiplicityIndex,
    );
    const frequency = lodashGet(spectrumData, 'info.originFrequency', 0);

    const coupling =
      jIndex >= 0 && frequency > 0 && signal.js[jIndex]
        ? signal.js[jIndex].coupling / frequency // convert to ppm
        : null;

    // in case of "s": no coupling constant and build one tree node only
    if (!coupling) {
      treeNodesData.push({
        startX,
        _startX: startX,
        ratio: 1,
        multiplicityIndex,
        color,
      });
      // go to next multiplet in multiplicity string
      buildTreeNodesData(
        multiplicityIndex + 1,
        jIndices,
        treeNodesData,
        startX,
      );
    } else {
      // in case of other multiplets
      const pascal = getPascal(
        getMultiplicityNumber(signal.multiplicity.charAt(multiplicityIndex)),
        0.5,
      ); // @TODO for now we use the default spin of 1 / 2 only

      let _startX =
        pascal.length % 2 === 0
          ? startX - (pascal.length / 2) * coupling + coupling / 2 // in case of even number of nodes
          : startX - (pascal.length / 2 - 0.5) * coupling; // in case of odd number of nodes

      pascal.forEach((ratio, k) => {
        if (k > 0) {
          _startX += coupling;
        }
        treeNodesData.push({
          startX,
          _startX,
          ratio,
          multiplicityIndex,
          color,
        });
        // go to next multiplet in multiplicity string
        buildTreeNodesData(
          multiplicityIndex + 1,
          jIndices,
          treeNodesData,
          _startX,
        );
      });
    }

    return treeNodesData;
  }
  return buildTreeNodesData;
}

export default createTreeNodes;
