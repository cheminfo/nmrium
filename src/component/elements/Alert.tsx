/** @jsxImportSource @emotion/react */
import {
  Button,
  ButtonProps,
  Dialog,
  DialogBody,
  DialogFooter,
} from '@blueprintjs/core';
import styled from '@emotion/styled';
import { v4 } from '@lukeed/uuid';
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from 'react';

const Message = styled.p`
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  color: #af0000;
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

const Alert = styled(Dialog)`
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

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  function hideAlert(id: string) {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  }

  const alertState = useMemo(() => {
    function showAlert(config: AlertConfig) {
      const id = v4();
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
};

interface AlertsProps {
  onHide: (id: string) => void;
  alerts: AlertItem[];
}

function Alerts(props: AlertsProps) {
  const { alerts, onHide } = props;

  function optionsHandler(e: React.MouseEvent, options) {
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
