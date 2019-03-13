<template>
  <div class="lamp-wrapper__item lamp-wrapper__top-img">
    <div class="lamp-wrapper__roll">
      <slot></slot>
      <img class="tabs-content__item-img" :src="path" />
    </div>
  </div>
</template>
<script>
export default {
  name: "ImageView",
  props: {
    path: String,
  }
};
</script>