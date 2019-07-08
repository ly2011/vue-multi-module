<template>
  <div class="home">
    <h3 class="title">Home 页面</h3>
    <button @click="goAbout">跳转到About页面</button>
  </div>
</template>

<script>
export default {
  methods: {
    goAbout () {
      this.$router.push('/salary/about')
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  font-size: 32px;
  color: red;
}
</style>
