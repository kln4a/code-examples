import Vue from 'vue';
import Multiselect from './../../Components/Multiselect.vue';

export default class BaseControl {
  constructor(props, input) {
    const el = document.createElement('div');
    const inputDOM = input;
    inputDOM.parentNode.insertBefore(el, inputDOM.nextSibling);
    this.controlVue = new Vue({
      el,
      render: h =>
        h(Multiselect, {
          props,
        }),
      created: () => {
        inputDOM.style.display = 'none';
      },
    });
  }
}
