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
import React, { useState, useEffect } from 'react';

// reactstrap components
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap';

// core components
import PanelHeader from '../components/PanelHeader/PanelHeader.jsx';
import SpectrumChart from '../../component/SpectrumChart.jsx';
import { Data1DManager } from '../../data/Data1DManager.js';
import {COLORS} from '../../component/utility/ColorGenerator.js';

const width = 800;
const height = 400;
const margin = { top: 10, right: 20, bottom: 30, left: 0 };

function loadData() {
  const Data1DManagerObj = new Data1DManager();

  return new Promise((resolve, reject) => {
    fetch('/cytisine/1H_Cytisin_600MHz-R+I.dx')
      .then((response) => checkStatus(response) && response.text())
      .then((buffer) => {
        let datumObject = Data1DManagerObj.fromJcamp(
          buffer,
          'test',
          COLORS[4],
          true,
          true,
        );
        // console.log(datumObject);

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

const Spectrum1H = (props) => {
  const [_data, setData] = useState();




  useEffect(() => {
    loadData().then((d) => {

     console.log(d);
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
                <p className="category">1H spectrum test</p>
              </CardHeader>
              <CardBody>
                <SpectrumChart
                  width={width}
                  height={height}
                  data={_data}
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

export default Spectrum1H;
