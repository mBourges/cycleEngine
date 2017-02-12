import xs from 'xstream';
import { div, form, label, h1, h4 } from '@cycle/dom';

import { input_, textArea_, dropdown_, autocomplete_} from '../ui/form';

function test(sources) {
  const inputComponent = input_(sources, xs.of({
    name: 'Name',
    placeholder: 'Name',
    required: true,
    checkError: value => value === '' || value === null
  }));

  const textAreaComponent = textArea_(sources, xs.of({
    name: 'Content',
    required: true,
    label: 'Content',
    checkError: value => value === '' || value === null
  }))

  const dropdownComponent = dropdown_(sources, xs.of({
    name: 'SchoolYear',
    value: '中4',
    sources: sources.picklistValues.select('SchoolYear')
  }));

  const autocompleteComponent = autocomplete_(sources, xs.of({
    name: 'GenderSearch',
    // value: 'other',
    sources: sources.picklistValues.select('Gender')
  }));

  const page$ = xs.combine(
    inputComponent.DOM,
    textAreaComponent.DOM,
    dropdownComponent.DOM,
    autocompleteComponent.DOM
  ).map(([inputDOM, textAreaDOM, dropdownDOM, autocompleteDOM]) => div(
      [ h1('Test')
      , form('.ui.form',
        [ h4('.ui.dividing.header', 'Form Test')
        , div('.field',
          [ label('Name')
          , inputDOM
          ])
        , textAreaDOM
        , div('.field',
          [ label('School Year')
          , dropdownDOM
          ])
        , div('.field',
          [ label('Gender')
          , autocompleteDOM
          ])
        ])
      ]
    ))

  xs.merge(
    inputComponent.value$,
    textAreaComponent.value$,
    dropdownComponent.value$,
    autocompleteComponent.value$
  ).addListener({
    next: i => console.log(i),
    error: err => console.error(err),
    complete: () => console.log('completed'),
  });

  return {
    DOM: page$ //xs.of(h1('Test'))
  }
}

export default test;
