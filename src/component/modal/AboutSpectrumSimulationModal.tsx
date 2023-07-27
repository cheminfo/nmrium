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

function AboutSpectrumSimulationModal() {
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
              <span>About spectrum simulation</span>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="content">
              <p>If you are using our tools please cite us:</p>
              <ul>
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
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
}

export default AboutSpectrumSimulationModal;
