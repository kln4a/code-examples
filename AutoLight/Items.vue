<template>
  <div class="lamp-wrapper__item">
    <ul class="lamp-type-list">
        <li class="lamp-type-list__item" v-for="(filter, filterIn) in filtersList" :key="filterIn">
          <input class="filter__radio" :name="filterName" v-model="active" type="radio" :id="`${filterName}_${filter.key}`" :value="filter.key">
          <label class="filter__label" :for="`${filterName}_${filter.key}`">{{filter.title}}</label>
        </li>
    </ul>
    <div class="tabs-block block-lamp" v-for="(section, sectionIn) in itemsList" :key="sectionIn">
      <h3 class="block-lamp__title">{{section.header}}</h3>
      <div class="block-lamp__list grid-lamp">
        <a v-bind:href="section.items[key].url" class="lamp__list-items grid-lamp__item" v-for="(key, index) in Object.keys(section.items)" :key="index">
          <span class="grid-lamp__item-title">{{section.items[key].text}}</span>
          <img class="grid-lamp__item-img" :src="section.items[key].img" :alt="key">
        </a>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Items',
  props: {
    info: Array,
    filters: Object,
    id: String,
    defaultFilter: String,
  },
  data() {
    return {
      active: this.defaultFilter,
    }
  },
  computed: {
    filtersList() {
      return Object.keys(this.filters).map(key => ({
        ...this.filters[key],
        ...{
          key,
        },
      }));
    },
    filterName() {
      return `filter_${this.id}`;
    },
    itemsList() {
      if (this.active === 'all') {
        return this.info;
      }
      const itemsFilter = Object.values(this.filters[this.active].items);
      const filtered = [];
      this.info.forEach(section => {
        const keysFiltered = Object.keys(section.items).filter(item => itemsFilter.includes(section.items[item].id));
        if (keysFiltered.length !== 0) {
          const itemsFiltered = keysFiltered.reduce((obj, key) => {
              obj[key] = section.items[key];
              return obj;
            }, {});
          if (Object.keys(itemsFiltered).length > 0) {
            filtered.push({
              ...section,
              items: itemsFiltered,
            });
          }
        }
      });
      return filtered;
    }
  },
}
</script>
