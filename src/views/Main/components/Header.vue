<template>
  <div>
  
  </div>

</template>

<script>
	export default {
		name: 'MyHeader',
    props: ['server'],
		data() {
			return {
				title: '日志查看',
			}
		}
	}
</script>

<style scoped>
  .myHeader {
    position: fixed;
    width: 100%;
    top: 0;
    right: 0;
    z-index: 1000;
    background: #fff;
  }
  
  h3 {
    display: inline-block;
    flex-grow: 1;
    margin: 0;
    /*padding: 15px 0 10px 20px;*/
    font-weight: normal;
  }
  
  .logo {
    margin-right: 10px;
    width: 30px;
    vertical-align: middle;
    border-radius: 50%;
  }
</style>
