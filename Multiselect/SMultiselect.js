import AjaxControl from './SMuliselectControls/AjaxControl';
import ParseControl from './SMuliselectControls/ParseControl';

const TYPES = {
  AJAX: 'ajax',
  PARSE: 'parse',
};

class SMultiselect {
  /**
   * @param {Object} options - параметры иницилизации контрола
   * @param {String} options.name - name поля, после которого будет отрендерен контрол
   * @param {String} [options.textSearch=Поиск] - текст в строке поиска
   * @param {String} [options.textSelect=Выбрано] - текст заголовок в колонке выбранных значений
   * @param {String} [options.type="ajax","parse"]  - тип работы с данными в компоненте
   * parse - работает с обычным <select multiple>
   * ajax - записывает значения в input type="hidden" в формате 1,2,3,4
   * ключем для значения является itemKey
   * @param {Object[]} options.defaultValues - (только ajax) список отмеченных значений (checked)
   * @param {String} options.itemKey - (только ajax) уникальный ключ элемента списка
   * @param {String} options.apiUrl - (только ajax) адрес для получения данных
   * @param {String} options.filterBy - (только ajax) добавляет постфикс для GET запроса при поиске
   * например: filterBy = 'Name',
   * url запроса на сервер: ?filterByName=текстзапроса
   * @param {String} options.itemTemplate - (только ajax) - шаблон строки
   * для отображения элемента списка в формате Vue
   * например: itemTemplate - '{{temp}}: {{title}}'
   * объект элемента списка: { id: 1, title: 'testTitle', temp: 'the' }
   * результат: the: testTitle
   * @param {String} options.allValueKey - ключ для значения все,
   * при его выделении очищает список ранее выбранных значений
   */
  constructor(options = {
    name: '',
    textSearch: 'Поиск',
    textSelect: 'Выбрано',
  }) {
    const { type } = options;
    if (Object.values(TYPES).includes(type) && options.name !== '') {
      this.name = options.name;
      this.multipleOptions = [];
      const index = 0;
      const inputDOM = document.getElementsByName(this.name)[index];
      if (!inputDOM) {
        console.warn(`Input by name ${options.name} not found! SMultiselect not initialized!`);
        return;
      }

      const initOptions = {
        ...options,
        ...this.handlerParams,
      };

      const control = SMultiselect.getControl(type, initOptions, inputDOM);
      if (!control) {
        console.warn('Not found SMultiselect type! SMultiselect not initialized!');
        return;
      }
      this.control = control;
    } else {
      console.warn(`Type of SMultiselect don\`t have type ${type}! SMultiselect not initialized!`);
    }
  }

  /**
   * Фабрика для получения контрола
   */
  static getControl(type, options, inputDOM) {
    let control = false;
    try {
      switch (type) {
        case TYPES.AJAX:
          control = new AjaxControl(options, inputDOM);
          break;
        case TYPES.PARSE:
          control = new ParseControl(options, inputDOM);
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn(e);
    }
    return control;
  }

  get handlerParams() {
    return {
      selectOptionHandler: this.selectOptionHandler.bind(this),
      unSelectOptionHandler: this.unSelectOptionHandler.bind(this),
    };
  }

  /**
   * Отметить элемент
   * @param {string} key ключ
   */
  selectOptionHandler(key) {
    this.control.setOption(key, true);
  }

  /**
   * Удалить элемент из отмеченных
   * @param {string} key ключkey
   */
  unSelectOptionHandler(key) {
    this.control.setOption(key, false);
  }
}

export default SMultiselect;
