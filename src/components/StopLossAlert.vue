<template>
  <view class="alert" :class="{ danger: shouldPause }">
    <view class="header">
      <text class="title">止损控制</text>
      <text class="tag">限制 {{ limit }} 次</text>
    </view>
    <view class="content">
      <text>当前连败：{{ consecutiveLosses }} 场</text>
      <text>最大回撤：{{ (drawdown * 100).toFixed(1) }}%</text>
    </view>
    <view v-if="warnings.length" class="warnings">
      <view v-for="tip in warnings" :key="tip">• {{ tip }}</view>
    </view>
    <view v-else class="ok">状态稳定，可继续按计划执行。</view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { checkStopLoss } from '@/utils/stopLoss'

const props = defineProps({
  consecutiveLosses: {
    type: Number,
    default: 0
  },
  limit: {
    type: Number,
    default: 3
  },
  drawdown: {
    type: Number,
    default: 0
  }
})

const status = computed(() => checkStopLoss({
  consecutiveLosses: props.consecutiveLosses,
  limit: props.limit,
  drawdown: props.drawdown
}))

const warnings = computed(() => status.value.warnings)
const shouldPause = computed(() => status.value.shouldPause)
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.alert {
  @include card;
  border-left: 8rpx solid $frbt-primary;
}

.alert.danger {
  border-left-color: $frbt-negative;
}

.header {
  @extend .flex-between;
  margin-bottom: 16rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
}

.tag {
  font-size: 24rpx;
  color: rgba(28, 28, 28, 0.6);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 16rpx;
  color: rgba(28, 28, 28, 0.85);
}

.warnings {
  color: $frbt-negative;
  line-height: 1.6;
}

.ok {
  color: $frbt-primary;
}
</style>
