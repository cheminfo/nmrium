import { lazy, memo } from 'react';

export const possibleViews = {
  AuoProcessingView: memo(lazy(() => import('./AuoProcessingView.js'))),
  BenchtopNMRWorkspace: memo(lazy(() => import('./BenchtopNMRWorkspace.js'))),
  CustomWorkspace: memo(lazy(() => import('./CustomWorkspace.js'))),
  Exam: memo(lazy(() => import('./Exam.js'))),
  Exercise: memo(lazy(() => import('./Exercise.js'))),
  Prediction: memo(lazy(() => import('./Prediction.js'))),
  RefAPI: memo(lazy(() => import('./RefAPI.js'))),
  Simulation: memo(lazy(() => import('./Simulation.js'))),
  SingleView: memo(lazy(() => import('./SingleView.js'))),
  SnapshotView: memo(lazy(() => import('./SnapshotView.js'))),
  Teaching: memo(lazy(() => import('./Teaching.js'))),
  Test: memo(lazy(() => import('./Test.js'))),
  TwoInstances: memo(lazy(() => import('./TwoInstances.js'))),
  View: memo(lazy(() => import('./View.js'))),
  WebSourceView: memo(lazy(() => import('./WebSourceView.js'))),
  PluginUITopBar: memo(lazy(() => import('./PluginUITopBar.js'))),
};
