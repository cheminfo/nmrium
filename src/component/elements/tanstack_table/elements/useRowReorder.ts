import type {
  Edge,
  ElementDropTargetEventBasePayload,
} from '@zakodium/pdnd-esm';
import {
  attachClosestEdge,
  combine,
  draggable,
  dropTargetForElements,
  extractClosestEdge,
  getReorderDestinationIndex,
} from '@zakodium/pdnd-esm';
import { useEffect, useRef, useState } from 'react';

import type {
  TanStackRowData,
  TanStackTableReorderEvent,
  TanStackTableRow,
} from '../types.ts';

export function useRowReorder<TData extends TanStackRowData>(
  row: TanStackTableRow<TData>,
  onReorder: TanStackTableReorderEvent<TData>['onReorder'],
) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isReorderActive = typeof onReorder === 'function';
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const element = rowRef.current;
    const dragHandle = handleRef.current;
    if (!element || !dragHandle || !onReorder) return;

    const data = { id: row.id, index: row.index, row: row.original };

    function canDrop({
      source,
    }: {
      source: { data: Record<string, unknown> };
    }) {
      return source.data.id !== data.id;
    }

    function handleDrag({
      source,
      self,
    }: ElementDropTargetEventBasePayload): void {
      if (source.element === element) {
        setClosestEdge(null);
        return;
      }
      const edge = extractClosestEdge(self.data);
      const targetIndex = getReorderDestinationIndex({
        startIndex: source.data.index as number,
        indexOfTarget: data.index,
        closestEdgeOfTarget: edge,
        axis: 'vertical',
      });
      setClosestEdge(targetIndex === source.data.index ? null : edge);
    }

    return combine(
      draggable({
        element,
        dragHandle,
        getInitialData: () => data,
        onGenerateDragPreview() {
          element.style.backgroundColor = '#e8f3f9';
        },
        onDragStart() {
          element.style.removeProperty('background-color');
          setIsDragging(true);
        },
        onDrop() {
          element.style.removeProperty('background-color');
          setIsDragging(false);
        },
      }),
      dropTargetForElements({
        element,
        canDrop,
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDrag: handleDrag,
        onDragLeave() {
          setClosestEdge(null);
        },
        onDrop({ location, source }) {
          const target = location.current.dropTargets[0];
          if (!target) return;

          const edge = extractClosestEdge(target.data);
          const targetIndex = getReorderDestinationIndex({
            startIndex: source.data.index as number,
            indexOfTarget: target.data.index as number,
            closestEdgeOfTarget: edge,
            axis: 'vertical',
          });
          setClosestEdge(null);
          if (targetIndex !== source.data.index) {
            onReorder(
              source.data.index as number,
              targetIndex,
              source.data.row as TData,
              target.data.row as TData,
            );
          }
        },
      }),
    );
  }, [onReorder, row.id, row.index, row.original]);

  return { rowRef, handleRef, isReorderActive, isDragging, closestEdge };
}
