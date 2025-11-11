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
  stake: 0,
  odds: 1.0,
  platform: '',
  result: 'pending',
  profit: 0,
  fee: 0,
  betTime: dayjs().format('YYYY-MM-DD HH:mm'),
  tags: [],
  note: ''
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

  function normalizeBet (payload) {
    const draft = { ...defaultBet(), ...payload }
    const odds = Number(draft.odds || 1)
    const stake = Number(draft.stake || 0)
    const fee = Number(draft.fee || 0)

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
        bets.value = cache
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
    removeBet,
    clearBets,
    recalculateSnapshots
  }
})
