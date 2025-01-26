<template>
  <div class="wrapper">
    <!-- 顶部 -->
    <header class="header">
      <h1 class="header-title">叽奇NET</h1>
      <a class="logout-link" @click="logout">退出</a>
    </header>

    <div class="main">
      <!-- 左侧导航栏 -->
      <aside class="sidebar">
        <div class="user-info">
          <p>{{ user.username }}</p>
        </div>
        <nav>
          <ul>
            <li @click="changeContent('home')" :class="{ active: currentContent === 'home' }">首页</li>
            <li @click="changeContent('profile')" :class="{ active: currentContent === 'profile' }">个人资料</li>
            <li @click="changeContent('settings')" :class="{ active: currentContent === 'settings' }">账号设置</li>
            <li @click="changeContent('record')" :class="{ active: currentContent === 'record' }">游玩记录</li>
            <li @click="changeContent('song_info')" :class="{ active: currentContent === 'song_info' }">乐曲信息</li>
            <li @click="changeContent('notifications')" :class="{ active: currentContent === 'notifications' }">通知</li>
          </ul>
        </nav>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="content">

        <div v-if="currentContent === 'home'">

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

        <div v-if="currentContent === 'profile'">这是个人资料页</div>
        <div v-if="currentContent === 'settings'">这是设置页</div>
        <div v-if="currentContent === 'record'">这是游玩记录页</div>
        <div v-if="currentContent === 'song_info'">这是乐曲信息页</div>
        <div v-if="currentContent === 'notifications'">这是通知页</div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Cookies from 'js-cookie'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'

// const baseURL = 'https://Aristalisia.com:765/api'
const baseURL_temp = 'https://47.243.115.22:765/api'


const user = ref({                    // 用户cookies信息
  username: Cookies.get('username') || '游客',
})
const isDownloading = ref(false)      // 全局下载状态变量
const currentContent = ref('home')    // 当前页面内容
const token = ref('')                 // token        
const showToken = ref(false);         // token切换

// 切换显示内容
const changeContent = (content: string) => {
  currentContent.value = content
}

// 登出
const logout = async () => {
  await Cookies.remove('username')
  await Cookies.remove('token').then(() => {
    window.location.href = '/'
  })

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
    const response = await axios.post(`${baseURL_temp}/donder/get_donder_data`, {
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

    const response = await axios.get(`${baseURL_temp}/tool/get_upload_tool_path`, {
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
  background-color: #ffffff;
  color: #3A8EE6;
  padding: 2vh 2vw;
  box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
}

.header-title {
  font-size: 2vh;
  margin: 0;
}

.logout-link {
  font-size: 1.5vh;
  color: #3A8EE6;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.logout-link:hover {
  color: #5DAEFF;
}

.main {
  display: flex;
  flex: 1;
  height: calc(100vh - 8vh);
}

.sidebar {
  width: 15vw;
  background-color: #ffffff;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
}

.user-info {
  text-align: center;
  padding: 2vh 1vw;
  background-color: #F5F7FA;
  border-bottom: 1px solid #e0e0e0;
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
  transition: background-color 0.3s, color 0.3s;
  color: #333;
}

nav li:hover {
  background-color: #F5F7FA;
  color: #3A8EE6;
}

nav li.active {
  background-color: #409EFF;
  color: white;
}

.content {
  flex: 1;
  background-color: #ffffff;
  padding: 2vh 2vw;
  overflow-y: auto;
}

.content>div {
  background-color: #F5F7FA;
  padding: 2vh 2vw;
  border-radius: 0.8vh;
  box-shadow: 0 0 1vw rgba(0, 0, 0, 0.1);
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
  background-color: #3A8EE6;
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
  .wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .content {
    flex: 1;
    padding: 1vh 1vw;
  }
}

@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}
</style>
