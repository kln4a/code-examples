import Vue from 'vue';
import Wrapper from './AutoLightWrapper.vue';
import prepareFilters from './filterData';

const AutoLight = (parameters) => {
  const { tabs, transitions } = parameters;
  if (tabs) {
    Object.keys(tabs).forEach((key) => {
      const tab = tabs[key];
      const { items, filters: filtersSource } = tab;
      const multiple = !Array.isArray(items);
      const filters = prepareFilters(
        filtersSource,
        items,
        multiple,
      );
      new Vue({
        el: `#${tab.id}`,
        render: h =>
          h(Wrapper, {
            props: {
              multiple,
              tabData: {
                ...tab,
                ...{
                  filters,
                },
              },
              transitionsData: transitions,
            },
          }),
      });
    });
  }
};

window.warModules.AutoLight = AutoLight;
export default {};
