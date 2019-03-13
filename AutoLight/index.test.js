import { shallowMount } from '@vue/test-utils';
import prepareFilters from './filterData';
import AutoLight from './AutoLightWrapper.vue';

const ksFilter = {
  ks: { title: 'Ксенон', items: [8, 9] },
};

const testFiltersGroups = {
  all: { title: 'Все', items: [] },
  gal: { title: 'Галоген', items: [4, 5, 3] },
  ...ksFilter,
};

const testItemsGroups = [{
  header: 'Группа 1',
  items: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ],
},
{
  header: 'Группа 2',
  items: [
    { id: 1 },
    { id: 4 },
    { id: 5 },
  ],
}];

describe('Удаляет фильтры, которые не содержат данных в фильтруеммых группах', () => {
  it('2 стороны', () => {
    const testItems = {
      front: testItemsGroups,
      back: [],
    };
    const testFilters = {
      front: testFiltersGroups,
      back: {},
    };
    expect(prepareFilters(testFilters, testItems, true).front)
      .toEqual(expect.not.objectContaining(ksFilter));
  });

  it('1 сторона', () => {
    expect(prepareFilters(testFiltersGroups, testItemsGroups, false))
      .toEqual(expect.not.objectContaining(ksFilter));
  });
});

describe('AutoLightWrapper.vue', () => {
  const viewFront = 'смотреть переднюю часть';
  const viewBack = 'смотреть заднюю часть';
  const wrapper = shallowMount(AutoLight, {
    propsData: {
      multiple: true,
      tabData: {
        items: {
          front: [],
          back: [],
        },
        filters: {
          front: {},
          back: {},
        },
        image: {
          front: 'front.jpg',
          back: 'back.jpg',
        },
      },
      transitionsData: {
        viewBack,
        viewFront,
      },
    },
  });

  it('отображает кнопку 180 градусов', () => {
    expect(wrapper.find('button.lamp-wrapper__revert').exists()).toBeTruthy();
  });

  it('по умолчанию отображает надпись смотреть переднюю часть', () => {
    expect(wrapper.find('.lamp-wrapper__top-title').text()).toEqual(viewFront);
  });

  it('после нажатия на кнопку 180 отображает надпись смотреть заднюю часть', () => {
    wrapper.find('button.lamp-wrapper__revert').trigger('click');
    expect(wrapper.find('.lamp-wrapper__top-title').text()).toEqual(viewBack);
  });
});
