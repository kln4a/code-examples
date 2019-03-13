import { props, pluck, concat, unnest, intersection, filter, map, merge } from 'ramda';

const filtersHandler = (filters, items) => merge({
  all: filters.all,
}, filter(
  filterContent => intersection(filterContent.items, items).length > 0,
  filters,
));

const prepareItems = (itemsStart, multiple) => {
  let items = itemsStart;
  if (multiple) {
    items = props(['front', 'back'], items);
    items = concat(items[0], items[1]);
  }
  return pluck('id')(unnest(pluck('items')(items)));
};

const prepareFilters = (filters, itemsSource, multiple) => {
  const items = prepareItems(itemsSource, multiple);
  if (multiple) {
    const filtersHandlerItems = f => filtersHandler(f, items);
    return map(filtersHandlerItems, filters);
  }
  return filtersHandler(filters, items);
};

export default prepareFilters;
