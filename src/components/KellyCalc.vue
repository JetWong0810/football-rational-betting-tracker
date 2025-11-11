<template>
  <view class="calc-card">
    <view class="calc-header">
      <text class="title">凯利公式建议</text>
      <text class="tag">{{ (probability * 100).toFixed(0) }}% 胜率</text>
    </view>
    <view class="value">{{ formattedStake }}</view>
    <view class="meta">资金占比 {{ ratioText }}</view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { calcKellyStake } from '@/utils/kelly'
import { formatCurrency, formatPercent } from '@/utils/formatters'

const props = defineProps({
  bankroll: {
    type: Number,
    default: 0
  },
  odds: {
    type: Number,
    default: 1.8
  },
  probability: {
    type: Number,
    default: 0.55
  },
  adjustment: {
    type: Number,
    default: 0.5
  }
})

const stake = computed(() => calcKellyStake({
  bankroll: props.bankroll,
  odds: props.odds,
  probability: props.probability,
  adjustment: props.adjustment
}))

const formattedStake = computed(() => formatCurrency(stake.value))
const ratioText = computed(() => {
  if (!props.bankroll) return '0%'
  return formatPercent(stake.value / props.bankroll, 2)
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.calc-card {
  @include card;
}

.calc-header {
  @extend .flex-between;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
}

.tag {
  font-size: 24rpx;
  color: $frbt-secondary;
}

.value {
  font-size: 50rpx;
  margin: 20rpx 0;
}

.meta {
  color: rgba(28, 28, 28, 0.7);
}
</style>
