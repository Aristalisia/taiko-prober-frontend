<template>
    <div class="p-4 space-y-4">
        <!-- 顶部控制条 -->
        <div class="bg-white shadow rounded-xl p-4 flex flex-wrap justify-between items-center gap-2">
            <h2 class="text-xl font-bold">🎵 最近游玩记录</h2>
            <div class="content">
                <el-select v-model="sortType" size="normal" @change="handleQuery" class="custom-select">
                    <el-option label="按时间排序" value="time" class="custom-option" />
                    <el-option label="按得分排序" value="score" class="custom-option" />
                </el-select>
                <el-input v-model="searchKeyword" placeholder="搜索曲名" size="normal" clearable class="w-[240px]"
                    @clear="handleQuery" @keyup.enter.native="handleQuery" style="margin-top: 1vh;"/>
                <el-button size="normal" type="primary" @click="handleQuery" style="margin-top: 2vh;">查询</el-button>
            </div>
        </div>

        <!-- 表格 -->
        <el-table :data="scores" size="normal" border stripe class="rounded-xl shadow-sm" @row-click="showDetail">
            <el-table-column prop="song_no" label="ID" width="60" />
            <el-table-column label="曲名" min-width="200">
                <template #default="{ row }">
                    <div>
                        <div class="font-medium" :style="{ color: row.song_color }">{{ row.song_name }}</div>
                        <div class="text-sm text-gray-500">{{ row.song_name_jp }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="难度">
                <template #default="{ row }">
                    <el-tag size="small" type="info">{{ row.level }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="type" label="分区" />
            <el-table-column prop="high_score" label="得分" />
            <el-table-column prop="update_datetime" label="更新时间" min-width="150" />
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-between items-center px-2 mt-2">
            <div class="text-sm text-gray-600">当前页：{{ currentPage }} / {{ totalPages }}</div>
            <div class="space-x-2">
                <el-button size="small" @click="changePage(currentPage - 1)"
                    :disabled="currentPage <= 1">上一页</el-button>
                <el-button size="small" @click="changePage(currentPage + 1)"
                    :disabled="currentPage >= totalPages">下一页</el-button>
            </div>
        </div>

        <!-- 弹窗 -->
        <el-dialog v-model="detailVisible" title="🎯 游玩详情" width="500px">
            <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div><strong>曲名：</strong>{{ selectedScore?.song_name }}</div>
                <div><strong>原名：</strong>{{ selectedScore?.song_name_jp }}</div>
                <div><strong>难度：</strong>{{ selectedScore?.level }}</div>
                <div><strong>得分：</strong>{{ selectedScore?.high_score }}</div>
                <div><strong>分数评级：</strong>{{ selectedScore?.best_score_rank }}</div>
                <div><strong>良：</strong>{{ selectedScore?.good_cnt }}</div>
                <div><strong>可：</strong>{{ selectedScore?.ok_cnt }}</div>
                <div><strong>不可：</strong>{{ selectedScore?.ng_cnt }}</div>
                <div><strong>打击数：</strong>{{ selectedScore?.pound_cnt }}</div>
                <div><strong>连打数：</strong>{{ selectedScore?.combo_cnt }}</div>
                <div><strong>游玩次数：</strong>{{ selectedScore?.stage_cnt }}</div>
                <div><strong>Clear次数：</strong>{{ selectedScore?.clear_cnt }}</div>
                <div><strong>连段次数：</strong>{{ selectedScore?.full_combo_cnt }}</div>
                <div><strong>全良连段次数：</strong>{{ selectedScore?.dondaful_combo_cnt }}</div>
                <div class="col-span-2"><strong>游玩时间：</strong>{{ selectedScore?.update_datetime }}</div>
            </div>
        </el-dialog>
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

const detailVisible = ref(false)
const selectedScore = ref<any>(null)

const showDetail = (row: any) => {
    selectedScore.value = row
    detailVisible.value = true
}


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
    if (colors.length === 0) return '#000000'

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

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}


// 获取曲名
const songMap = new Map<number, { song_name: string; song_name_jp: string; type: string[] }>()

songList.forEach(song => {
    songMap.set(song.id, {
        song_name: song.song_name,
        song_name_jp: song.song_name_jp,
        type: song.type,
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
                song_color: color,
                level: item.level,
                best_score_rank: item.best_score_rank,
                good_cnt: item.good_cnt,
                ok_cnt: item.ok_cnt,
                ng_cnt: item.ng_cnt,
                pound_cnt: item.pound_cnt,
                combo_cnt: item.combo_cnt,
                stage_cnt: item.stage_cnt,
                clear_cnt: item.clear_cnt,
                full_combo_cnt: item.full_combo_cnt,
                dondaful_combo_cnt: item.dondaful_combo_cnt,
                type: (song?.type || []).join(' /  ')
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
/* scoped style */
.el-table .cell {
    white-space: nowrap;
}

.el-dialog__body {
    padding-top: 10px !important;
}

.el-option {
    padding: 100px;
}

</style>