import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/docs/',
  title: '叽奇NET',
  description: '敲击太鼓开始游戏',
  themeConfig: {
    logo: '/docs/images/logo.png',
    nav: [
      { text: '欢迎', link: '/' },
      { text: '开始使用', link: 'getting-started' },
      { text: '常见问题', link: 'faq' }
    ],
    search: {
        provider: 'algolia',
        options: {
          appId: 'waiting',
          apiKey: 'waiting',
          indexName: 'deving'
        }
      },
    sidebar: {
      '/guide/': [
        {
          text: '简介',
          items: [
            { text: '安装与配置', link: '/guide/installation' },
            { text: '使用示例', link: '/guide/usage' }
          ]
        }
      ]
    }
  }
})