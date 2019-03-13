<template>
  <div class="multiselect" :style="{ minHeight: `${minHeight}px` }">
    <div class="multiselect__area multiselect__area_choise">
      <div class="multiselect__search-wrapper">
        <input type="text" :placeholder="textSearch" class="multiselect__filter" v-model="search">
        <button type="button" v-if="search" @click="clearSearchInput" class="multiselect__active multiselect__active_clear" title="clear">
            <svg class="multiselect__button-icon">
              <use xlink:href="/_sysimg/svg/ui.svg#x"></use>
            </svg>
          </button>
      </div>
      <ul ref="listOptions" class="multiselect__list" v-show="!loading">
        <li :class="getItemClass(item[itemKey])" 
          :key="index" 
          v-for="(item, index) in uncheckedValues" 
          @click="addToCheckList(item[itemKey])"
        >
          <VRuntimeTemplate class="multiselect__choose-value" :data="item" :dataTemplate="itemTemplate" />
          <button type="button" class="multiselect__active multiselect__active_item" @click.stop="addToCheckList(item[itemKey])">
              <svg class="multiselect__button-icon">
                <use xlink:href="/_sysimg/svg/ui.svg#arrow-right"></use>
              </svg>
            </button>
        </li>
        <div class="multiselect__more-loader" v-if="loadingMore"></div>
      </ul>
      <div class="multiselect__list multiselect__list_loader" v-show="loading">
        <Loader />
      </div>
    </div>
    <div class="multiselect__area">
      <label class="multiselect__label" for="multiselect__select--block">{{textSelect}}:</label>
      <ul class="multiselect__list multiselect__list_checked">
        <li :class="getItemClass(item[itemKey])" 
          :key="index" v-for="(item, index) in checkedList"
          @click="removeFromCheckList(item[itemKey])"
        >
          <VRuntimeTemplate class="multiselect__choose-value" :data="item" :dataTemplate="itemTemplate" />
          <button type="button" class="multiselect__active multiselect__active_item" @click.stop="removeFromCheckList(item[itemKey])">
              <svg class="multiselect__button-icon multiselect__button-icon_small">
                <use xlink:href="/_sysimg/svg/ui.svg#x"></use>
              </svg>
            </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { pathOr, concat, find, findIndex, propEq, compose, contains, filter, map } from 'ramda';
  import debounce from 'lodash-es/debounce';
  import throttle from 'lodash-es/throttle';
  import Loader from './Loader.vue';
  import VRuntimeTemplate from "./VueRuntimeRender";
  import { unionWith, prop, eqBy } from 'ramda';

  export default {
    name: "Multiselect",
    components: {
      Loader,
      VRuntimeTemplate,
    },
    props: {
      // массив для рендера опций на старте
      // ajax: список уже отмеченных позиций
      // multiple select: список спарсенных значений
      options: {
        type: Array,
        checked: true,
        default: () => [],
      },
      textSearch: {
        type: String,
        checked: true,
      },
      textSelect: {
        type: String,
        checked: true,
      },
      checked: { // массив отмеченных объектов
        type: Array,
        default: () => [],
      },
      selectOptionHandler: { // функция вызываемая при выборе
        type: Function,
        checked: true,
        default: () => {},
      },
      unSelectOptionHandler: { // функция вызываемая при снятии выбора
        type: Function,
        checked: true,
        default: () => {},
      },
      ajaxControl: {
        type: Boolean,
        default: false,
        checked: false,
      },
      // уникальный ключ для идентификатора объекта в списке (ключ для idшника)
      itemKey: {
        type: String,
        default: 'key',
      },
      // url адрес для работы с апи
      apiUrl: {
        type: String,
        default: '',
        checked: false,
      },
      filterBy: {
        type: String,
        default: '',
        checked: false,
      },
      // шаблон отображения строки в селекте в vue формате шаблонизации
      itemTemplate: {
        type: String,
        default: `{{value}}`,
        checked: true,
      },
      // кол-во значений при запросе 
      rowsOnPage: {
        type: Number,
        default: 100
      },
      // ключ для значения все, при его выделении очищает список ранее выбранных значений
      allValueKey: {
        type: String,
        default: '',
      },
      minHeight: {
        type: Number,
        default: 0,
      }
    },
    data() {
      return {
        search: '',
        loading: false, //общий индикатор загрузки
        loadingMore: false, // индикатор подгрузки данных
        ajaxOptions: [],
        rows: 100,
        checkedList: [],
        totalCount: 0,
      }
    },
    created() {
      if (this.ajaxControl) {
        this.$watch('search', debounce(function query(query = '') {
            this.loadQueryOptions(query);
          },
          300,
        ));
      }
      const inChecked = (item) => contains(item, this.checked);
      this.checkedList = filter(compose(inChecked, prop(this.itemKey)), this.options);
    },
    mounted() {
      const heightSize = 200;
      if (this.ajaxControl) {
        // загрузка данных только когда приложение в области видимости 
        if (!('IntersectionObserver' in window)) {
          this.loadQueryOptions();
        } else {
          const observer = new IntersectionObserver((e) => {
            if (e[0].isIntersecting || e[0].intersectionRatio > 0) {
              this.loadQueryOptions();
              observer.disconnect();
            }
          }, {
            rootMargin: '0px 0px 30% 0px',
            threshold: 0.5,
          });
          observer.observe(this.$el);
        }

        // подгрузка данных в списке
        this.$refs.listOptions.addEventListener('scroll', throttle((e) => {
          const o = e.target;
          if (o.scrollHeight > o.offsetHeight) {
            const cof = 0.3;
            const cofHeight = o.scrollHeight * (1 - cof);
            if (o.offsetHeight + o.scrollTop > cofHeight) {
              this.loadMoreOptions();
            }
          }
        },
        500
        ));
        this.minHeight = heightSize;
      } else {
        let mounetdHeight = this.$el.offsetHeight;
        if (mounetdHeight < heightSize) {
          if (this.checked.length > 0) {
            mounetdHeight += 20;
          }
          this.minHeight = mounetdHeight;
        }
      }
    },
    computed: {
      renderOptions() {
        if (this.ajaxControl) {
          return unionWith(eqBy(prop(this.itemKey)), this.options, this.ajaxOptions);
        }
        return this.options;
      },
      uncheckedValues() {
        const checkedKeys = map(prop(this.itemKey), this.checkedList);
        const inChecked = (item) => !contains(prop(this.itemKey, item), checkedKeys);
        const unchecked = filter(inChecked, this.renderOptions);
        if (!this.ajaxControl && this.search.length >= 2) {
          return unchecked.filter((option) => option.value.toLowerCase().indexOf(this.search.toLowerCase()) >= 0);
        }
        return unchecked;
      },
      itemRuntimeTemplate() {
        return `<span>${this.itemTemplate}</span>`;
      }
    },
    methods: {
      async loadQueryOptions(query = '') {
        let urlParams = new URLSearchParams();
        if (query) urlParams.set(`filterBy${this.filterBy}`, query);
        urlParams.set('showCount', 1);
        this.$refs.listOptions.scrollTop = 0;
        this.ajaxOptions = await this.loadAjaxOptions(urlParams);
      },
      async loadMoreOptions() {
        if (this.loadingMore) return;
        let urlParams = new URLSearchParams();
        const length = this.ajaxOptions.length;
        if (this.totalCount > length) {
          urlParams.set('page', Math.ceil(length / this.rowsOnPage) + 1);
        } else {
          return;
        }
        if (this.search) urlParams.set(`filterBy${this.filterBy}`, this.search);
        const data = await this.loadAjaxOptions(urlParams, 'loadingMore');
        this.ajaxOptions = concat(this.ajaxOptions, data);
      },
      async loadAjaxOptions(urlParams = new URLSearchParams(), loader = 'loading') {
        this[loader] = true;
        urlParams.set('rows', this.rowsOnPage);
        try {
          const response = await this.fetchData(urlParams, true);
          const xTotalCount = response.headers.get("X-Total-Count");
          if (xTotalCount) this.totalCount = Number(xTotalCount);
          const data = await response.json();
          return pathOr([], ['data'], data);
        } catch(e) {
          console.warn(e);
        } finally {
          this[loader] = false;
        }
      },
      async fetchData(urlParams, start) {
        const params = urlParams.toString();
        const url = `${this.apiUrl}${params ? `?${params}` : ''}`;
        return await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });
      },
      addToCheckList(key) {
        if (this.allValueKey) {
          if (this.allValueKey === key) {
            this.clearCheckList();
          } else if(this.checkedList.length === 1) {
            this.removeFromCheckList(this.allValueKey);
          }
        }
        const checkedItem = find(propEq(this.itemKey, key), this.uncheckedValues);
        if (checkedItem) {
          this.checkedList.push(checkedItem);
        }
        if (this.selectOptionHandler) {
          this.selectOptionHandler(key);
        }
      },
      removeFromCheckList(key) {
        const checkedItemIndex = findIndex(propEq(this.itemKey, key), this.checkedList);
        if (checkedItemIndex !== -1) {
          this.checkedList.splice(checkedItemIndex, 1);
        }
        if (this.unSelectOptionHandler) {
          this.unSelectOptionHandler(key);
        }
      },
      clearSearchInput() {
        this.search = '';
      },
      clearCheckList() {
        this.checkedList.forEach(checked => this.unSelectOptionHandler(checked[this.itemKey]));
        this.checkedList = [];
      },
      getItemClass(key) {
        return {
          multiselect__item: true,
          multiselect__item_all: key === this.allValueKey
        };
      }
      
    },
  };
</script>

<style lang="less" scoped>
  @import "../../../less/_admin/const.less";

  .multiselect {
    display: flex;
    max-height: 200px;
    font-size: 11px;
    line-height: 13px;
    @color-border: #a79f8d;

    &__area {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 245px;
      background-color: #fff;
      border: 1px solid @color-border;
      border-radius: 4px;
    }

    &__area_choise {
      margin-right: 10px;
    }

    &__filter {
      box-sizing: border-box;
      width: 100%;
      height: 22px;
      padding: 0 22px 0 16px;
      border: none;
    }

    &__list {
      margin: 0;
      padding: 8px;
      overflow: auto;
      list-style-type: none;

      &_loader {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }

    &__active {
      padding: 0;
      background-color: transparent;
      border: none;
      cursor: pointer;

      &_item {
        flex-shrink: 0;
        width: 18px;
        height: 16px;
        border-radius: 4px;
        visibility: hidden;

        &:hover {
          background-color: #fff;
        }
      }
      // кнопка очистки в строке поиска
      &_clear {
        position: absolute;
        top: 50%;
        right: 8px;
        width: 10px;
        height: 10px;
        margin-top: -5px;
      }
    }

    &__button-icon {
      width: 70%;
      height: 70%;
      fill: #000;

      &_small {
        height: 7px;
      }
    }

    &__item_all &__active {
      margin-left: 2px;
      background-color: transparent;
      visibility: visible;

      &:hover {
        background-color: transparent;
      }
    }

    &__item {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 18px;
      padding: 0 2px 0 8px;
      overflow: hidden;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.1s linear;

      &:hover {
        background-color: #c8c8c8;

        .multiselect__active {
          visibility: visible;
        }
      }
    }

    &__item_all {
      justify-content: center;
      border: 1px solid #000;

      &:hover {
        color: #fff;
        background-color: #000;

        .multiselect__button-icon {
          fill: #fff;
        }
      }
    }

    &__choose-value {
      overflow: hidden;
      white-space: nowrap;
      text-align: left;
      text-overflow: ellipsis;
    }

    &__label {
      padding: 12px 10px 0 16px;
      font-weight: bold;
      font-size: 12px;
      line-height: 1;
    }

    &__search-wrapper {
      position: relative;
      padding-top: 1px;
      padding-right: 1px;
      padding-left: 1px;
      border-bottom: 1px solid @color-border;
    }

    &__more-loader,
    &__more-loader::before,
    &__more-loader::after {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      animation: load7 1.8s infinite ease-in-out;
      animation-fill-mode: both;
    }

    &__more-loader {
      @margin: 12px;
      @size: 10px;

      position: absolute;
      right: @margin + 2px;
      bottom: 0;
      left: @margin + 2px;
      margin: 0 auto @size*3 auto;
      color: @color-second_light;
      font-size: @size;
      line-height: 0;
      text-indent: -9999em;
      transform: translateZ(0);
      animation-delay: -0.16s;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 0;
      }

      &::before {
        left: -@margin;
        animation-delay: -0.32s;
      }

      &::after {
        left: @margin;
      }
    }

    @keyframes load7 {
      0%,
      80%,
      100% {
        box-shadow: 0 2.5em 0 -1.3em;
      }

      40% {
        box-shadow: 0 2.5em 0 0;
      }
    }
  }
</style>