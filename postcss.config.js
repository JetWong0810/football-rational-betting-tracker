const path = require('path')
const postcssImport = require('postcss-import')
const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: [
    postcssImport({
      resolve (id) {
        if (id.startsWith('~@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.slice(3))
        }
        if (id.startsWith('@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.slice(2))
        }
        if (id.startsWith('/') && !id.startsWith('//')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.slice(1))
        }
        return id
      }
    }),
    autoprefixer({
      remove: process.env.UNI_PLATFORM !== 'h5'
    })
  ]
}
