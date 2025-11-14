// 根据环境配置API基础URL
const getBaseURL = () => {
  // #ifdef H5
  // H5环境：优先使用环境变量，否则使用默认值
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'
  // #endif
  
  // #ifdef MP-WEIXIN
  // 微信小程序环境：使用生产环境API地址
  return 'https://你的后端API地址.onrender.com'
  // #endif
  
  // #ifndef H5 || MP-WEIXIN
  // 其他环境使用本地地址
  return 'http://localhost:7001'
  // #endif
}

export const BASE_URL = getBaseURL()

export function request (options) {
  return new Promise((resolve, reject) => {
    // 自动添加BASE_URL前缀
    let url = options.url
    if (url && !url.startsWith('http')) {
      url = BASE_URL + url
    }
    
    uni.request({
      timeout: options.timeout || 15000,
      ...options,
      url,
      success: (res) => {
        const status = res.statusCode || 0
        if (status >= 200 && status < 300) {
          resolve(res.data)
        } else {
          const message = res.data?.detail || res.errMsg || `请求失败(${status})`
          reject(new Error(message))
        }
      },
      fail: (err) => {
        reject(new Error(err?.errMsg || '网络异常'))
      }
    })
  })
}
