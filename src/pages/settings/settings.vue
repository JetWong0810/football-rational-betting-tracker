<template>
  <view class="page-wrapper">
    <scroll-view class="page" scroll-y>
    <view class="section">
      <text class="section-title">策略参数</text>
      <view class="form-card">
        <view class="field">
          <text>初始资金 (¥)</text>
          <input type="number" v-model.number="form.startingCapital" />
        </view>
        <view class="field">
          <text>固定比例 (%)</text>
          <input type="number" v-model.number="form.fixedRatio" />
        </view>
        <view class="field">
          <text>凯利调整系数</text>
          <input type="number" v-model.number="form.kellyFactor" />
        </view>
        <view class="field">
          <text>止损次数</text>
          <input type="number" v-model.number="form.stopLossLimit" />
        </view>
        <view class="field">
          <text>月度盈利目标 (%)</text>
          <input type="number" v-model.number="form.targetMonthlyReturn" />
        </view>
        <view class="field">
          <text>主题</text>
          <picker mode="selector" :range="themes" @change="onThemeChange">
            <view class="picker-value">{{ themeLabel }}</view>
          </picker>
        </view>
        <button class="primary-btn" @tap="handleSave">保存设置</button>
      </view>
    </view>

    <view class="section">
      <text class="section-title">数据导出</text>
      <view class="form-card">
        <button class="primary-btn" @tap="exportCsv">导出 CSV</button>
        <text class="hint">导出的 CSV 会复制到剪贴板，可直接粘贴到 Excel。</text>
      </view>
    </view>
    </scroll-view>
    <QuickRecordFab />
  </view>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useConfigStore } from '@/stores/configStore'
import { useBetStore } from '@/stores/betStore'
import QuickRecordFab from '@/components/QuickRecordFab.vue'

const config = useConfigStore()
const betStore = useBetStore()

const themes = ['light', 'dark']

const form = reactive({
  startingCapital: 10000,
  fixedRatio: 3,
  kellyFactor: 0.5,
  stopLossLimit: 3,
  targetMonthlyReturn: 10,
  theme: 'light'
})

watch(() => ({
  startingCapital: config.startingCapital,
  fixedRatio: config.fixedRatio,
  kellyFactor: config.kellyFactor,
  stopLossLimit: config.stopLossLimit,
  targetMonthlyReturn: config.targetMonthlyReturn,
  theme: config.theme
}), value => {
  form.startingCapital = Number(value.startingCapital)
  form.fixedRatio = Number(value.fixedRatio) * 100
  form.kellyFactor = Number(value.kellyFactor)
  form.stopLossLimit = Number(value.stopLossLimit)
  form.targetMonthlyReturn = Number(value.targetMonthlyReturn) * 100
  form.theme = value.theme
}, { immediate: true })

const themeLabel = computed(() => form.theme === 'dark' ? '深色' : '浅色')

function onThemeChange (event) {
  form.theme = themes[Number(event.detail.value)]
}

function handleSave () {
  config.updateConfig({
    startingCapital: form.startingCapital,
    fixedRatio: form.fixedRatio / 100,
    kellyFactor: form.kellyFactor,
    stopLossLimit: form.stopLossLimit,
    targetMonthlyReturn: form.targetMonthlyReturn / 100,
    theme: form.theme
  })
  uni.showToast({ title: '已保存', icon: 'success' })
}

function exportCsv () {
  if (!betStore.bets.length) {
    uni.showToast({ title: '暂无数据', icon: 'none' })
    return
  }
  const header = ['比赛', '赛事', '类型', '投注额', '赔率', '结果', '盈亏', '时间', '平台', '备注']
  const rows = betStore.bets.map(bet => ([
    bet.matchName,
    bet.league,
    bet.betType,
    bet.stake,
    bet.odds,
    bet.result,
    bet.profit,
    bet.betTime,
    bet.platform,
    bet.note?.replace(/\n/g, ' ')
  ].join(',')))
  const csv = [header.join(','), ...rows].join('\n')
  uni.setClipboardData({
    data: csv,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

onShow(() => {
  uni.$emit('tab-active', 'profile')
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

.form-card {
  @include card;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

input,
.picker-value {
  background: #f1f5f2;
  border-radius: 12rpx;
  padding: 18rpx;
}

.hint {
  font-size: 24rpx;
  color: #777;
}
</style>
