import type { CSSProperties, MouseEvent, ReactNode, WheelEvent } from 'react';

import type { EventModifierKeys } from '../context/KeyModifierContext.tsx';

export type AdvanceOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;
type Step = 'initial' | 'start' | 'end' | 'brushing';

export interface BrushCoordination {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
}

export interface BrushTrackerData extends EventModifierKeys, BrushCoordination {
  step: Step;
  mouseButton: MouseButton;
}

export type MouseButton = 'main' | 'secondary' | 'unknown';

interface BrushScreenCoordination {
  startScreenX: number;
  startScreenY: number;
  startClientX: number;
  startClientY: number;
}

export interface BrushTrackerState
  extends BrushTrackerData, BrushScreenCoordination {
  step: Step;
  boundingRect: DOMRect | null;
}

export interface Position {
  x: number;
  y: number;
}

export type ClickOptions = MouseEvent & Position;
export type OnClick = (element: ClickOptions) => void;
export type OnDoubleClick = OnClick;
export type ZoomOptions = Pick<
  WheelEvent,
  'deltaY' | 'shiftKey' | 'deltaMode' | 'altKey' | 'deltaX' | 'ctrlKey'
> &
  Position & { invertScroll?: boolean; isBidirectionalZoom: boolean };
export type OnZoom = (options: ZoomOptions) => void;
export type OnBrush = (state: BrushTrackerData) => void;
export type OnBrushEnd = OnBrush;

export type BaseDetectBrushingOptions = AdvanceOmit<
  DetectBrushingOptions,
  'width' | 'height'
>;

export interface BrushTrackerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onBrushEnd?: OnBrushEnd;
  onBrush?: OnBrush;
  onZoom?: OnZoom;
  onDoubleClick?: OnDoubleClick;
  onClick?: OnClick;
  noPropagation?: boolean;
  brushDetectionOptions?: BaseDetectBrushingOptions;
  clickTriggerMode?: 'native' | 'debounced';
}

export type BrushAxis = 'X' | 'Y' | 'XY';
export type DetectBrushingOptions = {
  thresholdAxis?: BrushDetectionThresholdAxis;
} & (DetectBrushingThreshold | DetectBrushingThresholdSize);
export interface DetectBrushingResult extends BrushCoordination {
  type: BrushAxis;
  scaleX: number;
  scaleY: number;
  directionX: number;
  directionY: number;
  xThreshold: number;
  yThreshold: number;
}

interface DetectBrushingThreshold {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /**
   * Threshold as a percentage of width and height (value between 0 and 1).
   * @default 0.02
   */
  threshold?: number;
  thresholdFormat: 'relative';
}

interface DetectBrushingThresholdSize {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /**
   * Threshold size in pixels.
   * @default 80
   */
  thresholdSize?: number;
  thresholdFormat: 'fixed';
}

type BrushDetectionThresholdAxis = 'both' | 'x' | 'y';
