/*!

=========================================================
* Now UI Dashboard React - v1.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/now-ui-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/now-ui-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect, useState } from 'react';

// reactstrap components
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap';

// core components
import PanelHeader from '../components/PanelHeader/PanelHeader.jsx';
import c13 from '../../samples/13C_Cytisin_600.dx';
import getColor from '../../component/utility/ColorGenerator.js';
import { Data1DManager } from '../../data/Data1DManager.js';
import SpectrumChart from '../../component/SpectrumChart.jsx';
const width = 800;
const height = 400;
const margin = { top: 10, right: 20, bottom: 30, left: 0 };

function loadData() {
  const Data1DManagerObj = new Data1DManager();

  return new Promise((resolve, reject) => {
    fetch('/cytisine/13C_Cytisin_600_fid.dx')
      .then((response) => checkStatus(response) && response.text())
      .then((buffer) => {
        // console.log(buffer);
        let datumObject = Data1DManagerObj.fromJcamp(
          '12154545113318888',
          buffer,
          'test',
          'red',
          true,
          true,
        );
        Data1DManagerObj.pushDatum1D(datumObject);

        const xyData = Data1DManagerObj.getXYData();
        // console.log(xyData);
        resolve(xyData);
      })
      .catch((err) => {
        reject(err);
        console.error(err);
      }); // Never forget the final catch!
  });
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

const Spectrum13C = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    loadData().then((d) => {
      setData(d);
    });
  }, []);

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>
                <h5 className="title">NMR Displayer</h5>
                <p className="category">13C Spectrum</p>
              </CardHeader>
              <CardBody>
                <SpectrumChart
                  width={width}
                  height={height}
                  data={data}
                  margin={margin}
                  mode="RTL"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Spectrum13C;
