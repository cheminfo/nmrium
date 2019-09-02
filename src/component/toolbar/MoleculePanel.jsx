import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SmilesSvgRenderer  } from 'react-ocl';

import StructureEditor from 'openchemlib';

import { FaPlus, FaPaste } from 'react-icons/fa';

import '../css/molecule.css';
import { Button, Tooltip } from '@material-ui/core';
// import { SVGRenderer } from 'openchemlib/types';

const initialMolfile = `
Actelion Java MolfileCreator 1.0
  6  5  0  0  0  0  0  0  0  0999 V2000
    3.4641   -0.5000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.5981   -0.0000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.7321   -0.5000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.7321   -1.5000   -0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.8660   -0.0000   -0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -0.5000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  0  0  0  0
  3  2  1  0  0  0  0
  4  3  2  0  0  0  0
  5  3  1  0  0  0  0
  6  5  1  0  0  0  0
M  END
`;
const MoleculePanel = () => {
  const refMoleculeEditor = useRef();

  const [molfile, setMolfile] = useState(initialMolfile);

  const cb = useCallback(
    (newMolfile) => {
      setMolfile(newMolfile);
    },
    [setMolfile],
  );

  return (
    <div className="molecule-container">
      <div className="molecule-toolbar">
        <Tooltip title="Past Molecule" placement="left-start">
          <Button>
            <FaPaste />
          </Button>
        </Tooltip>
        <Tooltip title="Add Molecule" placement="left-start">
          <Button>
            <FaPlus />
          </Button>
        </Tooltip>
      </div>
      <div className="molecule-body">
       <SmilesSvgRenderer smiles="COCCOOOCO" />
          {/* <StructureEditor
          initialMolfile={molfile}
           svgMenu={true}
           fragment={false}
           onChange={cb}
         /> */}
      </div>
    </div>
  );
};

export default MoleculePanel;

    
