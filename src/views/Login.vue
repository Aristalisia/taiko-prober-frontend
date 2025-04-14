<template>
    <div class="container">
        <div class="title">
            <h1 style="font-family: Electrolize;">叽奇NET</h1>
            <p>——敲击太鼓开始游戏！</p>
        </div>
        <el-form :model="form" ref="formRef" class="login-form" @submit.prevent="handleLogin"
            style="user-select: none;">

            <h2 style="text-align: center;">登录</h2>

            <el-form-item label="用户名" prop="username">
                <el-input v-model="form.donderUsername" placeholder="请输入用户名"></el-input>
            </el-form-item>

            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="form.donderPassword" placeholder="请输入密码"></el-input>
            </el-form-item>

            <span style="visibility: hidden; user-select: none;">placeholder</span>

            <div id="submissionLog">
                <span class="hidden-text">注册</span>
                <el-button type="primary" native-type="submit">登录</el-button>
                <el-link type="default" id="register-link" @click="goToRegister" style="user-select: none;">注册</el-link>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElForm, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../components/auth'
import Cookies from 'js-cookie'
const baseURL = 'https://Aristalisia.com:765/api'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<InstanceType<typeof ElForm> | null>(null);
const form = ref({
    donderUsername: '',
    donderPassword: ''
});


async function handleLogin() {
    if (formRef.value) {
        formRef.value.validate(async (valid: any) => {
            if (valid) {
                try {
                    // 向后端发送用户名、密码和 reCAPTCHA token
                    const response = await axios.post(`${baseURL}/donder/login`, {
                        donderUsername: form.value.donderUsername,
                        donderPassword: form.value.donderPassword
                    })

                    if (response.data.success) {
                        ElMessageBox.alert('登录成功').then(() => {
                            // 保存登录信息到pinia和cookies
                            authStore.login({ username: form.value.donderUsername })
                            // console.log(response.data.token)
                            
                            Cookies.set('username', form.value.donderUsername, { expires: 7, path: '/' })
                            Cookies.set('token', response.data.token, { expires: 7, path: '/' })
                            // 登录成功后进行跳转
                            router.push('/Home')
                        })

                    } else {
                        ElMessageBox.alert(response.data.message)
                    }
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error('服务器返回的错误响应:', error.response?.data);  // 打印后端返回的错误详情
                    } else {
                        console.error('发生了其他错误:', error)
                    }

                    ElMessageBox.alert('登录失败')
                }
            }
        });
    }
}

const goToRegister = () => {
    router.push('/register')
}
</script>

<style scoped lang="scss">

html,
body {
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 320px;
    min-height: 100vh;

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 2rem;
    }

    .title {
        text-align: center;
        margin-bottom: 80px;
        margin-top: 60px;
        user-select: none;
    }

    .title h1 {
        font-size: 6vw;
        margin: 0;
        white-space: nowrap;
    }

    .title p {
        font-size: 2vw;
        margin: 0;
    }

    .login-form {
        width: 100%;
        max-width: 400px;
        background-color: #fff;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        height: 30%;
    }

    #submissionLog {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 5vh;
    }

    .hidden-text {
        visibility: hidden;
    }

}
</style>
