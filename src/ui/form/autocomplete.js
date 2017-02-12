import xs from 'xstream';
import { div, input, i } from '@cycle/dom';
import isolate from '@cycle/isolate';
import './style.scss';
import delay from 'xstream/extra/delay';

function filterOptions(sources, searchText) {
  console.log(sources, searchText)
  const regexp = new RegExp(searchText, 'i');
  return searchText !== '' ? sources.filter(val => regexp.test(val.label)) : sources.slice(0, 20);
}

function formatOptions(item) {
  return div('.item', {
    attrs: {
      'data-value': item.value,
      'data-label': item.label
    }
  }, item.label);
}

function getLabelFromSource(sources, value) {
  const option = sources.find(option => option.value === value);

  return option ? option.label : undefined;
}

function dropdownComponent({ DOM }, props = xs.of({})) {
  const defaultValue$ = props.map(props => ({
    name: props.name,
    label: '', //getLabelFromSource(props.sources, props.value),
    value: props.value
  }));

  const searchInput$ = DOM.select('input.search').events('input')
    .map(event => event.target.value !== '')
    .startWith(false);

  const optionClick$ = DOM.select('.item').events('click')
    .debug(event => {
      event.stopPropagation();
      event.preventDefault();
    });

  const valueClick$ = xs.combine(props, optionClick$)
    .map(([props, event]) => ({
      name: props.name,
      label: event.target.dataset.label,
      value: event.target.dataset.value
    }));

  const value$ = xs.merge(
    defaultValue$,
    valueClick$
  ).remember().debug('VALUE');

  const dropdownClick$ = xs.merge(
    DOM.select('input.search').events('click').mapTo(true),
    DOM.select('input.search').events('blur').compose(delay(200)).mapTo(false)
  ).startWith(false);

  const bodyStopCondition$ = xs.merge(
    DOM.select('.item').events('click'),
    DOM.select('body').events('click').drop(1).compose(delay(100))
  );

  const resetInput$ = xs.merge(
    DOM.select('input.search').events('input').mapTo(true),
    DOM.select('input.search').events('blur').compose(delay(200)).debug(event => event.target.value = '').mapTo(false)
  )
  // optionClick$ )

  //.mapTo(true)
.debug('RESET').startWith(false);

  /*const selectedValueClick$ = DOM.select('.item').events('click')
    .debug(event => {
      event.stopPropagation();
      event.preventDefault();
    });*/



  const bodyClick$ = DOM.select('body').events('click').drop(1)
    .mapTo(false)
    .endWhen(bodyStopCondition$);

  const closeDropDown$ = DOM.select('.dropdown').events('click')
    .mapTo(bodyClick$)
    .flatten();

  const dropdownStatus$ = xs.merge(
    dropdownClick$,
    optionClick$.mapTo(false),
    closeDropDown$
  );

  const animating$ = dropdownStatus$.compose(delay(200)).startWith(false);

 /* const value$ = xs.merge(
    props.map(props => props.defaultValue || {}),
    selectedValueClick$.map(event=> event.target.dataset)
  ).startWith({})*/

  const sources$ = xs.combine(
    props.map(props => props.sources).flatten(),
    xs.merge(
      DOM.select('input.search').events('input').map(event => event.target.value).startWith(''),
      DOM.select('input.search').events('blur').compose(delay(200)).mapTo('')
    )
  ).map(([options, searchText]) => filterOptions(options, searchText))
  .map(filtered => filtered.map(formatOptions))
  .startWith([]);


  const component$ = xs.combine(dropdownStatus$, animating$, value$, sources$, searchInput$, resetInput$)
    .map(([isOpen, isAnimating, selected, sources, searchInput, resetInput]) => {
      return div('.ui.selection.dropdown.search', {
      class: {
        active: isOpen,
        visible: isOpen
      }
    }, [
      i('.dropdown.icon'),
      input('.search'),
      div('.text.search__text', {
        class: {
          default: !selected.label,
          filtered: searchInput && resetInput
        }
      }, selected.label || 'Gender'),
      div('.menu.transition.animating.slide.down',
        { class: {
          hidden: !isAnimating,
          visible: isOpen || isAnimating,
          in: isOpen,
          out: !isOpen
        } },
        sources
      )
    ])
  })

    return {
      DOM: component$,
      value$
    }
}

export const autocomplete_ = (sources, props) => isolate(dropdownComponent)(sources, props);
