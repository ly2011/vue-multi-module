<template>
  <div class="about">
    <h3>About 页面</h3>
    <button @click="goBack">回到首页</button>
  </div>
</template>

<script>
export default {
  methods: {
    goBack () {
      this.$router.back()
    }
  }
}
</script>

<style>
</style>
