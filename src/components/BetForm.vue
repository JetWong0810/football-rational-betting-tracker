<template>
  <view class="bet-form">
    <view v-if="isEditing" class="editing-banner">
      <text>正在编辑已保存的记录</text>
      <button class="ghost-btn" @tap="handleCancelEdit">取消</button>
    </view>

    <view class="legs-wrapper">
      <view v-for="(leg, index) in form.legs" :key="leg.id" class="leg-card">
        <view class="leg-header">
          <text class="leg-title">赛事 {{ index + 1 }}</text>
          <button v-if="form.legs.length > 1" class="ghost-btn small" @tap="() => removeLeg(leg.id)">删除</button>
        </view>

        <view class="field inline">
          <view class="inline-item">
            <text class="label">主队</text>
            <input v-model="leg.homeTeam" placeholder="主队名称" />
          </view>
          <view class="inline-item">
            <text class="label">客队</text>
            <input v-model="leg.awayTeam" placeholder="客队名称" />
          </view>
        </view>

        <view class="field">
          <text class="label">联赛</text>
          <input v-model="leg.league" placeholder="英超 / 欧冠..." />
        </view>

        <view class="field">
          <text class="label">比赛时间</text>
          <picker class="picker-wrapper" mode="date" :value="leg.matchDate || currentDate" @change="(e) => onLegDateChange(leg.id, e.detail.value)" :start="currentDate">
            <view class="picker-value">{{ leg.matchDate || "选择日期" }}</view>
          </picker>
        </view>

        <view class="field">
          <text class="label">投注类型</text>
          <picker class="picker-wrapper" mode="selector" :range="betTypeOptions" @change="(e) => onLegBetTypeChange(leg.id, e.detail.value)">
            <view class="picker-value">{{ leg.betType }}</view>
          </picker>
        </view>

        <view class="field inline">
          <view class="inline-item">
            <text class="label">投注方向</text>
            <input v-model="leg.selection" placeholder="例：主胜 / 大3" />
          </view>
          <view class="inline-item">
            <text class="label">赔率</text>
            <input type="digit" v-model="leg.odds" placeholder="例：1.85" />
          </view>
        </view>
      </view>
    </view>

    <button class="secondary-btn" @tap="addLeg">+ 添加赛事</button>

    <view class="field inline">
      <view class="inline-item">
        <text class="label">下注金额 (¥)</text>
        <input type="digit" v-model="form.stake" placeholder="例：100" />
      </view>
      <view class="inline-item">
        <text class="label">总赔率</text>
        <input type="digit" v-model="form.odds" placeholder="例：1.85" />
        <text v-if="isParlay" class="helper">参考连乘：{{ combinedOdds }}</text>
      </view>
    </view>

    <view class="field">
      <text class="label">投注结果</text>
      <picker class="picker-wrapper" mode="selector" :range="resultOptions" @change="onResultChange">
        <view class="picker-value">{{ resultLabel }}</view>
      </picker>
    </view>

    <button v-if="!hideSubmitButton" class="primary-btn" @tap="handleSubmit">
      {{ isEditing ? "更新记录" : "保存记录" }}
    </button>
  </view>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, reactive, watch } from "vue";

const props = defineProps({
  editingBet: {
    type: Object,
    default: null,
  },
  hideSubmitButton: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "cancelEdit"]);

const betTypeOptions = ["胜平负", "让球", "大小球", "角球", "单双", "其他"];
const resultOptions = ["pending", "win", "lose", "half-win", "half-lose"];
const resultDict = {
  pending: "进行中",
  win: "赢",
  lose: "输",
  "half-win": "走水/半赢",
  "half-lose": "半输",
};

const form = reactive({
  id: "",
  stake: null,
  odds: null,
  result: "pending",
  betTime: dayjs().format("YYYY-MM-DD HH:mm"),
  legs: [createLeg()],
});

const isEditing = computed(() => Boolean(form.id));
const isParlay = computed(() => form.legs.length > 1);
const resultLabel = computed(() => resultDict[form.result] || "进行中");
const combinedOdds = computed(() => {
  const raw = form.legs.reduce((acc, leg) => acc * (Number(leg.odds) || 1), 1);
  return Number(raw.toFixed(2));
});

// 当前日期（用于 picker 默认值）
const currentDate = computed(() => dayjs().format("YYYY-MM-DD"));

watch(
  () => props.editingBet,
  (bet) => {
    if (bet && bet.id) {
      hydrate(bet);
    } else if (!bet) {
      reset();
    }
  },
  { immediate: true }
);

function createLeg(overrides = {}) {
  return {
    id: overrides.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    homeTeam: overrides.homeTeam || "",
    awayTeam: overrides.awayTeam || "",
    league: overrides.league || "",
    matchDate: overrides.matchDate || overrides.matchTime?.split(" ")[0] || "",
    betType: overrides.betType || "胜平负",
    selection: overrides.selection || "",
    odds: overrides.odds !== undefined ? Number(overrides.odds) : null,
  };
}

function hydrate(bet) {
  form.id = bet.id;
  form.stake = Number(bet.stake || 0);
  form.odds = Number(bet.odds || 1);
  form.result = bet.result || "pending";
  const sourceLegs =
    Array.isArray(bet.legs) && bet.legs.length
      ? bet.legs
      : [
          createLeg({
            homeTeam: bet.matchName?.split(" vs ")[0] || bet.matchName,
            awayTeam: bet.matchName?.split(" vs ")[1] || "",
            league: bet.league,
            matchDate: bet.betTime?.split(" ")[0] || "",
            betType: bet.betType,
          }),
        ];
  form.legs = sourceLegs.map((leg) => createLeg(leg));
}

function addLeg() {
  form.legs = [...form.legs, createLeg()];
}

function removeLeg(legId) {
  if (form.legs.length === 1) {
    uni.showToast({ title: "至少保留一场赛事", icon: "none" });
    return;
  }
  form.legs = form.legs.filter((leg) => leg.id !== legId);
}

function onLegBetTypeChange(legId, valueIndex) {
  const leg = form.legs.find((item) => item.id === legId);
  if (leg) {
    leg.betType = betTypeOptions[Number(valueIndex)];
  }
}

function onLegDateChange(legId, value) {
  const leg = form.legs.find((item) => item.id === legId);
  if (leg) {
    leg.matchDate = value;
  }
}

function onResultChange(event) {
  const index = Number(event.detail.value);
  form.result = resultOptions[index];
}

function normalizePayload() {
  return {
    id: form.id || undefined,
    wagerType: form.legs.length > 1 ? "parlay" : "single",
    stake: form.stake ? Number(form.stake) : 0,
    odds: form.odds ? Number(form.odds) : 0,
    result: form.result,
    betTime: form.betTime,
    legs: form.legs.map((leg) => ({
      ...leg,
      odds: leg.odds ? Number(leg.odds) : 0,
    })),
  };
}

function reset() {
  form.id = "";
  form.stake = null;
  form.odds = null;
  form.result = "pending";
  form.betTime = dayjs().format("YYYY-MM-DD HH:mm");
  form.legs = [createLeg()];
}

function handleCancelEdit() {
  emit("cancelEdit");
  reset();
}

function handleSubmit() {
  if (!form.legs.length) {
    uni.showToast({ title: "请至少添加一场赛事", icon: "none" });
    return;
  }
  emit("submit", normalizePayload());
  if (!isEditing.value) {
    reset();
  }
}

// 暴露方法给父组件使用
defineExpose({
  handleSubmit,
});
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.bet-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.editing-banner {
  @extend .flex-between;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%);
  font-size: 26rpx;
  color: #0d9488;
  font-weight: 500;
  border: 1px solid rgba(13, 148, 136, 0.15);
}

.legs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.leg-card {
  padding: 20rpx;
  border-radius: 16rpx;
  border: 1px solid rgba(13, 148, 136, 0.15);
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(13, 148, 136, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.leg-header {
  @extend .flex-between;
  font-weight: 600;
  color: #0d9488;
  font-size: 28rpx;
  align-items: center;
  width: 100%;
}

.leg-title {
  flex: 1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
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
  font-size: 24rpx;
  color: #374151;
  font-weight: 500;
  margin-bottom: 8rpx;
}

input,
.picker-value {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  border: 1px solid rgba(13, 148, 136, 0.15);
  color: #111827;
  transition: all 0.3s;
  width: 100%;
  box-sizing: border-box;
  height: 72rpx;
  line-height: 72rpx;
}

input {
  display: block;
}

input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #374151;
  position: relative;
}

.picker-value::after {
  content: "▼";
  font-size: 20rpx;
  color: #9ca3af;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.picker-wrapper {
  width: 100%;
  display: block;
}

.helper {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #0d9488;
  font-weight: 500;
}

.ghost-btn {
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12rpx;
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  background: #fff;
  color: #ef4444;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.ghost-btn:active {
  background: rgba(239, 68, 68, 0.05);
  transform: scale(0.98);
}

.ghost-btn.small {
  height: 44rpx;
  line-height: 44rpx;
  padding: 0 18rpx;
  font-size: 24rpx;
}

.secondary-btn {
  border: 2px dashed rgba(13, 148, 136, 0.3);
  border-radius: 12rpx;
  padding: 0rpx 0;
  font-size: 26rpx;
  background: #ffffff;
  color: #0d9488;
  font-weight: 600;
  transition: all 0.3s;
  width: 100%;
  box-sizing: border-box;
}

.secondary-btn:active {
  background: rgba(13, 148, 136, 0.05);
  border-color: #0d9488;
}

.primary-btn {
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
  color: #ffffff;
  border-radius: 12rpx;
  padding: 14rpx 0;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.3);
  transition: all 0.3s;
  width: 100%;
  box-sizing: border-box;
}

.primary-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(13, 148, 136, 0.3);
}
</style>
