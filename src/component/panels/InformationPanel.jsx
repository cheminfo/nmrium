import React, { useState, useCallback, useEffect } from 'react';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../elements/Table';
import { useChartData } from '../context/ChartContext';

const styles = {
  searchInput: {
    width: '100%',
    borderRadius: '5px',
    border: '0.55px solid gray',
    padding: '5px',
    marginBottom: '2px',
  },
};

// information panel
const InformationPanel = () => {
  const { data, activeSpectrum } = useChartData();
  const [information, setInformation] = useState([]);
  const [matches, setMatchesData] = useState([]);

  const handleSearch = useCallback(
    (input) => {
      const values = Object.keys(information).filter((key) =>
        key.toLowerCase().includes(input.target.value),
      );

      setMatchesData(values);
    },
    [information],
  );

  useEffect(() => {
    if (data && activeSpectrum) {
      const activeSpectrumData = data.find((d) => d.id === activeSpectrum.id);
      if (activeSpectrumData) {
        setInformation({
          ...activeSpectrumData.info,
          ...activeSpectrumData.meta,
        });
        setMatchesData([
          ...Object.keys(activeSpectrumData.info),
          ...Object.keys(activeSpectrumData.meta),
        ]);
      }
    }
  }, [activeSpectrum, data]);

  return (
    information && (
      <>
        <div>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search for parameter..."
            onChange={handleSearch}
          />
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell size={3}>Parameter</TableCell>
              <TableCell size={9}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((key) => (
              <TableRow key={key} className="Information">
                <TableCell size={3} align="left">
                  {key}
                </TableCell>
                <TableCell size={9} align="left" style={{ paddingLeft: 5 }}>
                  {`${information[key]}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    )
  );
};

export default InformationPanel;
