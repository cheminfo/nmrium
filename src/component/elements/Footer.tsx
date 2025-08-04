import styled from '@emotion/styled';
import type { CSSProperties, ReactNode } from 'react';

const FooterContainer = styled.div`
  position: absolute;
  bottom: 0;
  align-items: center;
  background-color: #f7f7f7;
  color: #8d0018;
  container-type: inline-size;
  display: flex;
  height: 30px;
  padding: 6px;
  user-select: none;
  width: 100%;
`;

interface InfoContainerProps {
  /** Whether to auto-hide the element based on threshold (default: `false`) */
  autoHide?: boolean;
  /** Hide threshold in pixel (default: `600`) */
  hideThreshold?: number;
  /** The  display property (default: `'inline-block'`) */
  display?: CSSProperties['display'];
}

const InfoContainer = styled.div<InfoContainerProps>`
  display: ${({ display = 'inline-block' }) => display};
  margin: 0 10px;

  @container (max-width:${({ hideThreshold = 600 }) => hideThreshold}px) {
    display: ${({ autoHide = false, display = 'inline-block' }) =>
      autoHide ? 'none' : display};
  }
`;

interface InfoItemProps extends InfoContainerProps {
  children: ReactNode;
  className?: string;
}

function InfoItem(props: InfoItemProps) {
  const {
    children,
    autoHide = false,
    display = 'inline-block',
    className,
    hideThreshold,
  } = props;
  return (
    <InfoContainer
      autoHide={autoHide}
      display={display}
      className={className}
      hideThreshold={hideThreshold}
    >
      {children}
    </InfoContainer>
  );
}

const Span = styled.span`
  font-weight: bold;
`;

InfoItem.Label = styled(Span)`
  color: #4d4d4d;
  font-size: 12px;
`;

InfoItem.Value = styled(Span)`
  display: inline-block;
  font-size: 14px;
`;

InfoItem.Unit = styled(Span)`
  font-size: 10px;
`;

export { FooterContainer, InfoItem };
