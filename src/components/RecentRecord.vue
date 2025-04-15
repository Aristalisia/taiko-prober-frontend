<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">🎵 最近游玩记录</h2>
            <div class="flex items-center space-x-2">
                <!-- 排序方式选择 -->
                <el-select v-model="sortType" size="small" @change="handleQuery">
                    <el-option label="按时间排序" value="time" />
                    <el-option label="按得分排序" value="score" />
                </el-select>

                <!-- 搜索框 -->
                <el-input v-model="searchKeyword" placeholder="搜索曲名" size="small" clearable @clear="handleQuery"
                    @keyup.enter.native="handleQuery" />
                <el-button size="small" @click="handleQuery">查询</el-button>
            </div>
        </div>

        <!-- 表格 -->
        <el-table :data="scores" style="width: 100%">
            <el-table-column prop="song_no" label="id" width="60" />
            <el-table-column label="曲名">
                <template #default="{ row }">
                    <div>
                        <div class="font-medium" :style="{ color: row.song_color }">{{ row.song_name }}</div>
                        <div class="text-sm text-gray-500">{{ row.song_name_jp }}</div>
                    </div>
                </template>
            </el-table-column>

            <el-table-column prop="high_score" label="得分" />
            <el-table-column prop="update_datetime" label="更新时间" />
        </el-table>

        <!-- 分页 -->
        <div class="mt-4 flex justify-between items-center">
            <div>当前页：{{ currentPage }} / {{ totalPages }}</div>
            <div>
                <el-button size="small" @click="changePage(currentPage - 1)" :disabled="currentPage <= 1">
                    上一页
                </el-button>
                <el-button size="small" @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages">
                    下一页
                </el-button>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import Cookies from 'js-cookie'

const token = Cookies.get('token')
const scores = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

const sortType = ref<'time' | 'score'>('time')
const searchKeyword = ref('')

const baseURL = 'https://Aristalisia.com:765/api'

import songList from '../assets/song_list.json'

// 颜色映射
const typeColorMap: Record<string, string> = {
    '南梦宫原创音乐': '#ff7028',
    '流行音乐': '#42c0d3',
    '游戏音乐': '#cc8bec',
    '动漫音乐': '#ff90d2',
    '综合音乐': '#2ae23e',
    '儿童音乐': '#fec000',
    '古典音乐': '#cac001',
    '博歌乐音乐': '#cccfde',
}

// RGB混合算法
function averageHexColors(colors: string[]): string {
    const total = colors.length
    const rgb = colors.reduce(
        (acc, hex) => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            acc[0] += r
            acc[1] += g
            acc[2] += b
            return acc
        },
        [0, 0, 0]
    )
    const [r, g, b] = rgb.map(c => Math.round(c / total))
    return `#${r.toString(16).padStart(2, '0')}${g
        .toString(16)
        .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 获取曲名
const songMap = new Map<number, { song_name: string; song_name_jp: string; type: string[] }>()

songList.forEach(song => {
    songMap.set(song.id, {
        song_name: song.song_name,
        song_name_jp: song.song_name_jp,
        type: song.type, // ✅ 保留 type 字段
    })
})

// 获取数据
const fetchScores = async (page = 1) => {
    try {
        const res = await axios.post(`${baseURL}/score/get_recent_record`, {
            token,
            page,
            sort: sortType.value,
            keyword: searchKeyword.value,
        })

        const data = res.data.data
        currentPage.value = data.currentPage
        totalPages.value = data.totalPages
        scores.value = data.scores.map((item: any) => {
            const song = songMap.get(item.song_no)
            const types = song?.type || []
            const colors = types.map((type: string) => typeColorMap[type]).filter(Boolean)
            const color = colors.length > 0 ? averageHexColors(colors) : '#000000'

            return {
                ...item,
                song_name: song?.song_name || '未知曲目',
                song_name_jp: song?.song_name_jp || '',
                song_color: color
            }
        })

    } catch (e: any) {
        ElMessage.error(e.response?.data?.message || '获取记录失败')
    }
}

const handleQuery = () => {
    fetchScores(1)
}

const changePage = (page: number) => {
    fetchScores(page)
}

onMounted(() => {
    fetchScores(1)
})
</script>

<style scoped>
.el-table .cell {
    white-space: nowrap;
}
</style>