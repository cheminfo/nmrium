import React, { useState, useEffect, useContext } from 'react';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../elements/Table';
// import { ChartContext } from '../context/ChartContext';
// import { fromJcamp } from '../../data/data1d/Data1DManager';

const styles = {
  input: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '',
    height: '14px',
  },
};

const filter = (input) => {
  let escaped = input.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
  let regexp = new RegExp(escaped, 'i');
  let tableContent = document
    .getElementById('FilterAndInformationContainer')
    .getElementsByClassName('InformationContainer')
    ['0'].getElementsByClassName('Information');

  for (let content of tableContent) {
    // check the property string only
    let labelContent = content.children[0].innerHTML;
    if (labelContent.match(regexp)) {
      content.style.display = 'flex';
    } else {
      content.style.display = 'none';
    }
  }
};

// dummy
const initialStateInformation = () => {
  return {
    date: '01.11.2019',
    size: '1024',
    nuclei: '1H, 13C',
    test1: 'Hello',
    test2: 'Hello2',
    test3: 'this is a looooooooooooooooooooooooooong text',
    test4:
      'this is a looooooooooooooooooooooooooooooooooooooooooooooooooooooonger text',
  };
};

const InformationPanel = () => {
  //   const { activeSpectrum } = useContext(ChartContext);
  const [information, setInformation] = useState(initialStateInformation);
  const [searchSequence, setSearchSequence] = useState('');

  //   useEffect(() => {
  //     // @TODO update information from belonging active spectrum and its Datum1D object here
  //   }, [activeSpectrum, information]);

  return (
    // activeSpectrum &&
    information && (
      <div id="FilterAndInformationContainer">
        <div />
        <div style={styles}>
          <input
            type="text"
            value={searchSequence}
            onChange={(e) => {
              setSearchSequence(e.target.value);
              filter(e.target.value);
            }}
          />
        </div>
        <div className="InformationContainer">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">label</TableCell>
                <TableCell align="center">value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(information).map((key) => (
                <TableRow key={key} className="Information">
                  <TableCell align="left">{key}</TableCell>
                  <TableCell align="left">{information[key]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  );
};

export default InformationPanel;
