import { defineStore } from 'pinia'
import { request } from '@/utils/http'

export const useMatchStore = defineStore('matchStore', {
  state: () => ({
    matches: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    filterDate: '',
    filterLeague: '',
    error: '',
    playsData: null,
    playsLoading: false,
    playsError: ''
  }),
  getters: {},
  actions: {
    async refreshMatches () {
      this.page = 1
      this.matches = []
      this.total = 0
      this.hasMore = true
      await this.fetchMatches()
    },
    async fetchMatches () {
      if (this.loading || !this.hasMore) return
      this.loading = true
      this.error = ''
      try {
        const data = await request({
          url: '/api/matches',
          method: 'GET',
          data: {
            page: this.page,
            page_size: this.pageSize,
            league: this.filterLeague || undefined
          }
        })
        const items = data?.items || []
        if (this.page === 1) {
          this.matches = items
        } else {
          this.matches = [...this.matches, ...items]
        }
        this.total = data?.total || 0
        this.hasMore = this.matches.length < this.total
        if (this.hasMore) {
          this.page += 1
        }
      } catch (err) {
        this.error = err?.message || '加载失败'
        this.hasMore = false
      } finally {
        this.loading = false
      }
    },
    async loadMore () {
      if (!this.loading && this.hasMore) {
        await this.fetchMatches()
      }
    },
    async fetchPlays (matchId) {
      this.playsLoading = true
      this.playsError = ''
      try {
        const data = await request({ url: `/api/matches/${matchId}/plays` })
        this.playsData = data
      } catch (err) {
        this.playsError = err?.message || '玩法加载失败'
      } finally {
        this.playsLoading = false
      }
    },
    clearPlays () {
      this.playsData = null
      this.playsError = ''
    }
  }
})
