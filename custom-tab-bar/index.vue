<template>
  <view class="custom-tab-bar">
    <view class="tab-container">
      <view
        v-for="item in tabs"
        :key="item.key"
        :class="['tab-item', { active: item.key === activeKey }]"
        @tap="switchTab(item)"
      >
        <text class="label">{{ item.text }}</text>
      </view>
    </view>
    <view class="fab" @tap="goRecord">
      <text class="icon">+</text>
      <text class="caption">快速记录</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const tabs = [
  { key: 'home', text: '首页', pagePath: '/pages/home/home' },
  { key: 'matches', text: '赛事中心', pagePath: '/pages/matches/list' },
  { key: 'strategy', text: '策略建议', pagePath: '/pages/strategy/strategy' },
  { key: 'profile', text: '个人中心', pagePath: '/pages/settings/settings' }
]

const activeKey = ref('home')

function handleActive (key) {
  activeKey.value = key
}

onMounted(() => {
  uni.$on('tab-active', handleActive)
})

onUnmounted(() => {
  uni.$off('tab-active', handleActive)
})

function switchTab (item) {
  if (item.key === activeKey.value) return
  activeKey.value = item.key
  uni.switchTab({ url: item.pagePath })
}

function goRecord () {
  uni.navigateTo({ url: '/pages/record/record' })
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -8rpx 30rpx rgba(0, 0, 0, 0.08);
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  z-index: 999;
}

.tab-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  padding: 20rpx 40rpx 32rpx;
  position: relative;
}

.tab-item {
  text-align: center;
  font-size: 24rpx;
  color: #7c8898;
}

.tab-item.active {
  color: #1e5631;
  font-weight: 600;
}

.fab {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -70rpx;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fe5c5c, #f83d83);
  box-shadow: 0 20rpx 40rpx rgba(248, 61, 131, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
}

.icon {
  font-size: 48rpx;
  line-height: 1;
}

.caption {
  font-size: 22rpx;
  margin-top: 6rpx;
}
</style>
