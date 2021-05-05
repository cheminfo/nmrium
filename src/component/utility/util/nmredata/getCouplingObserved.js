export function getCouplingObserved(experiment) {
  switch (experiment.toLowerCase()) {
    case 'hsqc':
    case 'cosy':
      return '1J';
    case 'hmbc':
      return 'NJ';
    default:
      return 'NJ';
  }
}
