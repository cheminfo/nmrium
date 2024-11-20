/** @jsxImportSource @emotion/react */
import { Icon, Tag } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type {
  CSSProperties,
  HTMLAttributes,
  HTMLProps,
  MouseEvent,
  ReactNode,
} from 'react';
import { createContext, useContext, useMemo } from 'react';

interface SelectionsContextState {
  overflow: boolean;
  renderActiveSectionContentOnly: boolean;
  matchContentHeight: boolean;
}

const selectionState: SelectionsContextState = {
  overflow: false,
  renderActiveSectionContentOnly: false,
  matchContentHeight: false,
};

const SectionsContext = createContext<SelectionsContextState>(selectionState);

export function useSections() {
  const context = useContext(SectionsContext);

  if (!context) {
    throw new Error('Section context was not found');
  }
  return context;
}

interface ActiveProps {
  isOpen: boolean;
  overflow?: boolean;
}

const Container = styled.div<{
  overflow: boolean;
  matchContentHeight: boolean;
}>(
  ({ overflow, matchContentHeight }) => `
  width: 100%;
  height: ${matchContentHeight ? 'auto' : '100%'};
  display: flex;
  flex-direction: column;
  overflow: ${overflow ? 'auto' : 'hidden'};
  border: 1px solid #ddd;
`,
);

const SectionWrapper = styled.div<
  ActiveProps & { matchContentHeight: boolean }
>(
  ({ isOpen, overflow, matchContentHeight }) => `
  display: flex;
  flex-direction: column;
  flex:none;
  flex: ${isOpen && !matchContentHeight ? (overflow ? '1' : overflow ? '1' : '1 1 1px') : 'none'};
`,
);

const Active = styled(Tag)<ActiveProps>(
  ({ isOpen }) => `
background-color: ${isOpen ? '#4CAF50' : '#ccc'};
color: ${isOpen ? 'white' : 'black'};
margin-right: 10px;
flex-shrink: 0;
`,
);

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  flex-grow: 1;
`;

const Title = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  font-weight: 500;
`;

const OpenIcon = styled(Icon)<ActiveProps>`
  transform: ${({ isOpen }) => (isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
  margin-left: 10px;
`;

const ContentWrapper = styled.div<ActiveProps>(
  ({ isOpen, overflow }) => `
  background-color: white;
  display: ${isOpen ? 'flex' : 'none'};
  flex: ${isOpen ? (overflow ? '1' : '1 1 1px') : 'none'};
  max-height: 100%;
  flex-direction:column;
`,
);
const Content = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 10px;
`;
const ElementsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #f5f5f5;

  &:hover {
    background-color: #e0e0e0;
  }

  &:active {
    background-color: #d0d0d0;
  }
`;

const InnerHeader = styled.div`
  padding: 5px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  border-top: 1px solid #ddd;
`;

interface BaseSectionProps {
  title: string;
  serial?: number;
  rightElement?: ReactNode | ((isOpen) => ReactNode);
  leftElement?: ReactNode | ((isOpen) => ReactNode);
  headerStyle?: CSSProperties;
  arrowProps?: { style?: CSSProperties; hide?: boolean };
}

interface SectionItemProps extends BaseSectionProps {
  id?: string;
  onClick?: (id, event?: MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode | ((options: { isOpen?: boolean }) => ReactNode);
  isOpen: boolean;
  sticky?: boolean;
}

interface SectionProps {
  children?: ReactNode;
  overflow?: boolean;
  renderActiveSectionContentOnly?: boolean;
  matchContentHeight?: boolean;
}

export function Sections(props: SectionProps) {
  const {
    children,
    overflow = false,
    renderActiveSectionContentOnly = false,
    matchContentHeight = false,
  } = props;

  const state = useMemo(() => {
    return { overflow, renderActiveSectionContentOnly, matchContentHeight };
  }, [overflow, renderActiveSectionContentOnly, matchContentHeight]);
  return (
    <SectionsContext.Provider value={state}>
      <Container overflow={overflow} matchContentHeight={matchContentHeight}>
        {children}
      </Container>
    </SectionsContext.Provider>
  );
}

function SectionHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { children, ...otherProps } = props;
  return <InnerHeader {...otherProps}>{children}</InnerHeader>;
}

function SectionBody(props: HTMLAttributes<HTMLDivElement>) {
  const { children, ...otherProps } = props;

  return <Content {...otherProps}>{children}</Content>;
}

function SectionItem(props: SectionItemProps) {
  const {
    id = props.title,
    title,
    onClick,
    serial,
    rightElement,
    leftElement,
    children,
    headerStyle,
    isOpen,
    sticky = false,
    arrowProps = { hide: false, style: {} },
  } = props;

  const { overflow, matchContentHeight } = useSections();

  return (
    <SectionWrapper
      isOpen={isOpen}
      overflow={overflow}
      matchContentHeight={matchContentHeight}
    >
      <MainSectionHeader
        title={title}
        isOpen={isOpen}
        onClick={(event) => onClick?.(id, event)}
        serial={serial}
        rightElement={rightElement}
        leftElement={leftElement}
        headerStyle={headerStyle}
        sticky={sticky}
        arrowProps={arrowProps}
      />
      <Wrapper isOpen={isOpen}>{children}</Wrapper>
    </SectionWrapper>
  );
}

interface WrapperProps {
  children: ReactNode | ((options: { isOpen?: boolean }) => ReactNode);
  isOpen: boolean;
}

function Wrapper(props: WrapperProps) {
  const { overflow, renderActiveSectionContentOnly } = useSections();

  const { children, isOpen } = props;

  if (renderActiveSectionContentOnly && !isOpen) {
    return null;
  }

  return (
    <ContentWrapper isOpen={isOpen} overflow={overflow}>
      {typeof children === 'function' ? children({ isOpen }) : children}
    </ContentWrapper>
  );
}

interface MainSectionHeaderProps
  extends Pick<HTMLProps<HTMLDivElement>, 'onClick'>,
    BaseSectionProps {
  isOpen: boolean;
  sticky: boolean;
}

function MainSectionHeader(props: MainSectionHeaderProps) {
  const {
    title,
    isOpen = false,
    onClick,
    serial,
    rightElement,
    leftElement,
    headerStyle = {},
    sticky,
    arrowProps,
  } = props;
  return (
    <Header
      onClick={onClick}
      style={{
        ...headerStyle,
        ...(sticky && {
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }),
      }}
    >
      <TitleContainer>
        {typeof serial === 'number' && (
          <Active round isOpen={isOpen}>
            {serial}
          </Active>
        )}
        <ElementsContainer onClick={(event) => event.stopPropagation()}>
          {typeof leftElement === 'function'
            ? leftElement(isOpen)
            : leftElement}
        </ElementsContainer>
        <Title>{title}</Title>
      </TitleContainer>
      <ElementsContainer>
        <ElementsContainer onClick={(event) => event.stopPropagation()}>
          {typeof rightElement === 'function'
            ? rightElement(isOpen)
            : rightElement}
        </ElementsContainer>
        {!arrowProps?.hide && (
          <OpenIcon
            icon="chevron-right"
            isOpen={isOpen}
            style={arrowProps?.style}
          />
        )}
      </ElementsContainer>
    </Header>
  );
}

Sections.Header = SectionHeader;
Sections.Body = SectionBody;
Sections.Item = SectionItem;
