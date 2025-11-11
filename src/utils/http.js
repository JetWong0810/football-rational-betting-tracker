export function request (options) {
  return new Promise((resolve, reject) => {
    uni.request({
      timeout: options.timeout || 15000,
      ...options,
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
