// import {spectrumReducer} from './reducer';
// import {historyReducer} from './undo-reducer';




const CombineReducers = (reducer)  =>{
  return (state = {}, action) => {
    console.log(state);
    const keys = Object.keys(reducer);
    const nextReducers = {};
    for (let i = 0; i < keys.length; i++) {
      const invoke = reducer[keys[i]](state[keys[i]], action);
      nextReducers[keys[i]] = invoke;
    }
    return nextReducers;
  };
};


  // console.log(combineReducers);

  export default CombineReducers;