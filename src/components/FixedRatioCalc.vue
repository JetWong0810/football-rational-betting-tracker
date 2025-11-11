<template>
  <view class="calc-card">
    <view class="calc-header">
      <text class="title">固定比例法</text>
      <text class="tag">{{ (ratio * 100).toFixed(1) }}%</text>
    </view>
    <view class="value">{{ formattedStake }}</view>
    <view class="meta">当前余额 {{ formattedBankroll }}</view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { calcFixedRatioStake } from '@/utils/fixedRatio'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  bankroll: {
    type: Number,
    default: 0
  },
  ratio: {
    type: Number,
    default: 0.03
  }
})

const stake = computed(() => calcFixedRatioStake({ bankroll: props.bankroll, ratio: props.ratio }))
const formattedStake = computed(() => formatCurrency(stake.value))
const formattedBankroll = computed(() => formatCurrency(props.bankroll))
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
