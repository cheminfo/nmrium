import { lazy, memo } from 'react';

export const possibleViews = {
  AuoProcessingView: memo(lazy(() => import('./AuoProcessingView'))),
  BenchtopNMRWorkspace: memo(lazy(() => import('./BenchtopNMRWorkspace'))),
  CustomWorkspace: memo(lazy(() => import('./CustomWorkspace'))),
  Exam: memo(lazy(() => import('./Exam'))),
  Exercise: memo(lazy(() => import('./Exercise'))),
  Prediction: memo(lazy(() => import('./Prediction'))),
  RefAPI: memo(lazy(() => import('./RefAPI'))),
  Simulation: memo(lazy(() => import('./Simulation'))),
  SingleView: memo(lazy(() => import('./SingleView'))),
  SnapshotView: memo(lazy(() => import('./SnapshotView'))),
  Teaching: memo(lazy(() => import('./Teaching'))),
  Test: memo(lazy(() => import('./Test'))),
  TwoInstances: memo(lazy(() => import('./TwoInstances'))),
  View: memo(lazy(() => import('./View'))),
  WebSourceView: memo(lazy(() => import('./WebSourceView'))),
};
