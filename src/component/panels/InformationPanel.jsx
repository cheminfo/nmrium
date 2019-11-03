import React, { useState } from 'react';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../elements/Table';
// import { ChartContext } from '../context/ChartContext';
// import { fromJcamp } from '../../data/data1d/Data1DManager';

// define styles for the search input field and table cells
const inputStyle = {
  width: '100%',
};
const tableCellStyle = {
  'text-align': 'left',
};
const tableCellStyleLeft = {
  ...tableCellStyle,
  width: '40%',
};
const tableCellStyleRight = {
  ...tableCellStyle,
  width: '60%',
};

// the filter function used for string matching in parameter list
const filter = (input) => {
  let escaped = input.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
  let regexp = new RegExp(escaped, 'i');
  let tableRows = document
    .getElementById('FilterAndInformationContainer')
    .getElementsByClassName('InformationContainer')
    ['0'].getElementsByClassName('Information');

  for (let row of tableRows) {
    // check the parameter string only
    let parameterString = row.children[0].innerHTML;
    if (parameterString.match(regexp)) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  }
};

// dummy object used until the info/meta data of an active spectrum can be received
const initialStateInformation = () => {
  return {
    date: '01.11.2019',
    size: '1024',
    nuclei: '1H, 13C',
    test1: 'Hello',
    test2: 'Hello2',
    longText: 'this is a looooooooooooooooooooooooooong text',
    longerText:
      'this is a looooooooooooooooooooooooooooooooooooooooooooooooooooooonger text',
  };
};

// information panel
const InformationPanel = () => {
  //   const { activeSpectrum } = useContext(ChartContext);
  const [information, setInformation] = useState(initialStateInformation);
  const [searchSequence, setSearchSequence] = useState('');

  //   useEffect(() => {
  //     // @TODO update information (info/meta) from belonging active spectrum and its Datum1D object here
  //   }, [activeSpectrum, information]);

  return (
    // activeSpectrum &&
    information && (
      <div id="FilterAndInformationContainer">
        <div id="FilterContainer" style={inputStyle}>
          <input
            type="text"
            style={inputStyle}
            placeholder="Search for parameter..."
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
                <TableCell style={tableCellStyleLeft}>Parameter</TableCell>
                <TableCell style={tableCellStyleRight}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(information).map((key) => (
                <TableRow key={key} className="Information">
                  <TableCell style={tableCellStyleLeft}>{key}</TableCell>
                  <TableCell style={tableCellStyleRight}>
                    {information[key]}
                  </TableCell>
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
