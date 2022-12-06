import { lazy, memo } from 'react';

export const possibleViews = {
  Exam: memo(lazy(() => import('./Exam'))),
  Exercise: memo(lazy(() => import('./Exercise'))),
  SingleView: memo(lazy(() => import('./SingleView'))),
  Test: memo(lazy(() => import('./Test'))),
  View: memo(lazy(() => import('./View'))),
  TwoInstances: memo(lazy(() => import('./TwoInstances'))),
  Teaching: memo(lazy(() => import('./Teaching'))),
  Prediction: memo(lazy(() => import('./Prediction'))),
  CustomWorkspace: memo(lazy(() => import('./CustomWorkspace'))),
};
