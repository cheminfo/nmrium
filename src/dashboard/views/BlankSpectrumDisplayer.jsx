import React, { useState, useEffect } from 'react';

// reactstrap components
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap';

// core components
import PanelHeader from '../components/PanelHeader/PanelHeader.jsx';
import NMRDisplayer from '../../component/NMRDisplayer.jsx';
import { Analysis } from '../../data/Analysis.js';

const BlankSpectrumDisplayer = () => {
  const [data, setData] = useState();

  useEffect(() => {
    Analysis.build(data).then((obj) => {
      setData(obj);
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
                <NMRDisplayer data={data} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default BlankSpectrumDisplayer;
