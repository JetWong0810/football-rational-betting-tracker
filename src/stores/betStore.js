import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { useConfigStore } from './configStore'

const STORAGE_KEY = 'frbt-bets'

const defaultBet = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  matchName: '',
  league: '',
  betType: 'win-draw-lose',
  wagerType: 'single',
  stake: 0,
  odds: 1.0,
  platform: '',
  result: 'pending',
  profit: 0,
  fee: 0,
  betTime: dayjs().format('YYYY-MM-DD HH:mm'),
  tags: [],
  note: '',
  legs: []
})

export const useBetStore = defineStore('bet', () => {
  const bets = ref([])
  const loading = ref(false)
  const snapshots = ref([])

  const totalStake = computed(() => bets.value.reduce((sum, bet) => sum + Number(bet.stake || 0), 0))
  const totalProfit = computed(() => bets.value.reduce((sum, bet) => sum + Number(bet.profit || 0), 0))
  const winCount = computed(() => bets.value.filter(bet => bet.result === 'win').length)
  const loseCount = computed(() => bets.value.filter(bet => bet.result === 'lose').length)
  const winningRate = computed(() => {
    if (!bets.value.length) return 0
    return winCount.value / bets.value.length
  })
  const consecutiveLosses = computed(() => {
    let streak = 0
    for (const bet of bets.value) {
      if (bet.result === 'lose') {
        streak += 1
      } else if (bet.result === 'win') {
        break
      }
    }
    return streak
  })

  const bankroll = computed(() => {
    const configStore = useConfigStore()
    return Number(configStore.startingCapital) + totalProfit.value
  })

  function persist () {
    uni.setStorageSync(STORAGE_KEY, bets.value)
  }

  function recalculateSnapshots () {
    const grouped = bets.value.reduce((acc, bet) => {
      const dayKey = dayjs(bet.betTime).format('YYYY-MM-DD')
      if (!acc[dayKey]) {
        acc[dayKey] = { date: dayKey, stake: 0, profit: 0 }
      }
      acc[dayKey].stake += Number(bet.stake || 0)
      acc[dayKey].profit += Number(bet.profit || 0)
      return acc
    }, {})
    snapshots.value = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
  }

  function normalizeBet (payload = {}) {
    const base = defaultBet()
    const draft = {
      ...base,
      ...payload,
      id: payload.id || base.id
    }

    const normalizedLegs = (() => {
      if (Array.isArray(payload.legs) && payload.legs.length) {
        return payload.legs.map((leg, index) => ({
          id: leg.id || `${draft.id}-leg-${index}`,
          homeTeam: leg.homeTeam || '',
          awayTeam: leg.awayTeam || '',
          league: leg.league || payload.league || '',
          matchTime: leg.matchTime || payload.betTime || base.betTime,
          betType: leg.betType || payload.betType || '胜平负',
          odds: Number(leg.odds || 1),
          stake: Number(leg.stake || 0),
          selection: leg.selection || '',
          note: leg.note || ''
        }))
      }

      // 兼容旧数据：将单场信息转为一个 leg
      return [{
        id: `${draft.id}-leg-0`,
        homeTeam: payload.homeTeam || payload.matchName || '',
        awayTeam: payload.awayTeam || '',
        league: payload.league || '',
        matchTime: payload.betTime || base.betTime,
        betType: payload.betType || '胜平负',
        odds: Number(payload.odds || 1),
        stake: Number(payload.stake || 0),
        selection: '',
        note: payload.note || ''
      }]
    })()

    const legsCount = normalizedLegs.length
    const oddsFromLegs = normalizedLegs.reduce((acc, leg) => acc * (Number(leg.odds) || 1), 1)
    const stake = Number(draft.stake || 0)
    const fee = Number(draft.fee || 0)
    const odds = Number(draft.odds || oddsFromLegs || 1)

    draft.legs = normalizedLegs
    draft.odds = odds
    draft.wagerType = payload.wagerType || (legsCount > 1 ? 'parlay' : 'single')
    draft.betType = draft.wagerType === 'parlay' || legsCount > 1
      ? `串关(${legsCount})`
      : normalizedLegs[0].betType || '胜平负'
    draft.league = legsCount === 1 ? normalizedLegs[0].league : '串关'
    draft.matchName = (() => {
      if (legsCount === 1) {
        const leg = normalizedLegs[0]
        if (leg.homeTeam && leg.awayTeam) {
          return `${leg.homeTeam} vs ${leg.awayTeam}`
        }
        return leg.homeTeam || leg.awayTeam || payload.matchName || '未命名比赛'
      }
      const firstLeg = normalizedLegs[0]
      const anchor = firstLeg.homeTeam || firstLeg.awayTeam || firstLeg.league || '多场串关'
      return `${anchor} 等${legsCount}场`
    })()
    draft.wagerType = draft.wagerType || (legsCount > 1 ? 'parlay' : 'single')

    if (draft.result === 'win') {
      draft.profit = stake * (odds - 1) - fee
    } else if (draft.result === 'lose') {
      draft.profit = -stake - fee
    } else if (draft.result === 'half-win') {
      draft.profit = (stake * (odds - 1)) / 2 - fee
    } else if (draft.result === 'half-lose') {
      draft.profit = -stake / 2 - fee
    } else {
      draft.profit = 0
    }

    return draft
  }

  async function bootstrap () {
    loading.value = true
    try {
      const cache = uni.getStorageSync(STORAGE_KEY)
      if (Array.isArray(cache)) {
        bets.value = cache.map(normalizeBet)
      }
    } finally {
      loading.value = false
      recalculateSnapshots()
    }
  }

  function addBet (payload) {
    const bet = normalizeBet(payload)
    bets.value = [bet, ...bets.value]
    persist()
    recalculateSnapshots()
    return bet
  }

  function updateBet (id, payload) {
    bets.value = bets.value.map(bet => {
      if (bet.id !== id) return bet
      return normalizeBet({ ...bet, ...payload, id })
    })
    persist()
    recalculateSnapshots()
  }

  function removeBet (id) {
    bets.value = bets.value.filter(bet => bet.id !== id)
    persist()
    recalculateSnapshots()
  }

  function clearBets () {
    bets.value = []
    persist()
    recalculateSnapshots()
  }

  return {
    bets,
    loading,
    snapshots,
    totalStake,
    totalProfit,
    winCount,
    loseCount,
    winningRate,
    consecutiveLosses,
    bankroll,
    bootstrap,
    addBet,
    updateBet,
    removeBet,
    clearBets,
    recalculateSnapshots
  }
})
