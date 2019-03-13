<template>
<div class="loader">
  <div class="loader__item"></div>
</div>
</template>

<script>
export default {
  name: "Loader",
  data() {
    return {};
  }
};
</script>

<style lang="less" rel="stylesheet/less">
@import "../../../less/_admin/const.less";

.loader {
  position: relative;
  display: block;
  height: 70px;
  color: @color-second_light;
  font-size: 0;
  text-align: center;

  &__item {
    #default-view > .loader-circle;
  }
}

#default-view {
  //верстка ненумерованных списков по умолчанию
  .ul() {
    ul li {
      list-style-type: none;
      padding-left: 2.5em;
      position: relative;
      &::before {
        position: absolute;
        background-color: @color-second_light;
        display: block;
        content: "";
        width: 0.5em;
        height: 0.5em;
        border-radius: 1em;
        left: 1.5em;
        top: 0.5em;
      }
    }
  }

  //верстка ненумерованных списков по умолчанию
  .ol() {
    ol {
      list-style: none;
      counter-reset: li;
      & li {
        counter-increment: li;
        position: relative;
        padding-left: 2.5em;
        &::before {
          display: inline-block;
          content: counter(li);
          font-weight: 500;
          color: @color-second_light;
          text-align: right;
          width: 1em;
          margin-left: -1.5em;
          margin-right: 0.5em;
        }
      }
    }
  }

  //индикация загрузки
  .loader-circle {
    display: block;
    width: 50px;
    height: 50px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -35px;
    margin-top: -35px;
    border: 4px solid @color-second_light;
    background: transparent;
    border-bottom-color: transparent;
    border-radius: 100%;
    animation: loader 1s linear infinite;
  }
}

@keyframes loader {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>