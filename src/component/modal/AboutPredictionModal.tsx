/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaInfo } from 'react-icons/fa';
import { Modal, useOnOff } from 'react-science/ui';

import Button from '../elements/Button';

const styles = css`
  width: 600px;

  .content {
    padding: 2em;
  }

  ul {
    list-style-type: disc;
    margin-left: 25px;
  }

  p,
  li {
    user-select: text;
    font-size: 1.1em;
  }

  a {
    color: #00bcd4;
  }

  a:hover,
  a:focus {
    text-decoration: underline;
  }

  .header span {
    color: #464646;
    font-size: 15px;
    flex: 1;
    user-select: none;
  }

  p {
    padding: 0.8em 0;
  }
`;

function AboutPredictionModal() {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  return (
    <>
      <Button.BarButton
        onClick={openDialog}
        tooltipOrientation="horizontal"
        toolTip="About Prediction"
      >
        <FaInfo />
      </Button.BarButton>
      <Modal hasCloseButton isOpen={isOpenDialog} onRequestClose={closeDialog}>
        <div css={styles}>
          <Modal.Header>
            <div className="header">
              <span>About Prediction</span>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="content">
              <p>If you are using our tools please cite us:</p>
              <ul>
                <li>
                  Damiano Banfi and Luc Patiny{' '}
                  <a
                    href="http://dx.doi.org/10.2533/chimia.2008.280"
                    target="_blank"
                    rel="noreferrer"
                  >
                    www.nmrdb.org: Resurrecting and processing NMR spectra
                    on-line
                  </a>{' '}
                  <i>Chimia</i>, <b>2008</b>, 62(4), 280-281.
                </li>
                <li>
                  Andrés M. Castillo, Luc Patiny and Julien Wist{' '}
                  <a
                    href="http://dx.doi.org/10.1016/j.jmr.2010.12.008"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Fast and Accurate Algorithm for the Simulation of NMR
                    spectra of Large Spin Systems
                  </a>{' '}
                  <i>Journal of Magnetic Resonance</i> <b>2011</b>, 209(2),
                  123-130.
                </li>
              </ul>
              <p>
                <sup>1</sup>H NMR prediction is possible thanks to the tool of
                the FCT-Universidade NOVA de Lisboa developed by Yuri Binev and
                Joao Aires-de-Sousa:
              </p>
              <ul>
                <li>
                  Yuri Binev, Maria M. B. Marques and João Aires-de-Sousa{' '}
                  <a
                    href="http://dx.doi.org/10.1021/ci700172n"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Prediction of <sup>1</sup>H NMR coupling constants with
                    associative neural networks trained for chemical shifts
                  </a>{' '}
                  <i>J. Chem. Inf. Model.</i> <b>2007</b>, 47(6), 2089-2097.
                </li>
                <li>
                  João Aires-de-Sousa, Markus C. Hemmer and Johann Gasteiger{' '}
                  <a
                    href="http://dx.doi.org/10.1021/ac010737m"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Prediction of <sup>1</sup>H NMR Chemical Shifts Using Neural
                    Networks
                  </a>
                  , <i>Analytical Chemistry</i>, <b>2002</b>, 74(1), 80-90.
                </li>
              </ul>
              <p>
                <sup>13</sup>C NMR prediction was possible thanks to NMRshiftDB:
              </p>
              <ul>
                <li>
                  Steinbeck, Christoph, Stefan Krause, and Stefan Kuhn{' '}
                  <a
                    href="http://dx.doi.org/10.1021/ci0341363"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NMRShiftDB Constructing a Free Chemical Information System
                    with Open-Source Components
                  </a>{' '}
                  <i>Journal of chemical information and computer sciences</i>,{' '}
                  <b>2003</b>, 43(6): 1733-1739.
                </li>
              </ul>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
}

export default AboutPredictionModal;
