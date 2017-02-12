import xs from 'xstream';
import { div, textarea, label } from '@cycle/dom';
import isolate from '@cycle/isolate';

function checkInputErrors(checkError, value = null) {
  return checkError ? checkError(value) : false;
}

function checkErrorFromProps(props) {
  return checkInputErrors(props.checkError, props.value);
}

function textAreaComponent({ DOM }, props = xs.of({})) {
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
      label(currentProps.label),
      textarea('.inputField', {
        props: {
          rows: 10,
          name: currentProps.name,
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

export const textAreaField = (sources, props) => textAreaComponent(sources, props);
export const textArea_ = (sources, props) => isolate(textAreaComponent)(sources, props);
