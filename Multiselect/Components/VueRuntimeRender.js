export default {
  props: {
    dataTemplate: String,
    data: Object,
  },
  render(h) {
    const dynamic = {
      template: `<span>${this.dataTemplate}</span>`,
      props: Object.keys(this.data),
    };

    return h(dynamic, {
      props: {
        ...this.data,
      },
    });
  },
};
