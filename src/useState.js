import { useReducer, useRef, useMemo } from 'react';
import { isFunction } from './utils';
import { useCache } from './useCache';

function stateReducer(state, newState) {
  return isFunction(newState) ? newState(state) : { ...state, ...newState };
}

export function useState({ initialState, onClear, onReset }) {
  const state = useRef();
  const events = useRef();
  const initialValues = useCache();
  const [values, setValues] = useReducer(stateReducer, initialState || {});
  const [touched, setTouched] = useReducer(stateReducer, {});
  const [validity, setValidity] = useReducer(stateReducer, {});
  const [errors, setError] = useReducer(stateReducer, {});

  events.current = { onClear, onReset };
  state.current = { values, touched, validity, errors };

  const controls = useMemo(() => {
    function setField(name, value, inputValidity, inputTouched, inputError) {
      setValues({ [name]: value });
      setTouched({ [name]: inputTouched });
      setValidity({ [name]: inputValidity });
      setError({ [name]: inputError });
    }

    const clearField = name => setField(name);
    const resetField = name => setField(name, initialValues.get(name));
    return {
      clearField,
      resetField,

      clear() {
        Object.keys(state.current.values).forEach(clearField);
        events.current.onClear();
      },
      reset() {
        Object.keys(state.current.values).forEach(resetField);
        events.current.onReset();
      },
      setField(name, value) {
        setField(name, value, true, true);
      },
      setFieldError(name, error) {
        setValidity({ [name]: false });
        setError({ [name]: error });
      },
    };
  }, []);

  return {
    /**
     * @type {{ values, touched, validity, errors }}
     */
    get current() {
      return state.current;
    },
    setValues,
    setTouched,
    setValidity,
    setError,
    initialValues,
    controls,
  };
}
