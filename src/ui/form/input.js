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
  const defaultValue$ = props.map(props => ({
    name: props.name,
    value: props.value
  }));

  const input$ = DOM.select('.inputField').events('input');
  const inputValue$ = input$.map(event => ({
    name: event.target.name,
    value: event.target.value
  }));
  const value$ = xs.merge(defaultValue$, inputValue$);

  const checkErrors$ = xs.combine(props, input$)
      .map(([props, event]) => checkInputErrors(props.checkError, event.target.value));
  const hasError$ = xs.merge(initialErrorCheck$, checkErrors$);

  const component$ = xs.combine(props, hasError$)
    .map(([props, errors]) => div('.field.', { class: {
      required: props.required,
      error: errors
    } }, [
      input('.inputField', {
        props: {
          name: props.name,
          type: props.type || 'text',
          defaultValue: props.value || '',
          required: props.required,
          autofocus: !!props.autofocus,
          placeholder: props.placeholder || ''
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
