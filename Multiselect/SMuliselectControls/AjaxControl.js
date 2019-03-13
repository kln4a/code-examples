import { union, without, contains } from 'ramda';
import Base from './BaseControl';

export default class AjaxControl extends Base {
  constructor(params, inputDOM) {
    const { defaultValues, itemKey } = params;
    const checked = [];
    const checkedKeys = AjaxControl.getCheckedKeys(inputDOM);
    defaultValues.forEach((item) => {
      const keyval = item[itemKey];
      if (contains(keyval, checkedKeys)) {
        checked.push(item[itemKey]);
      }
    });
    const initParams = {
      ...params,
      ...{
        ajaxControl: true,
        options: defaultValues,
        checked,
      },
    };

    super(initParams, inputDOM);
    this.inputDOM = inputDOM;
  }

  setOption(key, active = true) {
    let values = AjaxControl.getCheckedKeys(this.inputDOM);
    if (active) {
      values = union([key], values);
    } else {
      values = without([key.toString()], values);
    }
    this.inputDOM.value = values.join(',');
  }

  static getCheckedKeys(inputDOM) {
    const { value } = inputDOM;
    return value === '' ? [] : value.split(',');
  }
}
