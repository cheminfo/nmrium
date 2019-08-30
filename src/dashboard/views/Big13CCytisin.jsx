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
import NMRDisplayer from '../../component/NMRDisplayer.jsx';
import { Analysis } from '../../data/Analysis.js';
const width = 800;
const height = 400;
const margin = { top: 10, right: 20, bottom: 30, left: 0 };

function loadData() {
  return new Promise((resolve, reject) => {
    fetch('/json-files/CoupledDecoupled13C.json')
      .then((response) => checkStatus(response) && response.json())
      .then((data) => {
        Analysis.build(data).then((obj) => {
          resolve(obj);
        });
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

const Big13CCytisin = () => {
  const [data, setData] = useState();
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
                <p className="category">Big 13C</p>
              </CardHeader>
              <CardBody>
                <NMRDisplayer
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

export default Big13CCytisin;
