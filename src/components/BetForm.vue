<template>
  <view class="bet-form">
    <view class="field">
      <text class="label">比赛名称</text>
      <input v-model="form.matchName" placeholder="如：阿森纳 vs 曼城" />
    </view>
    <view class="field">
      <text class="label">赛事类型</text>
      <input v-model="form.league" placeholder="英超 / 欧冠" />
    </view>
    <view class="field">
      <text class="label">投注类型</text>
      <picker mode="selector" :range="betTypeOptions" @change="onBetTypeChange">
        <view class="picker-value">{{ betTypeLabel }}</view>
      </picker>
    </view>
    <view class="field inline">
      <view class="inline-item">
        <text class="label">投注额 (¥)</text>
        <input type="number" v-model.number="form.stake" placeholder="0" />
      </view>
      <view class="inline-item">
        <text class="label">赔率</text>
        <input type="number" v-model.number="form.odds" placeholder="1.85" />
      </view>
    </view>
    <view class="field inline">
      <view class="inline-item">
        <text class="label">平台</text>
        <input v-model="form.platform" placeholder="如：立博" />
      </view>
      <view class="inline-item">
        <text class="label">结果</text>
        <picker mode="selector" :range="resultOptions" @change="onResultChange">
          <view class="picker-value">{{ resultLabel }}</view>
        </picker>
      </view>
    </view>
    <view class="field inline">
      <view class="inline-item">
        <text class="label">手续费</text>
        <input type="number" v-model.number="form.fee" placeholder="0" />
      </view>
      <view class="inline-item">
        <text class="label">投注时间</text>
        <picker mode="datetime" :value="form.betTime" @change="onDateChange">
          <view class="picker-value">{{ form.betTime }}</view>
        </picker>
      </view>
    </view>
    <view class="field">
      <text class="label">标签</text>
      <input v-model="form.tagsInput" placeholder="用逗号分隔，如：竞彩,保守" />
    </view>
    <view class="field">
      <text class="label">备注</text>
      <textarea v-model="form.note" auto-height placeholder="输入战术选择、盘口信息..." />
    </view>
    <button class="primary-btn" @tap="handleSubmit">保存记录</button>
  </view>
</template>

<script setup>
import dayjs from 'dayjs'
import { computed, reactive } from 'vue'

const emit = defineEmits(['submit'])

const betTypeOptions = ['胜平负', '让球', '大小球', '串关', '其他']
const resultOptions = ['pending', 'win', 'lose', 'half-win', 'half-lose']

const form = reactive({
  matchName: '',
  league: '',
  betType: '胜平负',
  stake: 200,
  odds: 1.8,
  platform: '',
  result: 'pending',
  fee: 0,
  betTime: dayjs().format('YYYY-MM-DD HH:mm'),
  tagsInput: '',
  note: ''
})

const betTypeLabel = computed(() => form.betType)
const resultLabel = computed(() => {
  const map = {
    pending: '进行中',
    win: '赢',
    lose: '输',
    'half-win': '走水/半赢',
    'half-lose': '半输'
  }
  return map[form.result]
})

function onBetTypeChange (event) {
  const index = Number(event.detail.value)
  form.betType = betTypeOptions[index]
}

function onResultChange (event) {
  const index = Number(event.detail.value)
  form.result = resultOptions[index]
}

function onDateChange (event) {
  form.betTime = event.detail.value
}

function normalizePayload () {
  const tags = form.tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
  return {
    matchName: form.matchName,
    league: form.league,
    betType: form.betType,
    stake: Number(form.stake),
    odds: Number(form.odds),
    platform: form.platform,
    result: form.result,
    fee: Number(form.fee || 0),
    betTime: form.betTime,
    tags,
    note: form.note
  }
}

function reset () {
  form.matchName = ''
  form.league = ''
  form.betType = '胜平负'
  form.stake = 200
  form.odds = 1.8
  form.platform = ''
  form.result = 'pending'
  form.fee = 0
  form.betTime = dayjs().format('YYYY-MM-DD HH:mm')
  form.tagsInput = ''
  form.note = ''
}

function handleSubmit () {
  emit('submit', normalizePayload())
  reset()
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.bet-form {
  @include card;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.inline {
  flex-direction: row;
  justify-content: space-between;
  gap: 24rpx;

  .inline-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
}

.label {
  font-size: 26rpx;
  color: #5c5c5c;
}

input,
textarea,
.picker-value {
  background-color: #f1f5f2;
  border-radius: 14rpx;
  padding: 18rpx 24rpx;
  font-size: 28rpx;
}

textarea {
  min-height: 140rpx;
}

.picker-value {
  color: #1c1c1c;
}
</style>
