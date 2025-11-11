<template>
  <view class="stat-card">
    <view class="title">{{ title }}</view>
    <view class="value">{{ value }}</view>
    <view v-if="subtitle" class="subtitle" :class="{ positive, negative }">
      {{ subtitle }}
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: String,
  value: {
    type: String,
    default: '--'
  },
  subtitle: {
    type: String,
    default: ''
  },
  positive: Boolean,
  negative: Boolean
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.stat-card {
  @include card;
  min-width: 260rpx;
}

.title {
  font-size: 26rpx;
  color: rgba(28, 28, 28, 0.7);
}

.value {
  font-size: 48rpx;
  font-weight: 600;
  margin: 12rpx 0;
}

.subtitle {
  font-size: 24rpx;
}

.subtitle.positive {
  color: $frbt-positive;
}

.subtitle.negative {
  color: $frbt-negative;
}
</style>
