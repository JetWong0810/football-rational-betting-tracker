<template>
  <view class="page-wrapper">
    <scroll-view class="page" scroll-y>
    <view class="hero">
      <view class="hero-top">
        <view>
          <text class="caption">账户余额</text>
          <view class="balance">{{ formatCurrency(balance) }}</view>
        </view>
        <view class="chip">
          <text>目标完成度</text>
          <text class="chip-value">{{ formatPercent(targetProgress) }}</text>
        </view>
      </view>
      <view class="hero-sub">
        <view>
          <text class="mini-label">累计盈亏</text>
          <text class="mini-value" :class="{ up: betStore.totalProfit >= 0, down: betStore.totalProfit < 0 }">
            {{ formatCurrency(betStore.totalProfit) }}
          </text>
        </view>
        <view>
          <text class="mini-label">胜率</text>
          <text class="mini-value">{{ formatPercent(betStore.winningRate) }}</text>
        </view>
        <view>
          <text class="mini-label">ROI</text>
          <text class="mini-value">{{ formatPercent(statStore.roi) }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">数据概览</text>
      <view class="stat-grid">
        <StatCard
          v-for="card in summaryCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :subtitle="card.subtitle"
          :positive="card.positive"
          :negative="card.negative"
        />
      </view>
    </view>

    <view class="section">
      <text class="section-title">盈利趋势</text>
      <view class="card surface">
        <ChartProfit :series="statStore.trendSeries" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">风控雷达</text>
      <view class="card risk">
        <view class="risk-row">
          <text>连续亏损</text>
          <text>{{ betStore.consecutiveLosses }} / {{ config.stopLossLimit }} 场</text>
        </view>
        <view class="risk-row">
          <text>最大回撤</text>
          <text>{{ formatPercent(statStore.drawdown) }}</text>
        </view>
      </view>
    </view>
    </scroll-view>
    <QuickRecordFab />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useBetStore } from '@/stores/betStore'
import { useConfigStore } from '@/stores/configStore'
import { useStatStore } from '@/stores/statStore'
import StatCard from '@/components/StatCard.vue'
import ChartProfit from '@/components/ChartProfit.vue'
import QuickRecordFab from '@/components/QuickRecordFab.vue'
import { formatCurrency, formatPercent } from '@/utils/formatters'

const betStore = useBetStore()
const config = useConfigStore()
const statStore = useStatStore()

const balance = computed(() => statStore.balance)
const targetProgress = computed(() => Math.min(Math.max(statStore.targetProgress, 0), 2))

const summaryCards = computed(() => [
  {
    title: '总投入',
    value: formatCurrency(betStore.totalStake),
    subtitle: `${betStore.bets.length} 场`,
    positive: false,
    negative: false
  },
  {
    title: '累计盈亏',
    value: formatCurrency(betStore.totalProfit),
    subtitle: betStore.totalProfit >= 0 ? '趋势向上' : '注意回撤',
    positive: betStore.totalProfit >= 0,
    negative: betStore.totalProfit < 0
  },
  {
    title: '胜率',
    value: formatPercent(betStore.winningRate),
    subtitle: `${betStore.winCount} 胜 / ${betStore.bets.length} 场`,
    positive: betStore.winningRate >= 0.5,
    negative: betStore.winningRate < 0.5
  },
  {
    title: '投资回报率',
    value: formatPercent(statStore.roi),
    subtitle: statStore.roi >= 0 ? '盈利区间' : '亏损区间',
    positive: statStore.roi >= 0,
    negative: statStore.roi < 0
  }
])

onShow(() => {
  uni.$emit('tab-active', 'home')
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.page-wrapper {
  position: relative;
  min-height: 100vh;
  padding-bottom: 200rpx;
}

.page {
  padding: 32rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #0f2e19 0%, #0f2e19 220rpx, #f4f5f7 220rpx);
}

.hero {
  @include card;
  color: #fff;
  background: linear-gradient(140deg, #1d5a36, #0b2513);
  margin-bottom: 32rpx;
  padding: 32rpx;
  box-shadow: 0 20rpx 46rpx rgba(4, 40, 22, 0.35);
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.caption {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.balance {
  font-size: 68rpx;
  font-weight: 700;
}

.chip {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 16rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.chip-value {
  font-size: 32rpx;
  font-weight: 600;
}

.hero-sub {
  margin-top: 32rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.mini-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.65);
}

.mini-value {
  display: block;
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 600;
}

.mini-value.up {
  color: #86efac;
}

.mini-value.down {
  color: #f87171;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20rpx;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280rpx, 1fr));
  gap: 20rpx;
}

.card.surface {
  padding: 24rpx;
}

.card.risk {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.risk-row {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
}
</style>
