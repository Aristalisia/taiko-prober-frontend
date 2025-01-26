<template>
    <!-- 动态加载对应的页面视图 -->
    <router-view></router-view>  
</template>

<script setup>

</script>

<style>
/* 全局样式 */
@import url("./assets/fonts/font.css");
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
}

</style>
