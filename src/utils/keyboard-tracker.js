import keyboardJS from 'keyboardjs';
import { changeKeyboardButtonState } from "reducers/keyboard";

const prefixCombinationCreator = (prefix) => {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  return (combination) => {
    const combinations = Array.isArray(combination) ? combination : [combination];
    const conjunction = [];

    for(let i=0; i < prefixes.length; i++) {
      for(let j=0; j< combinations.length; j++) {
        conjunction.push(prefixes[i]+" + "+combinations[j]);
      }
    }

    return conjunction;
  }
};

const trackButtonPinch = (buttonName, alias, dispatch) => {
  keyboardJS.bind(buttonName, function(e) {
    console.log(alias+' is pressed');
    dispatch(changeKeyboardButtonState({button: alias, state: true}));
  }, function(e) {
    console.log(alias+' is released');
    dispatch(changeKeyboardButtonState({button: alias, state: false}));
  });
};

const createKeyboardTracker = (store) => {
  const {dispatch} = store;
  const controls = ['ctrl', 'command'];
  const shiftName = "shift";
  const altName = "alt";
  const spaceName = "space";
  const createMultiplatformCombination  = prefixCombinationCreator(controls);
  const cmc = createMultiplatformCombination;

  trackButtonPinch(controls, "control", dispatch);
  trackButtonPinch(shiftName, shiftName, dispatch);
  trackButtonPinch(altName, altName, dispatch);
  trackButtonPinch(spaceName, spaceName, dispatch);

  keyboardJS.bind(cmc("z"), function(e) {
    e.preventDefault();
    console.log('undo');
  });

  keyboardJS.bind(cmc("shift + z"), function(e) {
    e.preventDefault();
    console.log('redo');
  });

  keyboardJS.bind(cmc("s"), function(e) {
    e.preventDefault();
    console.log('save');
  });
};

export default createKeyboardTracker;
