import type { ButtonProps } from '@blueprintjs/core';
import { Button, DialogBody, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { StandardDialog } from './StandardDialog.tsx';

const Message = styled.p`
  color: #af0000;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
`;

const Footer = styled(DialogFooter)`
  button {
    margin: 0 3px;
  }

  button:first-of-type {
    margin-right: 0;
  }

  button:last-of-type {
    margin-left: 0;
  }
`;

const ButtonsGroup = styled.div`
  display: flex;
  flex-direction: row-reverse;
`;

const Body = styled(DialogBody)`
  background-color: white;
  padding: 25px;

  p {
    margin: 0;
  }
`;

const Alert = styled(StandardDialog)`
  border-top: 10px solid rgb(237 0 0);
`;

export interface AlertButton extends ButtonProps {
  text: ReactNode;
  preventClose?: boolean;
}

interface AlertConfig {
  message: ReactNode;
  buttons: AlertButton[];
  onClose?: () => void;
}

interface AlertItem extends AlertConfig {
  id: string;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('Alert context was not found');
  }
  return context;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  function hideAlert(id: string) {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  }

  const alertState = useMemo(() => {
    function showAlert(config: AlertConfig) {
      const id = crypto.randomUUID();
      setAlerts((prevAlerts) => [...prevAlerts, { id, ...config }]);
    }

    return { showAlert };
  }, []);

  return (
    <>
      <Alerts alerts={alerts} onHide={hideAlert} />
      <AlertContext.Provider value={alertState}>
        {children}
      </AlertContext.Provider>
    </>
  );
}

interface AlertsProps {
  onHide: (id: string) => void;
  alerts: AlertItem[];
}

function Alerts(props: AlertsProps) {
  const { alerts, onHide } = props;

  function optionsHandler(e: React.MouseEvent, options: any) {
    const { onClick = () => null, preventClose = false, id } = options;
    onClick(e);
    e.stopPropagation();
    if (!preventClose) {
      onHide(id);
    }
  }

  return alerts.map(({ id, buttons, message, onClose }) => (
    <Alert
      key={id}
      isOpen
      onClose={() => {
        onHide(id);
        onClose?.();
      }}
      role="alertdialog"
    >
      <Body>
        <Message className="message">{message}</Message>
      </Body>
      <Footer>
        <ButtonsGroup>
          {buttons.map((item, index) => {
            const { text, onClick, preventClose, ...otherItemProps } = item;
            return (
              <Button
                key={index}
                onClick={(e) =>
                  optionsHandler(e, { onClick, preventClose, id })
                }
                {...otherItemProps}
              >
                {text}
              </Button>
            );
          })}
        </ButtonsGroup>
      </Footer>
    </Alert>
  ));
}
