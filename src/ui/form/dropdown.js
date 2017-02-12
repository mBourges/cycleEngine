import xs from 'xstream';
import { div, label, input, span, i } from '@cycle/dom';
import isolate from '@cycle/isolate';
import delay from 'xstream/extra/delay';

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
    label: '', //props.sources.filter(opt => opt.value === props.value).map(opt => opt.label),//getLabelFromSource(props.sources, props.value),
    value: props.value
  }));

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

  const dropdownClick$ = DOM.select('.dropdown').events('click')
    .mapTo(true)
    .startWith(false);

  const bodyStopCondition$ = xs.merge(
    DOM.select('.item').events('click'),
    DOM.select('body').events('click').drop(1).compose(delay(100))
  );



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

  const sources$ = props.map(props => props.sources).flatten()
    .map(options => options.map(formatOptions))
    // .startWith([])
    // .debug('SOURCES sources$')
    //.map(props => props.sources.map(formatOptions)).flatten().debug('SOURCES sources$')


  const component$ = xs.combine(dropdownStatus$, animating$, value$, sources$)
    .map(([isOpen, isAnimating, selected, sources]) => {
      return div('.ui.selection.dropdown', {
      class: {
        active: isOpen,
        visible: isOpen
      }
    }, [
      i('.dropdown.icon'),
      div('.text', {
        class: { default: !selected.label }
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

export const dropdown_ = (sources, props) => isolate(dropdownComponent)(sources, props);
