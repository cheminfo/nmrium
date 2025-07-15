import type { ElementDropTargetEventBasePayload } from '@atlaskit/pragmatic-drag-and-drop/dist/types/adapter/element-adapter.js';
import type { ElementDragPayload } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types.js';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { Colors, Icon, Tag } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type {
  CSSProperties,
  HTMLAttributes,
  HTMLProps,
  MouseEvent,
  ReactNode,
} from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { assert } from '../utility/assert.js';

import {
  attachClosestEdge,
  combine,
  draggable,
  dropTargetForElements,
  extractClosestEdge,
  getReorderDestinationIndex,
  pointerOutsideOfPreview,
  setCustomNativeDragPreview,
} from './pdnd.cjs';

interface DropIndicatorProps {
  edge: Edge;
}

const DropIndicator = styled.div<DropIndicatorProps>`
  position: absolute;
  z-index: 3;
  background-color: ${Colors.BLUE3};
  height: 2px;
  left: 0;
  right: 0;
  pointer-events: none;
  ${(props) => props.edge === 'top' && 'top: -1px;'}
  ${(props) => props.edge === 'bottom' && 'bottom: -1px;'}
`;

const Preview = styled.div`
  padding-block: 4px;
  padding-inline: 8px;
  border-radius: 4px;
  background-color: #f4f5f7;
  max-width: 360px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

type DraggableState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'dragging' };

const idleState: DraggableState = { type: 'idle' };
const draggingState: DraggableState = { type: 'dragging' };

interface SelectionsContextState {
  isOverflow: boolean;
  renderActiveSectionContentOnly: boolean;
  matchContentHeight: boolean;
}

const selectionState: SelectionsContextState = {
  isOverflow: false,
  renderActiveSectionContentOnly: false,
  matchContentHeight: false,
};

const SectionsContext = createContext<SelectionsContextState>(selectionState);

function useSections() {
  const context = useContext(SectionsContext);

  if (!context) {
    throw new Error('Section context was not found');
  }
  return context;
}

interface ActiveProps {
  isOpen: boolean;
  isOverflow?: boolean;
}

const Container = styled.div<{
  isOverflow: boolean;
  matchContentHeight: boolean;
}>(
  ({ isOverflow, matchContentHeight }) => `
  width: 100%;
  height: ${matchContentHeight ? 'auto' : '100%'};
  display: flex;
  flex-direction: column;
  overflow: ${isOverflow ? 'auto' : 'hidden'};
  border: 1px solid #ddd;
`,
);

const SectionWrapper = styled.div<
  ActiveProps & { matchContentHeight: boolean }
>(
  ({ isOpen, isOverflow, matchContentHeight }) => `
  display: flex;
  flex-direction: column;
  flex:none;
  flex: ${isOpen && !matchContentHeight ? (isOverflow ? '1' : isOverflow ? '1' : '1 1 1px') : 'none'};
`,
);

const Active = styled(Tag, {
  shouldForwardProp: (propName) => {
    return propName !== 'isOpen';
  },
})<ActiveProps>(
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

const OpenIcon = styled(Icon, {
  shouldForwardProp: (propName) => {
    return propName !== 'isOpen';
  },
})<ActiveProps>`
  transform: ${({ isOpen }) => (isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
  margin-left: 10px;
`;

const ContentWrapper = styled.div<ActiveProps>(
  ({ isOpen, isOverflow }) => `
  background-color: white;
  display: ${isOpen ? 'flex' : 'none'};
  flex: ${isOpen ? (isOverflow ? '1' : '1 1 1px') : 'none'};
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
  position: relative;
  z-index: 0;
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
  rightElement?: ReactNode | ((isOpen: boolean) => ReactNode);
  leftElement?: ReactNode | ((isOpen: boolean) => ReactNode);
  headerStyle?: CSSProperties;
  arrowProps?: { style?: CSSProperties; hide?: boolean };
}

interface SectionItemProps extends BaseSectionProps {
  id?: string;
  index?: number;
  onClick?: (id, event?: MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode | ((options: { isOpen?: boolean }) => ReactNode);
  isOpen: boolean;
  sticky?: boolean;
  onReorder?: (sourceId: number, targetId: number) => void;
  dragLabel?: string;
}

interface SectionProps {
  children?: ReactNode;
  isOverflow?: boolean;
  renderActiveSectionContentOnly?: boolean;
  matchContentHeight?: boolean;
}

export function Sections(props: SectionProps) {
  const {
    children,
    isOverflow = false,
    renderActiveSectionContentOnly = false,
    matchContentHeight = false,
  } = props;

  const state = useMemo(() => {
    return { isOverflow, renderActiveSectionContentOnly, matchContentHeight };
  }, [isOverflow, renderActiveSectionContentOnly, matchContentHeight]);
  return (
    <SectionsContext.Provider value={state}>
      <Container
        isOverflow={isOverflow}
        matchContentHeight={matchContentHeight}
      >
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
    dragLabel = props.title,
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
    onReorder,
    index,
  } = props;

  const { isOverflow, matchContentHeight } = useSections();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<DraggableState>(idleState);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const isReorderActive = typeof onReorder === 'function';

  useEffect(() => {
    const dragHandle = handleRef.current;
    const element = wrapperRef.current;
    if (!element || !dragHandle || !isReorderActive) return;

    const data = { id, index };

    function canDrop({ source }: { source: ElementDragPayload }): boolean {
      return source.data.id !== id;
    }

    function dragHandler({ source, self }: ElementDropTargetEventBasePayload) {
      const isSource = source.element === dragHandle;
      if (isSource) {
        // eslint-disable-next-line react-you-might-not-need-an-effect/no-chain-state-updates
        setClosestEdge(null);
        return;
      }

      const closestEdge = extractClosestEdge(self.data);

      const sourceIndex = source.data.index as number;
      assert(typeof sourceIndex === 'number', 'index is not defined');
      const isItemBeforeSource = index === sourceIndex - 1;
      const isItemAfterSource = index === sourceIndex + 1;

      const isDropIndicatorHidden =
        (isItemBeforeSource && closestEdge === 'bottom') ||
        (isItemAfterSource && closestEdge === 'top');

      setClosestEdge(isDropIndicatorHidden ? null : closestEdge);
    }

    const cleanDrag = combine(
      draggable({
        element,
        dragHandle,
        getInitialData: () => data,
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: '8px',
              y: '8px',
            }),
            render({ container }) {
              setState({ type: 'preview', container });

              return () => setState(draggingState);
            },
          });
        },
        onDragStart() {
          setState(draggingState);
        },
        onDrop() {
          setState(idleState);
        },
      }),
      dropTargetForElements({
        element,
        canDrop,
        getIsSticky: () => false,
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDrag: dragHandler,

        onDragLeave() {
          setClosestEdge(null);
        },
        onDrop() {
          setClosestEdge(null);
        },
      }),
    );

    return () => {
      cleanDrag();
    };
  }, [id, index, isReorderActive]);
  return (
    <DroppableSectionWrapper
      key={id}
      id={id}
      onReorder={onReorder}
      index={index}
    >
      <div
        style={{
          position: 'relative',
          opacity: state && state.type === 'dragging' ? 0.3 : 1,
        }}
        ref={wrapperRef}
      >
        <SectionWrapper
          isOpen={isOpen}
          isOverflow={isOverflow}
          matchContentHeight={matchContentHeight}
        >
          <MainSectionHeader
            title={title}
            isOpen={isOpen}
            onClick={(event) => onClick?.(id, event)}
            serial={serial}
            rightElement={rightElement}
            dragHandleElement={
              typeof onReorder === 'function' && (
                <div
                  ref={handleRef}
                  onClick={(e) => e.stopPropagation()}
                  style={{ cursor: 'grab' }}
                >
                  <Icon icon="drag-handle-vertical" />
                </div>
              )
            }
            leftElement={leftElement}
            headerStyle={headerStyle}
            sticky={sticky}
            arrowProps={arrowProps}
          />
          <Wrapper isOpen={isOpen}>{children}</Wrapper>
          {closestEdge && <DropIndicator edge={closestEdge} />}
        </SectionWrapper>
        {state.type === 'preview' &&
          createPortal(<Preview>{dragLabel}</Preview>, state.container)}
      </div>
    </DroppableSectionWrapper>
  );
}

interface WrapperProps {
  children: ReactNode | ((options: { isOpen?: boolean }) => ReactNode);
  isOpen: boolean;
}

function Wrapper(props: WrapperProps) {
  const { isOverflow, renderActiveSectionContentOnly } = useSections();

  const { children, isOpen } = props;

  if (renderActiveSectionContentOnly && !isOpen) {
    return null;
  }

  return (
    <ContentWrapper isOpen={isOpen} isOverflow={isOverflow}>
      {typeof children === 'function' ? children({ isOpen }) : children}
    </ContentWrapper>
  );
}

interface MainSectionHeaderProps
  extends Pick<HTMLProps<HTMLDivElement>, 'onClick'>,
    BaseSectionProps {
  isOpen: boolean;
  sticky: boolean;
  dragHandleElement?: ReactNode;
}

function MainSectionHeader(props: MainSectionHeaderProps) {
  const {
    title,
    isOpen = false,
    onClick,
    serial,
    rightElement,
    dragHandleElement,
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
          {dragHandleElement}
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

interface DroppableProps
  extends Pick<SectionItemProps, 'id' | 'onReorder' | 'index'> {
  children: ReactNode;
}

function DroppableSectionWrapper(props: DroppableProps) {
  const { id, onReorder, index: indexOfTarget, children } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof onReorder !== 'function') return;

    const element = ref.current;

    if (!element) return;

    return dropTargetForElements({
      element,
      onDrop: ({ location, source }) => {
        const { index: startIndex } = source.data;
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        if (
          typeof startIndex !== 'number' ||
          typeof indexOfTarget !== 'number'
        ) {
          return;
        }

        const targetData = target.data;
        const closestEdgeOfTarget = extractClosestEdge(targetData);

        const finishIndex = getReorderDestinationIndex({
          startIndex,
          closestEdgeOfTarget,
          indexOfTarget,
          axis: 'vertical',
        });

        if (finishIndex === startIndex) {
          // If there would be no change, we skip the update
          return;
        }

        onReorder?.(startIndex, finishIndex);
      },
    });
  }, [id, indexOfTarget, onReorder]);

  return (
    <div ref={ref} data-drop-id={id}>
      {children}
    </div>
  );
}

Sections.Header = SectionHeader;
Sections.Body = SectionBody;
Sections.Item = SectionItem;
