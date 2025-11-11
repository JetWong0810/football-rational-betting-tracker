<template>
  <view class="fab" @tap="goRecord">
    <text class="icon">+</text>
    <text class="label">快速记录</text>
  </view>
</template>

<script setup>
function goRecord () {
  uni.navigateTo({ url: '/pages/record/record' })
}
</script>

<style lang="scss" scoped>
.fab {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom) + 40rpx);
  transform: translateX(-50%);
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
  z-index: 998;
}

.icon {
  font-size: 48rpx;
  line-height: 1;
}

.label {
  font-size: 22rpx;
  margin-top: 6rpx;
}
</style>
