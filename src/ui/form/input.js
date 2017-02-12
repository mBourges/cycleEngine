import xs from 'xstream';
import { div, input } from '@cycle/dom';
import isolate from '@cycle/isolate';

function checkInputErrors(checkError, value = null) {
  return checkError ? checkError(value) : false;
}

function checkErrorFromProps(props) {
  return checkInputErrors(props.checkError, props.value);
}

function inputComponent({ DOM }, props = xs.of({})) {
  const initialErrorCheck$ = props.map(checkErrorFromProps);
  const defaultValue$ = props.map(currentProps => ({
    name: currentProps.name,
    value: currentProps.value
  }));

  const input$ = DOM.select('.inputField').events('input');
  const inputValue$ = input$.map(event => ({
    name: event.target.name,
    value: event.target.value
  }));
  const value$ = xs.merge(defaultValue$, inputValue$);

  const checkErrors$ = xs.combine(props, input$)
      .map(([currentProps, event]) => checkInputErrors(
        currentProps.checkError,
        event.target.value
      ));
  const hasError$ = xs.merge(initialErrorCheck$, checkErrors$);

  const component$ = xs.combine(props, hasError$)
    .map(([currentProps, errors]) => div('.field.', { class: {
      required: currentProps.required,
      error: errors
    } }, [
      input('.inputField', {
        props: {
          name: currentProps.name,
          type: currentProps.type || 'text',
          defaultValue: currentProps.value || '',
          required: currentProps.required,
          autofocus: !!currentProps.autofocus,
          placeholder: currentProps.placeholder || ''
        }
      })
    ]));

  return {
    DOM: component$,
    value$,
    hasError$
  };
}

export const field = (sources, props) => inputComponent(sources, props);
export const input_ = (sources, props) => isolate(inputComponent)(sources, props);
