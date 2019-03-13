<template>
  <div>
    <input
      class="text-field"
      type="text"
      :placeholder="placeholder"
      :class="classNamesInput"
      :disabled="disabled"
      :value="value"
      @input="onInput"
      :id="id"
      ref="field"
    >
    <label
      class="text-field__desc"
      :class="classNamesLabel"
      :for="id"
      v-if="this.$slots.default"
    >
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: "TextField",
  props: {
    placeholder: {
      type: String,
      default: ""
    },
    value: {
      type: String,
      default: ""
    },
    classNamesLabel: {
      type: String,
      default: ""
    },
    classNamesInput: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      id: `id_${Date.now()}`
    };
  },
  methods: {
    onInput() {
      this.$emit("input", this.$refs.field.value);
    }
  }
};
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import "../../../less/_admin/const.less";

.text-field {
  width: 158px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 10px;
  font-family: "Segoe UI", "Arial", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: @dark--light;
  outline: none;
  border: 1px solid @color-main--dark;
  background-color: @color-main--light;
  border-radius: 3px;
  transition: border-color 0.35s;

  &--big {
    width: 205px;
  }

  &--small {
    width: 70px;
    margin-right: 10px;
  }

  &:hover {
    cursor: pointer;
  }

  &:focus {
    border-color: @blue--dark;
    transition: border-color 0.35s;
  }

  &:disabled {
    border: 1px solid @color-main;
    background-color: @color-main;
    cursor: default;
  }
  &__desc {
    font-family: "Segoe UI", "Arial", sans-serif;
    font-size: 12px;
    font-weight: 400;
    line-height: 24px;
    color: @color-main--darkest;

    &--big {
      font-family: "Segoe UI", "Arial", sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      color: @blue--darken;
    }
  }
}
</style>