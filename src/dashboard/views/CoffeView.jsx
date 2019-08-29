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
  'coffee/coffee_1198',
  'coffee/coffee_1199',
  'coffee/coffee_1208',
  'coffee/coffee_1241',
  'coffee/coffee_1246',
  'coffee/coffee_1307',
  'coffee/coffee_1309',
  'coffee/coffee_1310',
  'coffee/coffee_1316',
  'coffee/coffee_1317',
  'coffee/coffee_1318',
  'coffee/coffee_1319',
  'coffee/coffee_1321',
];
async function loadData() {
  let data1d = [];
  try {
    for (let i = 0; i < jcampFiles.length; i++) {
      const usedColors = data1d.map((d) => d.display && d.display.color);
      const color = getColor(usedColors);
      const result = await fetch(`/${jcampFiles[i]}.jdx`).then(
        (response) => checkStatus(response) && response.text(),
      );

      let datumObject = Data1DManager.fromJcamp(result, {
        display: {
          name: `coffee ${i + 1}`,
          color: color,
          isVisible: true,
          isPeaksMarkersVisible: true,
        },
      });

      data1d.push(datumObject.toJSON());
    }
  } catch (e) {
    console.log(e);
  }

  return data1d;

  // Never forget the final catch!
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

const CoffeView = () => {
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
                <p className="category">Coffee </p>
              </CardHeader>
              <CardBody>
                <ClipLoader
                  css={{
                    position: 'absolute',
                    left: width / 2.5,
                    top: (height + 150) / 2,
                  }}
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
                  stackedMode={true}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CoffeView;
