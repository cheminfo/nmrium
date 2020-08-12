import { jsx } from '@emotion/core';
/** @jsx jsx */
import { Provider as AlertProvider } from 'react-alert';

const AlertProviderWrapper = ({ alertTemplate, alertOptions, ...props }) => {
  return (
    <AlertProvider template={alertTemplate} {...alertOptions}>
      {props.children}
    </AlertProvider>
  );
};

export default AlertProviderWrapper;
