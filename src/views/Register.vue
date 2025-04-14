<template>
    <div class="container">
        <div class="title">
            <h1 style="font-family: Electrolize;">叽奇NET</h1>
            <p>——敲击太鼓开始游戏！</p>
        </div>
        <el-form :model="form" :rules="rules" ref="formRef" class="register-form" @submit.prevent="handleRegister" style="user-select: none;">
            <h2 style="text-align: center;">注册</h2>

            <el-form-item label="用户名" prop="donderUsername">
                <el-input v-model="form.donderUsername" placeholder="请输入用户名"></el-input>
            </el-form-item>

            <el-form-item label="密码" prop="donderPassword">
                <el-input type="password" v-model="form.donderPassword" placeholder="请输入密码"></el-input>
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input type="password" v-model="form.confirmPassword" placeholder="请输入密码"></el-input>
            </el-form-item>

            <div id="submissionReg">
                <span class="hidden-text">返回登录</span>
                <el-button type="primary" native-type="submit">注册</el-button>
                <el-link type="default" @click="goToLogin" style="user-select: none;">返回登录</el-link>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" setup>
import { ElButton, ElForm, ElInput, ElLink, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import axios from 'axios'
import router from '../router'

const baseURL = 'https://Aristalisia.com:765/api'

const goToLogin = () => {
    router.push('/')
}

const formRef = ref<InstanceType<typeof ElForm> | null>(null);

const form = ref({
    donderUsername: '',
    donderPassword: '',
    confirmPassword: ''
})

// 校验规则
const rules = {
    donderUsername: [
        { 
            required: true, 
            message: '请输入用户名', 
            trigger: 'blur' 
        },
        { 
            pattern: /^[a-zA-Z0-9]+$/, 
            message: '用户名只能包含英文和数字', 
            trigger: 'blur' 
        }
    ],
    donderPassword: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { 
            min: 8, 
            message: '密码长度必须为8位及以上', 
            trigger: 'blur' 
        }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (_rule: any, value: string, callback: any) => {
                if (value !== form.value.donderPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            }, 
            trigger: 'blur'
        }
    ]
}


const handleRegister = async () => {
  if (formRef.value) {
    formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await axios.post(`${baseURL}/donder/register`, {
            donderUsername: form.value.donderUsername,
            donderPassword: form.value.donderPassword
          })
          if (response.data.success) {
            ElMessageBox.alert('注册成功').then(() => {
                router.push('/')
            })
          } else {
            alert(response.data.message)
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
              console.error('服务器返回的错误响应:', error.response?.data);  // 打印后端返回的错误详情
          } else {
              console.error('发生了其他错误:', error)
          }
        }
      }
    });
  }
};
</script>

<style scoped lang="scss">
html,body{
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

.register-form {
    width: 100%;
    max-width: 400px;
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    height: 30%;
}

#submissionReg {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2.3vh;
}

.hidden-text {
    visibility: hidden;
}
}


</style>
