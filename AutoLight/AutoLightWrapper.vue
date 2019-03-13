<template>
  <div class="lamp-wrapper">
    <ImageView v-if="multiple" :path="tabData.image[active]">
      <div class="lamp-wrapper__item-top">
        <button @click="revert" type="button" class="lamp-wrapper__revert">
          180<sup>o</sup>
        </button>
        <span class="lamp-wrapper__top-title">{{buttonText}}</span>
      </div>
    </ImageView>
    <ImageView v-else :path="tabData.image"/>
    <Items v-if="multiple ? tabData.items[active] : tabData.items" :info="items" :filters="multiple ? tabData.filters[active] : tabData.filters" :id="tabData.id" :defaultFilter="'all'" />
  </div>
</template>
<script>
import ImageView from './ImageView.vue';
import Items from './Items.vue';

export default {
  name: "AutoLightWrapper",
  components: {
    ImageView,
    Items,
  },
  props: {
    tabData: Object,
    transitionsData: Object,
    multiple: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      viewFront: false,
    }
  },
  methods: {
    revert() {
      this.viewFront = !this.viewFront;
    },
  },
  computed: {
    buttonText() {
      return this.viewFront ? this.transitionsData.viewBack : this.transitionsData.viewFront;
    },
    active() {
      return this.viewFront ? 'front' : 'back';
    },
    items() {
      return this.multiple ? this.tabData.items[this.active] : this.tabData.items;
    }
  }
};
</script>