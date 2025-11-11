<template>
  <scroll-view class="page" scroll-y>
    <BetForm @submit="handleSubmit" />

    <view class="section-title">历史记录 ({{ betStore.bets.length }})</view>
    <view v-if="!betStore.bets.length" class="empty">还没有记录，先添加一笔吧～</view>
    <view v-else class="bet-list">
      <view v-for="bet in betStore.bets" :key="bet.id" class="bet-item">
        <view class="header">
          <view>
            <view class="match">{{ bet.matchName || '未命名比赛' }}</view>
            <view class="sub">{{ bet.league }} · {{ formatDate(bet.betTime) }}</view>
          </view>
          <view class="result" :class="bet.result">{{ resultText(bet) }}</view>
        </view>
        <view class="meta">
          <view>类型：{{ bet.betType }}</view>
          <view>赔率：{{ bet.odds }}</view>
          <view>投入：{{ formatCurrency(bet.stake) }}</view>
          <view>盈亏：
            <text :class="{ win: bet.profit >= 0, lose: bet.profit < 0 }">
              {{ formatCurrency(bet.profit) }}
            </text>
          </view>
        </view>
        <view v-if="bet.note" class="note">备注：{{ bet.note }}</view>
        <view class="actions">
          <button class="inline-btn" @tap="() => removeBet(bet.id)">删除</button>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import dayjs from 'dayjs'
import BetForm from '@/components/BetForm.vue'
import { useBetStore } from '@/stores/betStore'
import { formatCurrency } from '@/utils/formatters'

const betStore = useBetStore()

function handleSubmit (payload) {
  betStore.addBet(payload)
}

function removeBet (id) {
  uni.showModal({
    title: '删除记录',
    content: '确认删除这条投注记录吗？',
    success: res => {
      if (res.confirm) {
        betStore.removeBet(id)
      }
    }
  })
}

function formatDate (value) {
  return dayjs(value).format('MM-DD HH:mm')
}

function resultText (bet) {
  const dict = {
    win: '赢',
    lose: '输',
    pending: '进行中',
    'half-win': '半赢',
    'half-lose': '半输'
  }
  return dict[bet.result] || '未知'
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.page {
  padding: 32rpx;
  box-sizing: border-box;
}

.bet-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.bet-item {
  @include card;
}

.header {
  @extend .flex-between;
  margin-bottom: 12rpx;
}

.match {
  font-size: 32rpx;
  font-weight: 600;
}

.sub {
  color: #8c8c8c;
  font-size: 24rpx;
}

.result {
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
}

.result.win { background: $frbt-positive; }
.result.lose { background: $frbt-negative; }
.result.pending { background: #b0bec5; }
.result.half-win { background: #7bb274; }
.result.half-lose { background: #ff9f68; }

.meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 12rpx;
  font-size: 26rpx;
}

.meta .win {
  color: $frbt-positive;
}

.meta .lose {
  color: $frbt-negative;
}

.note {
  margin-top: 12rpx;
  color: #5c5c5c;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}

.inline-btn {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999rpx;
  padding: 8rpx 32rpx;
}

.empty {
  text-align: center;
  padding: 120rpx 0;
  color: #9aa0a6;
}
</style>
