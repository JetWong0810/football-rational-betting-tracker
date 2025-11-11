<template>
  <view class="page-wrapper">
    <scroll-view class="page" scroll-y>
    <view class="section">
      <view class="summary">
        <view>
          <view class="caption">实时余额</view>
          <view class="balance">{{ formatCurrency(statStore.balance) }}</view>
        </view>
        <view>
          <view class="caption">连续亏损</view>
          <view class="balance">{{ betStore.consecutiveLosses }} 场</view>
        </view>
      </view>
      <view class="inputs">
        <view class="input-item">
          <text>主观胜率 (%)</text>
          <input type="number" v-model.number="subjectiveWinRate" />
        </view>
        <view class="input-item">
          <text>盘口赔率</text>
          <input type="number" v-model.number="odds" />
        </view>
      </view>
    </view>

    <view class="section">
      <KellyCalc
        :bankroll="statStore.balance"
        :probability="subjectiveWinRate / 100"
        :odds="odds"
        :adjustment="config.kellyFactor"
      />
      <FixedRatioCalc :bankroll="statStore.balance" :ratio="config.fixedRatio" />
      <StopLossAlert
        :consecutive-losses="betStore.consecutiveLosses"
        :limit="config.stopLossLimit"
        :drawdown="statStore.drawdown"
      />
    </view>

    <view class="section final">
      <text class="section-title">综合建议</text>
      <view class="recommend">
        <view class="value">{{ formatCurrency(recommendedStake) }}</view>
        <view class="desc">取凯利与固定比例中的更保守值</view>
        <view class="risk" :class="{ danger: shouldPause }">
          {{ riskText }}
        </view>
      </view>
    </view>
    </scroll-view>
    <QuickRecordFab />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import KellyCalc from '@/components/KellyCalc.vue'
import FixedRatioCalc from '@/components/FixedRatioCalc.vue'
import StopLossAlert from '@/components/StopLossAlert.vue'
import QuickRecordFab from '@/components/QuickRecordFab.vue'
import { useBetStore } from '@/stores/betStore'
import { useStatStore } from '@/stores/statStore'
import { useConfigStore } from '@/stores/configStore'
import { calcKellyStake } from '@/utils/kelly'
import { calcFixedRatioStake } from '@/utils/fixedRatio'
import { checkStopLoss } from '@/utils/stopLoss'
import { formatCurrency } from '@/utils/formatters'

const betStore = useBetStore()
const statStore = useStatStore()
const config = useConfigStore()

const subjectiveWinRate = ref(55)
const odds = ref(1.9)

const kellyStake = computed(() => calcKellyStake({
  bankroll: statStore.balance,
  odds: odds.value,
  probability: subjectiveWinRate.value / 100,
  adjustment: config.kellyFactor
}))

const fixedStake = computed(() => calcFixedRatioStake({
  bankroll: statStore.balance,
  ratio: config.fixedRatio
}))

const recommendedStake = computed(() => Math.min(kellyStake.value, fixedStake.value))

const stopLossStatus = computed(() => checkStopLoss({
  consecutiveLosses: betStore.consecutiveLosses,
  limit: config.stopLossLimit,
  drawdown: statStore.drawdown
}))

const shouldPause = computed(() => stopLossStatus.value.shouldPause)
const riskText = computed(() => {
  if (shouldPause.value) {
    return stopLossStatus.value.warnings.join('；')
  }
  return '状态稳定，可按建议额度执行。'
})

onShow(() => {
  uni.$emit('tab-active', 'strategy')
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.page-wrapper {
  min-height: 100vh;
  position: relative;
  padding-bottom: 200rpx;
}

.page {
  padding: 32rpx;
  box-sizing: border-box;
}

.summary {
  @include card;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.caption {
  font-size: 26rpx;
  color: #5c5c5c;
}

.balance {
  font-size: 48rpx;
  font-weight: 600;
}

.inputs {
  margin-top: 24rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.input-item {
  @include card;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.input-item input {
  background: #f1f5f2;
  border-radius: 12rpx;
  padding: 16rpx;
}

.section {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.recommend {
  @include card;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.recommend .value {
  font-size: 56rpx;
  font-weight: 700;
}

.recommend .risk {
  padding: 10rpx;
  border-radius: 12rpx;
  background: rgba(42, 168, 118, 0.15);
  color: $frbt-primary;
}

.recommend .risk.danger {
  background: rgba(233, 79, 55, 0.15);
  color: $frbt-negative;
}
</style>
