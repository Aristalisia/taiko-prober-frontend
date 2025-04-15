<template>
  <div class="wrapper" :class="isDarkMode ? 'dark' : 'light'">
    <!-- 顶部 -->
    <header class="header">
      <h1 class="header-title">叽奇NET</h1>
      <div class="header-controls">
        <button class="theme-toggle" @click="toggleDarkMode" style="outline: none;">
          {{ isDarkMode ? '🌞' : '🌜' }}
        </button>
        <a class="logout-link" @click="logout">退出</a>
      </div>
    </header>

    <div class="main">
      <!-- 左侧导航栏 -->
      <aside class="sidebar">
        <div class="user-info">
          <p>{{ user.username }}</p>
        </div>
        <nav>
          <ul>
      <li
        v-for="item in menuItems"
        :key="item.key"
        @click="changeContent(item.key)"
        :class="{ active: currentContent === item.key }"
      >
        {{ item.label }}
      </li>
    </ul>
        </nav>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="content">
        <!-- 首页 -->
        <div v-if="currentContent === 'home'">
          <h2>公告</h2>

          <div id="announce" style="white-space: pre-line;">{{ home_annouce }}</div>

        </div>

        <!-- 个人资料 -->
        <div v-if="currentContent === 'profile'">
          <div class="get-token-func">
            <p>获取我的token</p>
            <div class="token-container">
              <input :type="showToken ? 'text' : 'password'" :value="token" readonly class="token-input" />
              <button @click="toggleShowToken" class="toggle-button">
                <span v-if="showToken">🙈</span>
                <span v-else>👁️</span>
              </button>
              <button v-if="token" @click="copyToken" class="copy-button">复制</button>
              <button v-if="!token" @click="fetchToken" class="fetch-button">获取</button>
            </div>
          </div>

          <div class="get_tool_func">
            <button @click="fetchUploadTool" class="download-button" :disabled="isDownloading">
              {{ isDownloading ? "正在下载，稍安勿躁..." : "点我获取传分工具!" }}
            </button>
          </div>
        </div>

        <!-- 账号设置 -->
        <div v-if="currentContent === 'settings'">
          这是设置页
        </div>

        <!-- 游玩记录 -->
        <div v-if="currentContent === 'record'">
          <RecentRecord :token="token" />

        </div>

        <!-- 乐曲信息 -->
        <div v-if="currentContent === 'song_info'">
          这是乐曲信息页
        </div>

        <!-- 关于叽奇 -->
        <div v-if="currentContent === 'about'">
          <h2>更新日志</h2>

          <div id="announce" style="white-space: pre-line;">{{ about_annouce }}</div>
        </div>

      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 从这里开始为网页文本元素

// 首页
const home_annouce = 
`欢迎使用叽奇NET, 请前往个人资料获取您的传分token以绑定至bot
请注意：传分工具下载慢为正常现象，请耐心等待

什么？你想用但是不知道哪有bot？
叽奇dev聊天吹水群：1021996689，欢迎来玩！`

// 关于叽奇
const about_annouce = 
`[2025/4/11]  实现了深色模式切换功能
[2025/4/15]  搭建了基础的查询游玩记录框架`


// 从这里开始为逻辑代码

import { onMounted, ref } from 'vue'
import Cookies from 'js-cookie'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import RecentRecord from '../components/RecentRecord.vue'

const baseURL = 'https://Aristalisia.com:765/api'



const user = ref({                    // 用户cookies信息
  username: Cookies.get('username') || '游客',
})
const isDownloading = ref(false)      // 全局下载状态变量
const token = ref('')                 // token        
const showToken = ref(false);         // token切换
const isDarkMode = ref(false)
// 当前选中内容
const currentContent = ref<'home'|'profile'|'settings'|'record'|'song_info'|'about'>('home')

// 菜单配置数组
const menuItems = [
  { key: 'home',       label: '首页' },
  { key: 'profile',    label: '个人资料' },
  { key: 'settings',   label: '账号设置' },
  { key: 'record',     label: '游玩记录' },
  { key: 'song_info',  label: '乐曲信息' },
  { key: 'about', label: '关于叽奇' },
] as const

// 切换显示内容
const changeContent = (content: typeof menuItems[number]['key']) => {
  currentContent.value = content
}

// 在组件挂载时检查并应用本地存储的主题设置
onMounted(() => {
  const savedTheme = localStorage.getItem('isDarkMode');
  if (savedTheme !== null) {
    isDarkMode.value = savedTheme === 'true';
  } else {
    // 如果本地没有保存设置，可以根据系统主题偏好来设置
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDarkScheme;
  }
});

// 切换深色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('isDarkMode', isDarkMode.value.toString()); // 保存主题设置
};


// 登出
const logout = async () => {
  Cookies.remove('username')
  Cookies.remove('token')
  window.location.href = '/'
}


// 切换token显示
const toggleShowToken = () => {
  if (token.value == ''){
    ElMessageBox.alert('请先获取token')
  } else{
    showToken.value = !showToken.value
  }
}


// 获取用户token
const fetchToken = async () => {
  const currentUsername = Cookies.get('username')
  try {
    const response = await axios.post(`${baseURL}/donder/get_donder_data`, {
      "donderUsername": currentUsername
    })

    if (response.status == 200) {
      token.value = response.data.donder.donderToken
    } else {
      token.value = 'token获取失败，请联系管理员'
    }

  } catch (error: any) {
    ElMessageBox.alert(error.message)
  }
}


// 复制token
const copyToken = () => {
  navigator.clipboard.writeText(token.value).then(() => {
    ElMessageBox.alert('Token 已复制到剪贴板')
  })
}


// 下载传分工具
const fetchUploadTool = async (): Promise<void> => {
  if (isDownloading.value) return // 防止重复触发

  try {
    isDownloading.value = true // 设置状态为正在下载

    const response = await axios.get(`${baseURL}/tool/get_upload_tool_path`, {
      responseType: "blob",
    })

    // 创建临时的下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "taiko_upload.zip")
    document.body.appendChild(link)
    link.click()

    // 释放资源
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  } catch (error) {
    console.error("下载失败", error)
    alert("下载失败，请稍后重试。")
  } finally {
    // 延迟 5 秒后重置状态
    setTimeout(() => {
      isDownloading.value = false
    }, 3000)
  }
}

</script>

<style scoped lang="scss">
/* 定义 CSS 变量 */
.light {
  --bg-color: #ffffff;
  --text-color: #333333;
  --header-bg: #ffffff;
  --header-text: #3A8EE6;
  --sidebar-bg: #ffffff;
  --content-bg: #F5F7FA;
  --card-bg: #F5F7FA;
  --box-shadow: rgba(0, 0, 0, 0.1);
  --link-color: #3A8EE6;
  --link-hover: #5DAEFF;
  --hover-bg: #F5F7FA;
}

/* 深色模式变量覆盖 */
.dark {
  --bg-color: #1e1e1e;
  --text-color: #e0e0e0;
  --header-bg: #2a2a2a;
  --header-text: #8ab4f8;
  --sidebar-bg: #252526;
  --content-bg: #2d2d2d;
  --card-bg: #333333;
  --box-shadow: rgba(0, 0, 0, 0.5);
  --link-color: #8ab4f8;
  --link-hover: #a6c8ff;
  --hover-bg: #3a3d41;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-bg);
  color: var(--header-text);
  padding: 2vh 2vw;
  flex-shrink: 0;
  box-shadow: 0 0.5vw 1vw var(--box-shadow);
  border-bottom: 1px solid var(--hover-bg);
}

.header-title {
  font-size: 2vh;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 10px;
  color: var(--text-color);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.1);
  }
}

.logout-link {
  font-size: 1.5vh;
  color: var(--link-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
  &:hover{
    color: var(--link-hover);
    transform: scale(1.05);
  }
}

.main {
  display: flex;
  flex: 1;
  height: calc(100vh - 8vh);
  color: var(--text-color);
}

.sidebar {
  width: 15vw;
  background-color: var(--sidebar-bg);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid var(--hover-bg);
}

.user-info {
  text-align: center;
  padding: 2vh 1vw;
  background-color: var(--content-bg);
  border-bottom: 1px solid var(--hover-bg);
  flex-shrink: 0;
  font-family: Electrolize;
}

.user-info p {
  margin-bottom: 1vh;
  font-size: 1.8vh;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

nav li {
  padding: 1.5vh 0;
  cursor: pointer;
  text-align: center;
  font-size: 1.8vh;
  transition: transform 0.3s, color 0.3s;
  color: var(--text-color);
  &:hover {
    background-color: var(--hover-bg);
    color: var(--link-color);
  transform: scale(1.05);
  }
}

nav li.active {
  background-color: var(--link-color);
  color: white;
}

.content {
  flex: 1;
  background-color: var(--content-bg);
  padding: 2vh 2vw;
  overflow-y: auto;
}

.content>div {
  background-color: var(--card-bg);
  padding: 2vh 2vw;
  border-radius: 0.8vh;
  box-shadow: 0 0 1vw var(--box-shadow);
}

.token-container {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.token-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  margin-right: 0.5rem;
  outline: none;
}

.get_tool_func{
  margin-top: 1vh;
}

.toggle-button,
.copy-button,
.fetch-button,
.download-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  color: white;
  margin-right: 0.5rem;
  transition: background-color 0.3s;
  outline: none;
}

.toggle-button:hover,
.copy-button:hover,
.fetch-button:hover {
  background-color: #5DAEFF;
}

.toggle-button {
  background-color: #5DAEFF;
}

.copy-button {
  background-color: #4CAF50;
}

.copy-button:hover {
  background-color: #66BB6A;
}

.fetch-button,
.download-button {
  background-color: #FF9800;
}

.fetch-button:hover,
.download-button:hover {
  background-color: #FFB74D;
}

.download-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}



@media (max-width: 768px) {
  html { font-size: 14px; }
  .sidebar { width: 100%; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--hover-bg); }
  .content { padding: 1vh 1vw; }
}
</style>
