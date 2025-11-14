<template>
  <scroll-view class="plays-page" scroll-y>
    <view class="match-hero" v-if="matchInfo">
      <view>
        <view class="league">{{ matchInfo.league }}</view>
        <view class="teams">{{ matchInfo.homeTeam.name }} VS {{ matchInfo.awayTeam.name }}</view>
        <view class="time">{{ matchInfo.matchDate }} {{ matchInfo.matchTime }}</view>
      </view>
      <view class="single-tag" v-if="matchInfo.isSingle">单关</view>
    </view>

    <view class="content">
      <view v-if="loading" class="state">玩法加载中...</view>
      <view v-else-if="error" class="state error">{{ error }}</view>
      <view v-else>
        <view v-if="plays.had" class="odds-block">
          <view class="title">胜平负</view>
          <view class="matrix">
            <view class="cell" :class="{ 'single-ok': hadSingle }"><text>胜</text><text>{{ formatOdds(plays.had?.win_odds) }}</text></view>
            <view class="cell" :class="{ 'single-ok': hadSingle }"><text>平</text><text>{{ formatOdds(plays.had?.draw_odds) }}</text></view>
            <view class="cell" :class="{ 'single-ok': hadSingle }"><text>负</text><text>{{ formatOdds(plays.had?.lose_odds) }}</text></view>
          </view>
        </view>

        <view v-if="plays.hhad" class="odds-block">
          <view class="title">让球胜平负 ({{ formatHandicap(plays.hhad?.handicap) }})</view>
          <view class="matrix">
            <view class="cell" :class="{ 'single-ok': hhadSingle }"><text>胜</text><text>{{ formatOdds(plays.hhad?.win_odds) }}</text></view>
            <view class="cell" :class="{ 'single-ok': hhadSingle }"><text>平</text><text>{{ formatOdds(plays.hhad?.draw_odds) }}</text></view>
            <view class="cell" :class="{ 'single-ok': hhadSingle }"><text>负</text><text>{{ formatOdds(plays.hhad?.lose_odds) }}</text></view>
          </view>
        </view>

        <view v-if="ttgList.length" class="odds-block">
          <view class="title">总进球数</view>
          <view class="grid ttg">
            <view v-for="goal in ttgList" :key="goal.goal_range" class="cell single-ok">
              <text>{{ goal.goal_range }}</text>
              <text>{{ formatOdds(goal.odds) }}</text>
            </view>
          </view>
        </view>

        <view v-if="hafuList.length" class="odds-block">
          <view class="title">半全场</view>
          <view class="grid hafu">
            <view v-for="item in hafuList" :key="item.result_label" class="cell single-ok">
              <text>{{ item.result_label }}</text>
              <text>{{ formatOdds(item.odds) }}</text>
            </view>
          </view>
        </view>

        <view v-if="scoreGroups.length" class="odds-block">
          <view class="title">比分玩法</view>
          <view class="score-group" v-for="group in scoreGroups" :key="group.label">
            <view class="group-title">{{ group.label }}</view>
            <view class="grid scores">
              <view v-for="item in group.items" :key="item.score_label" class="cell single-ok">
                <text>{{ item.score_label }}</text>
                <text>{{ formatOdds(item.odds) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useMatchStore } from '@/stores/matchStore'

const matchStore = useMatchStore()

onLoad((options) => {
  const matchId = options?.matchId
  if (options?.title) {
    uni.setNavigationBarTitle({ title: decodeURIComponent(options.title) })
  }
  if (matchId) {
    matchStore.fetchPlays(matchId)
  }
})

onUnload(() => {
  matchStore.clearPlays()
})

const loading = computed(() => matchStore.playsLoading)
const error = computed(() => matchStore.playsError)
const playsData = computed(() => matchStore.playsData || null)
const matchInfo = computed(() => playsData.value?.match || null)
const plays = computed(() => playsData.value?.plays || {})
const hadSingle = computed(() => isSingleOdds(plays.value?.had, matchInfo.value))
const hhadSingle = computed(() => isSingleOdds(plays.value?.hhad, matchInfo.value))

const scoreGroups = computed(() => {
  const list = plays.value.crs || []
  const order = (items) => items.sort((a, b) => {
    if (a.is_other && !b.is_other) return 1
    if (!a.is_other && b.is_other) return -1
    return (a.home_score ?? 0) - (b.home_score ?? 0)
  })
  return [
    { label: '主胜比分', items: order(list.filter(item => item.result_type === 'win')) },
    { label: '平局比分', items: order(list.filter(item => item.result_type === 'draw')) },
    { label: '客胜比分', items: order(list.filter(item => item.result_type === 'lose')) }
  ].filter(group => group.items.length)
})

const ttgList = computed(() => {
  const list = plays.value.ttg || []
  return [...list].sort((a, b) => (a.min_goals ?? 0) - (b.min_goals ?? 0))
})

const hafuList = computed(() => {
  const list = plays.value.hafu || []
  const order = { win: 0, draw: 1, lose: 2 }
  return [...list].sort((a, b) => {
    const half = (order[a.half_result] ?? 0) - (order[b.half_result] ?? 0)
    if (half !== 0) return half
    return (order[a.full_result] ?? 0) - (order[b.full_result] ?? 0)
  })
})

function formatOdds (value) {
  if (value === undefined || value === null) return '--'
  return Number(value).toFixed(2)
}

function formatHandicap (value) {
  if (value === undefined || value === null) return 0
  return value > 0 ? `+${value}` : value
}

function isSingleOdds (oddsItem, match) {
  if (oddsItem && oddsItem.is_single !== undefined && oddsItem.is_single !== null) {
    const flag = Number(oddsItem.is_single)
    if (!Number.isNaN(flag)) {
      return flag === 1
    }
    return Boolean(oddsItem.is_single)
  }
  return Boolean(match?.isSingle)
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';


.plays-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f8f5 0%, #f2fbf9 100%);
}

.match-hero {
  @include card;
  margin: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.league {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.teams {
  font-size: 32rpx;
  font-weight: 600;
}

.time {
  font-size: 24rpx;
  color: #9ca3af;
}

.single-tag {
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
  color: #ffffff;
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.content {
  padding: 0 24rpx 32rpx;
}

.odds-block {
  @include card;
  margin-bottom: 24rpx;
}

.title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.matrix {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.matrix .cell,
.grid .cell {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 0 12rpx;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  min-width: 0;
  height: 60rpx;
  
  text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  text:first-child {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
  }
  
  text:last-child {
    font-size: 22rpx;
    color: #666;
    font-weight: 400;
  }

  &.single-ok {
    border-color: #fd7088;
    border-width: 1rpx;
  }
}

.grid.ttg {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.grid.hafu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.grid.scores {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.score-group {
  margin-bottom: 24rpx;
}

.group-title {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.state {
  padding: 40rpx 0;
  text-align: center;
  color: #9ca3af;
}

.state.error {
  color: #ef4444;
}
</style>
