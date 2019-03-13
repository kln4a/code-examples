import Base from './BaseControl';

export default class ParseControl extends Base {
  constructor(params, inputDOM) {
    const { options } = inputDOM;
    const multipleOptions = [...options];
    const checked = [];
    const list = multipleOptions.map((option) => {
      if (option.selected) checked.push(option.value);
      return {
        id: option.value,
        value: option.textContent,
      };
    });
    const initParams = {
      ...params,
      ...{
        options: list,
        itemKey: 'id',
        checked,
      },
    };

    super(initParams, inputDOM);
    this.multipleOptions = multipleOptions;
  }

  setOption(key, active = true) {
    const optionKey = this.multipleOptions.filter(option => option.value === key)[0];
    if (optionKey) {
      optionKey.selected = active;
    }
  }
}
