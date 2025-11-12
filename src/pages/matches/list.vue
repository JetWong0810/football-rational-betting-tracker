<template>
  <view class="matches-page">
    <scroll-view scroll-y class="list" lower-threshold="60" @scrolltolower="handleScrollLower">
      <view v-if="loading && matches.length === 0" class="state">正在加载赛事...</view>
      <view v-else-if="!loading && matches.length === 0" class="state empty">暂无可售赛事</view>

      <view v-else>
        <view class="day-section" v-for="group in groupedMatches" :key="group.date">
          <view class="day-header" @tap="toggleGroup(group.date)">
            <text class="day-title"
              >{{ formatDateLabel(group.date) }} 共<text class="count">{{ group.matches.length }}</text
              >场 <text class="tip">(红框选项可投单关)</text></text
            >
            <text class="arrow" :class="{ collapsed: collapsedMap[group.date] }">▲</text>
          </view>

          <view class="match-wrap" v-show="!collapsedMap[group.date]">
            <view class="match-row" v-for="(match, index) in group.matches" :key="match.matchId">
              <view class="row-left">
                <text class="code">{{ formatMatchCode(group.date, index + 1) }}</text>
                <text class="league" :style="{ backgroundColor: pickLeagueColor(match.league) }">{{ truncateText(match.league, 3) }}</text>
                <text class="time">{{ formatTime(match) }}</text>
                <text class="attitude" v-if="match.notice">态度</text>
              </view>

              <view class="row-right">
                <view class="teams-info">
                  <view class="teams-container">
                    <text class="team-name team-home">{{ truncateText(match.homeTeam.name, 3) }}</text>
                    <text class="vs">VS</text>
                    <text class="team-name team-away">{{ truncateText(match.awayTeam.name, 3) }}</text>
                  </view>
                </view>

                <view class="main-content">
                  <view class="odds-section">
                    <!-- 胜平负 -->
                    <view class="odds-row">
                      <text class="handicap">0</text>
                      <template v-if="match.wdl?.had">
                        <view class="odds-item single-ok">
                          <text class="label">胜</text>
                          <text class="value">{{ formatOdds(match.wdl.had.win_odds) }}</text>
                        </view>
                        <view class="odds-item">
                          <text class="label">平</text>
                          <text class="value">{{ formatOdds(match.wdl.had.draw_odds) }}</text>
                        </view>
                        <view class="odds-item">
                          <text class="label">负</text>
                          <text class="value">{{ formatOdds(match.wdl.had.lose_odds) }}</text>
                        </view>
                      </template>
                      <template v-else>
                        <view class="odds-item not-sale">
                          <text class="not-sale-text">未</text>
                        </view>
                        <view class="odds-item not-sale">
                          <text class="not-sale-text">开</text>
                        </view>
                        <view class="odds-item not-sale">
                          <text class="not-sale-text">售</text>
                        </view>
                      </template>
                    </view>

                    <!-- 让球胜平负 -->
                    <view class="odds-row" v-if="match.wdl?.hhad">
                      <text class="handicap" :class="getHandicapClass(match.wdl.hhad.handicap)">{{ formatHandicap(match.wdl.hhad.handicap) }}</text>
                      <view class="odds-item">
                        <text class="label">胜</text>
                        <text class="value">{{ formatOdds(match.wdl.hhad.win_odds) }}</text>
                      </view>
                      <view class="odds-item">
                        <text class="label">平</text>
                        <text class="value">{{ formatOdds(match.wdl.hhad.draw_odds) }}</text>
                      </view>
                      <view class="odds-item">
                        <text class="label">负</text>
                        <text class="value">{{ formatOdds(match.wdl.hhad.lose_odds) }}</text>
                      </view>
                    </view>
                  </view>

                  <view class="side-links">
                    <text class="link-index">指数</text>
                    <text class="link-more" @tap="goPlays(match.matchId, match)">更多玩法</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="state" v-if="loading && matches.length > 0">加载更多...</view>
        <view class="state" v-else-if="!matchStore.hasMore">已显示全部赛事</view>
      </view>
    </scroll-view>
    <QuickRecordFab />
  </view>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue";
import { onReachBottom, onShow } from "@dcloudio/uni-app";
import dayjs from "dayjs";
import { useMatchStore } from "@/stores/matchStore";
import QuickRecordFab from "@/components/QuickRecordFab.vue";

const matchStore = useMatchStore();
const matches = computed(() => matchStore.matches);
const loading = computed(() => matchStore.loading);
const collapsedMap = reactive({});

const groupedMatches = computed(() => {
  const groups = matches.value.reduce((acc, match) => {
    const key = match.matchDate || "待定";
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});
  return Object.keys(groups)
    .sort((a, b) => {
      if (a === "待定") return 1;
      if (b === "待定") return -1;
      return dayjs(a).valueOf() - dayjs(b).valueOf();
    })
    .map((date) => ({ date, matches: groups[date] }));
});

onMounted(() => {
  if (!matchStore.matches.length) {
    matchStore.refreshMatches();
  }
});

onReachBottom(() => {
  matchStore.loadMore();
});

onShow(() => {
  uni.$emit("tab-active", "matches");
});

function goPlays(matchId, match) {
  const title = `${match.homeTeam.name} VS ${match.awayTeam.name}`;
  uni.navigateTo({
    url: `/pages/matches/plays?matchId=${matchId}&title=${encodeURIComponent(title)}`,
  });
}

function toggleGroup(date) {
  collapsedMap[date] = !collapsedMap[date];
}

function formatOdds(value) {
  if (value === null || value === undefined) return "--";
  return Number(value).toFixed(2);
}

function formatHandicap(value) {
  if (!value && value !== 0) return 0;
  return value > 0 ? `+${value}` : value;
}

function formatDateLabel(date) {
  if (!date || date === "待定") {
    return "待定时间";
  }
  const weekMap = ["日", "一", "二", "三", "四", "五", "六"];
  const d = dayjs(date);
  return `周${weekMap[d.day()]} ${d.format("YYYY-MM-DD")}`;
}

function formatMatchCode(date, index) {
  if (!date || date === "待定") {
    return `待${String(index).padStart(3, "0")}`;
  }
  const weekMap = ["日", "一", "二", "三", "四", "五", "六"];
  const d = dayjs(date);
  const weekChar = weekMap[d.day()];
  return `${weekChar}${String(index).padStart(3, "0")}`;
}

function formatTime(match) {
  if (match.matchTime) {
    return match.matchTime.slice(0, 5);
  }
  return "待定";
}

function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength);
}

function getLeagueSuffix(league) {
  // 提取联赛简称，如"英锦赛" -> "英甲"
  if (!league) return "";
  if (league.includes("英")) {
    if (league.includes("甲")) return "英甲";
    if (league.includes("乙")) return "英乙";
    return "英甲";
  }
  if (league.includes("西")) return "西甲";
  if (league.includes("意")) return "意甲";
  if (league.includes("德")) return "德甲";
  if (league.includes("法")) return "法甲";
  return "";
}

function getHandicapClass(handicap) {
  if (!handicap && handicap !== 0) return "gray";
  if (handicap > 0) return "green";
  if (handicap < 0) return "red";
  return "gray";
}

function pickLeagueColor(league) {
  const palette = ["#bb0060", "#1d7dde", "#f97316", "#10b981"];
  const seed = league ? league.charCodeAt(0) : 0;
  return palette[seed % palette.length];
}

function handleScrollLower() {
  matchStore.loadMore();
}
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.matches-page {
  min-height: 100vh;
  position: relative;
  padding-bottom: 200rpx;
  background: #f5f6f8;
}

.list {
  height: 100vh;
  padding: 0 0 120rpx;
  box-sizing: border-box;
}

.day-section {
  margin-bottom: 16rpx;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx 12rpx;
  background: #f5f6f8;
  letter-spacing: 0.03em;
}

.day-title {
  font-size: 22rpx;
  color: #666;
  line-height: 1.6;

  .count {
    color: #f43f5e;
    font-weight: 500;
  }

  .tip {
    color: #999;
    font-size: 20rpx;
  }
}

.arrow {
  font-size: 24rpx;
  color: #999;
  transition: transform 0.2s ease;
}

.arrow.collapsed {
  transform: rotate(180deg);
}

.match-wrap {
  background: #fff;
  padding: 0 24rpx;
}

.match-row {
  display: flex;
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.match-row:last-child {
  border-bottom: none;
}

.row-left {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
  gap: 12rpx;
  flex-shrink: 0;
}

.row-left .code {
  font-size: 22rpx;
  color: #666;
  white-space: nowrap;
  line-height: 1.2;
}

.league {
  border-radius: 6rpx;
  padding: 4rpx 10rpx;
  color: #fff;
  font-size: 20rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100rpx;
  line-height: 1.3;
}

.time {
  font-size: 22rpx;
  color: #666;
  white-space: nowrap;
  line-height: 1.2;
}

.attitude {
  font-size: 18rpx;
  color: #666;
  background: #f8f8f8;
  padding: 3rpx 8rpx;
  border-radius: 3rpx;
  line-height: 1.2;
}

.row-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16rpx 16rpx 16rpx 16rpx;
  min-width: 0;
}

.teams-info {
  margin-bottom: 10rpx;
  display: flex;
  align-items: center;
}

.teams-container {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-left: 46rpx;
  flex: 1;
  max-width: 374rpx;
  min-width: 0;
}

.team-name {
  flex: 1;
  font-size: 26rpx;
  font-weight: 400;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  &.team-home {
    text-align: right;
  }

  &.team-away {
    text-align: left;
  }
}

.vs {
  flex: 1;
  font-size: 18rpx;
  color: #999;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  min-width: 0;
}

.main-content {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.odds-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
  max-width: 420rpx;
}

.odds-row {
  display: flex;
  align-items: stretch;
  gap: 4rpx;
}

.handicap {
  width: 42rpx;
  height: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 500;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #666;
  position: relative;
  top: 4rpx;

  &.gray {
    color: #666;
    background-color: #f5f5f5;
  }

  &.green {
    color: #22c55e;
    background-color: #e8f8f0;
  }

  &.red {
    color: #f43f5e;
    background-color: #fee;
  }
}

.side-links {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 56rpx;
}

.odds-item {
  flex: 1;
  border: 1px solid #e5e5e5;
  border-radius: 4rpx;
  padding: 0 10rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-sizing: border-box;
  min-width: 0;
  height: 60rpx;

  &.single-ok {
    border-color: #f43f5e;
    border-width: 2rpx;
  }

  &.not-sale {
    border-color: #e5e5e5;
    background: #f9f9f9;
    justify-content: center;
  }

  .label {
    font-size: 24rpx;
    color: #333;
    white-space: nowrap;
    font-weight: 400;
  }

  .value {
    font-size: 22rpx;
    color: #666;
    white-space: nowrap;
  }

  .not-sale-text {
    font-size: 22rpx;
    color: #999;
    white-space: nowrap;
  }
}

.link-index {
  color: #4a90e2;
  font-size: 22rpx;
  white-space: nowrap;
  line-height: 60rpx;
  text-align: center;
}

.link-more {
  color: #4a90e2;
  font-size: 22rpx;
  line-height: 1.4;
  text-align: center;
  word-break: break-all;
  width: 56rpx;
}

.state {
  text-align: center;
  color: #999;
  padding: 32rpx 0;
  font-size: 24rpx;
}

.state.empty {
  color: #666;
}
</style>
