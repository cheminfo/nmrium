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
import getKey from '../../component/utility/KeyGenerator';
import getColor from '../../component/utility/ColorGenerator';
import ClipLoader from 'react-spinners/ClipLoader';

// core components
import PanelHeader from '../components/PanelHeader/PanelHeader.jsx';
import { Data1DManager } from '../../data/Data1DManager.js';
import SpectrumChart from '../../component/SpectrumChart.jsx';
const width = 800;
const height = 400;
const margin = { top: 10, right: 20, bottom: 30, left: 0 };
const jcampFiles = [
  {fileName:'108-21-4.13c-coupled',label:"13C coupled"},
  {fileName:'108-21-4.13c-decoupled',label:"13C decoupled"},
];
async function loadData() {
  const Data1DManagerObj = new Data1DManager();

  try {
    for (let i = 0; i < jcampFiles.length; i++) {
      const key = getKey();
      const usedColors = Data1DManagerObj.getXYData().map((d) => d.color);
      const color = getColor(usedColors);
      const result = await fetch(`/${jcampFiles[i].fileName}.jdx`).then(
        (response) => checkStatus(response) && response.text(),
      );

      // console.log(buffer);
      let datumObject = Data1DManagerObj.fromJcamp(
        `${key}`,
        result,
        jcampFiles[i].label,
        color,
        true,
        true,
      );
      Data1DManagerObj.pushDatum1D(datumObject);
    }
  } catch (e) {}
  const xyData = Data1DManagerObj.getXYData();
  console.log(xyData);
  return xyData;

  // Never forget the final catch!
}
function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

const CoupledDecoupled13C = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    loadData().then((d) => {
      setData(d);
      setIsLoading(false);

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
                <p className="category">XTC </p>
              </CardHeader>
              <CardBody>
                <ClipLoader
                  css={{position:"absolute",left:((width)/2.5),top:((height+150)/2)}}
                  sizeUnit={'px'}
                  size={30}
                  color={'#2ca8ff'}
                  loading={isLoading}
                />
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

export default CoupledDecoupled13C;
