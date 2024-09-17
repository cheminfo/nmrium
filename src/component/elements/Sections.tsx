/** @jsxImportSource @emotion/react */
import { Icon, Tag } from '@blueprintjs/core';
import styled from '@emotion/styled';
import React, {
  createContext,
  CSSProperties,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

interface SelectionsContextState {
  overflow: boolean;
  renderActiveSectionContentOnly: boolean;
}

const selectionState: SelectionsContextState = {
  overflow: false,
  renderActiveSectionContentOnly: false,
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

const Container = styled.div<{ overflow: boolean }>(
  ({ overflow }) => `
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: ${overflow ? 'auto' : 'hidden'};
  border: 1px solid #ddd;
`,
);

const SectionWrapper = styled.div<ActiveProps>(
  ({ isOpen, overflow }) => `
  display: flex;
  flex-direction: column;
  flex: ${isOpen ? (overflow ? '1' : overflow ? '1' : '1 1 1px') : 'none'};
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
  // overflow: hidden;
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
const RightElementsContainer = styled.div`
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
  headerStyle?: CSSProperties;
}

interface SectionItemProps extends BaseSectionProps {
  id?: string;
  onClick?: (id, event?: React.MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode | ((options: { isOpen?: boolean }) => ReactNode);
  selectedSectionId?: string;
  sticky?: boolean;
}

interface SectionProps {
  children?: ReactNode;
  overflow?: boolean;
  renderActiveSectionContentOnly?: boolean;
}

export function Sections(props: SectionProps) {
  const {
    children,
    overflow = false,
    renderActiveSectionContentOnly = false,
  } = props;

  const state = useMemo(() => {
    return { overflow, renderActiveSectionContentOnly };
  }, [overflow, renderActiveSectionContentOnly]);
  return (
    <SectionsContext.Provider value={state}>
      <Container overflow={overflow}>{children}</Container>
    </SectionsContext.Provider>
  );
}

function SectionHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { children, ...otherProps } = props;
  return <InnerHeader {...otherProps}>{children}</InnerHeader>;
}

function SectionBody(props: React.HTMLAttributes<HTMLDivElement>) {
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
    children,
    selectedSectionId,
    headerStyle,
    sticky = false,
  } = props;

  const isOpen = selectedSectionId === id;
  const { overflow } = useSections();

  return (
    <SectionWrapper isOpen={isOpen} overflow={overflow}>
      <MainSectionHeader
        title={title}
        isOpen={isOpen}
        onClick={(event) => onClick?.(id, event)}
        serial={serial}
        rightElement={rightElement}
        headerStyle={headerStyle}
        sticky={sticky}
      />
      <Wrapper isOpen={isOpen} id={id} selectedSectionId={selectedSectionId}>
        {children}
      </Wrapper>
    </SectionWrapper>
  );
}

interface WrapperProps {
  children: ReactNode | ((options: { isOpen?: boolean }) => ReactNode);
  isOpen: boolean;
  id: string;
  selectedSectionId?: string;
}

function Wrapper(props: WrapperProps) {
  const { overflow, renderActiveSectionContentOnly } = useSections();

  const { children, isOpen, selectedSectionId, id } = props;

  if (renderActiveSectionContentOnly && id !== selectedSectionId) {
    return null;
  }

  return (
    <ContentWrapper isOpen={isOpen} overflow={overflow}>
      {typeof children === 'function' ? children({ isOpen }) : children}
    </ContentWrapper>
  );
}

interface MainSectionHeaderProps
  extends Pick<React.HTMLProps<HTMLDivElement>, 'onClick'>,
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
    headerStyle = {},
    sticky,
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
        <Active round isOpen={isOpen}>
          {serial}
        </Active>
        <Title>{title}</Title>
      </TitleContainer>
      <RightElementsContainer>
        <RightElementsContainer onClick={(event) => event.stopPropagation()}>
          {typeof rightElement === 'function'
            ? rightElement(isOpen)
            : rightElement}
        </RightElementsContainer>
        <OpenIcon icon="chevron-right" isOpen={isOpen} />
      </RightElementsContainer>
    </Header>
  );
}

Sections.Header = SectionHeader;
Sections.Body = SectionBody;
Sections.Item = SectionItem;
