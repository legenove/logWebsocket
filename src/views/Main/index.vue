<template>
  <div>
    <Layout>
      <Header class="myHeader">
        <Row>
          <Col span="4"><h3><img class="logo" src="./assets/logo_cms.png"/>测试服务器日志</h3></Col>
          <Col span="4">
            <Tag color="blue">服务器</Tag>
            ：
            <Dropdown style="margin-left: 10px" trigger="click" @on-click="handleSelectServer" >
              <a href="javascript:void(0)">
                {{ serverName }}
                <Icon type="arrow-down-b"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem v-for="server in serverList" :name="server">{{ server }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Col>
        </Row>
      </Header>
      <Content class="myContent">
        <Row>
          <Alert style="margin-left: 1%; margin-right: 1%;">当前版本：{{ versionInfo.datas }}</Alert>
        </Row>
        <Row>
          <Col span="24">
            <Card class="baseCard">
                <p slot="title">docker运行状态</p>
                <div><Table :columns="dockerInfo.titles" :data="dockerInfo.datas"></Table></div>
            </Card>
        </Col>
        </Row>
        <Row style="margin-top: 10px">
          <Col span="24">
            <card :padding="0" class="baseCard restartLogTitle" :dis-hover="true">
              <p slot="title">
                <Icon type="clipboard"></Icon>
                Restart.log
              </p>
              <a slot="extra" @click.prevent="onClickConnect('restart-log')">
                <Icon type="log-in"></Icon>
                {{ restartInfo.connected? "断开" : "链接" }}
              </a>
            </card>
            <Card id="restart-log" :padding="10" class="baseCard restartLog" :dis-hover="true">
              <p v-for="d in restartInfo.datas">{{ d }}</p>
            </Card>
          </Col>
        </Row>
        
        <Row style="margin-top: 10px">
          <Col span="8">
            <card :padding="0" class="baseCard restartLogTitle" :dis-hover="true">
              <p slot="title">
                <Icon type="clipboard"></Icon>
                Docker-前端.log
              </p>
              <a slot="extra" @click.prevent="onClickConnect('docker-front')">
                <Icon type="log-in"></Icon>
                {{ dockerFront.connected? "断开" : "链接" }}
              </a>
            </card>
            <Card id="docker-front" :padding="10" class="baseCard restartLog" :dis-hover="true">
              <p v-for="d in dockerFront.datas">{{ d }}</p>
            </Card>
          </Col>
          
          <Col span="8">
            <card :padding="0" class="baseCard restartLogTitle" :dis-hover="true">
              <p slot="title">
                <Icon type="clipboard"></Icon>
                Docker-APP.log
              </p>
              <a slot="extra" @click.prevent="onClickConnect('docker-app')">
                <Icon type="log-in"></Icon>
                {{ dockerApp.connected? "断开" : "链接" }}
              </a>
            </card>
            <Card id="docker-app" :padding="10" class="baseCard restartLog" :dis-hover="true">
              <p v-for="d in dockerApp.datas">{{ d }}</p>
            </Card>
          </Col>
          <Col span="8">
            <card :padding="0" class="baseCard restartLogTitle" :dis-hover="true">
              <p slot="title">
                <Icon type="clipboard"></Icon>
                Docker-API.log
              </p>
              <a slot="extra" @click.prevent="onClickConnect('docker-api')">
                <Icon type="log-in"></Icon>
                {{ dockerApi.connected? "断开" : "链接" }}
              </a>
            </card>
            <Card id="docker-api" :padding="10" class="baseCard restartLog" :dis-hover="true">
              <p v-for="d in dockerApi.datas">{{ d }}</p>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  </div>
</template>

<script>
	export default {
		name: 'Main',
		components: {},
		data() {
			return {
				socketConnect: true,
        interval: null,
				socket: null,
				serverList: ['dev1', 'dev2', 'dev3', 'dev4', 'dev5', 'dev6', "dev7"],
				serverName: "dev1",
        versionInfo: {datas: ""},
        dockerInfo: {datas: [],
                    titles:[{
                        title: '容器ID',
                        key: '0'
                    },
                    {
                        title: '创建时间',
                        key: '1'
                    },
                    {
                        title: 'IMAGE',
                        key: '2'
                    },
                    {
                        title: '启动时间',
                        key: '3'
                    },
                    {
                        title: 'PORTS',
                        key: '4'
                    }]},
				restartInfo: {
					connected: false,
          type: 'restart-log',
					datas: []
				},
				dockerFront: {
					connected: false,
          type: 'docker-front',
					datas: []
				},
				dockerApp: {
					connected: false,
          type: 'docker-app',
					datas: []
				},
				dockerApi: {
					connected: false,
          type: 'docker-api',
					datas: []
				}
			}
		},
		methods: {
			handleSelectServer: function (name) {
        if (name != this.serverName) {
          this.changeDevServer()
          this.serverName = name
          this.scheduleGetInfo()
          this.onClickConnect('restart-log')
        }
			},
      disconnectServer: function (info) {
        if (info.connected) {
          event = 'stop'
          this.sendMessage(event, {
          type: info.type
        })
        }
      },
      connectToServer: function (info) {
        let event = 'file';
        if (info.connected) {
          event = 'stop'
        }
        this.sendMessage(event, {
          type: info.type
        })
      },
      changeDevServer: function() {
        let currentInfo = this.getCurrentInfo('restart-log')
        currentInfo.datas=[]
        this.disconnectServer(currentInfo)
        let currentInfo = this.getCurrentInfo('docker-app')
        this.disconnectServer(currentInfo)
        currentInfo.datas=[]
        let currentInfo = this.getCurrentInfo('docker-api')
        this.disconnectServer(currentInfo)
        currentInfo.datas=[]
        let currentInfo = this.getCurrentInfo('docker-front')
        this.disconnectServer(currentInfo)
        currentInfo.datas=[]
      },
      onClickConnect: function(eleID) {
        let currentInfo = this.getCurrentInfo(eleID)
        this.connectToServer(currentInfo)
      },
      cardScrollTop: function(eleID) {
        let cur = document.getElementById(eleID)
        cur.scrollTop = cur.scrollHeight - cur.clientHeight;
      },
      sendMessage: function(event, data){
        if (!this.socketConnect) {
          this.$Message.destroy()
          this.$Message.error('已经与服务器断开链接!')
        }
        data['serverName'] = this.serverName
        console.log(event, data)
        this.socket.emit(event, data)
      },
      scheduleGetInfo: function() {
        this.sendMessage('file', {
          type: 'docker'
        }),
        this.sendMessage('file', {
          type: 'version'
        })
      },
      getCurrentInfo: function(dtype) {
        if (dtype == 'restart-log') {
          return this.restartInfo
        } else if (dtype == 'docker-front') {
          return this.dockerFront
        } else if (dtype == 'docker-app') {
          return this.dockerApp
        } else if (dtype == 'docker-api') {
          return this.dockerApi
        } else if (dtype == 'docker') {
          return this.dockerInfo
        } else if (dtype == 'version') {
          return this.versionInfo
        }
      },
      socketListen: function() {
        let that = this
        this.socket.on('welcome', function (data) {
        console.log(data);
        that.socketConnect = true;
        });
        this.socket.on('cReady', function (data) {
          let currentInfo = that.getCurrentInfo(data.type)
          if (data.type == 'docker') {
          } else if (data.type == 'version') {
          } else {
            currentInfo.connected = true;
            that.cardScrollTop(data.type);
          }
        });
        this.socket.on('cStop', function (data) {
          let currentInfo = that.getCurrentInfo(data.type)
          if (data.type == 'docker') {
          } else if (data.type == 'version') {
          } else {
            currentInfo.connected = false;
          }
        });
        this.socket.on('tail', function (data) {
          console.log(data)
          let addText = data.tail
          let currentInfo = that.getCurrentInfo(data.type)
          addText = addText.replace('\r\n', '\n')
          addText = addText.split('\n')
          for (let x in addText) {
            if (addText[x]) {
              if (data.type == 'docker') {
                if (x==0){currentInfo.datas = [];}
                addText[x] = addText[x].replace(/"/g, '')
                addText[x] = addText[x].split('\t')
                currentInfo.datas.push(addText[x]);
              } else if (data.type == 'version') {
                currentInfo.datas = addText[x];
              } else {
                currentInfo.datas.push(addText[x]);
                that.cardScrollTop(data.type);
              }
            }
          }
        })
        this.socket.on('disconnect', function () {
          that.socketConnect = false;
        });
      }
		},
    mounted () {
			this.socket = io.connect('http://127.0.0.1:3030/');
			console.log(this.socket)
      this.socketListen()
      this.scheduleGetInfo()
      this.onClickConnect('restart-log')
      this.interval = setInterval(() => { 
            this.scheduleGetInfo();
        }, 10000)
    }
	}
</script>

<style scoped>
  .myHeader {
    position: fixed;
    width: 100%;
    height: 65px;
    top: 0;
    right: 0;
    z-index: 1000;
    background: #fff;
  }
  
  .myHeader h3 {
    display: inline-block;
    flex-grow: 1;
    margin: 0;
    /*padding: 15px 0 10px 20px;*/
    font-weight: normal;
  }
  
  .myHeader .logo {
    margin-right: 10px;
    width: 30px;
    vertical-align: middle;
    border-radius: 50%;
  }
  
  .myContent {
    margin: 70px 5px 0 5px;
    padding: 10px 0 20px 0;
    background: #fff;
  }
  .baseCard {
    margin-left: 1%;
    width: 98%;
  }
  .restartLogTitle {
    z-index: 0;
  }
  
  .restartLog {
    z-index: 1;
    margin-top: -3px;
    height: 400px;
    overflow: hidden;
    position: relative;
    overflow-y: scroll;
  }
  .restartLog .ivu-card-head {
    position: fixed;
  }
  
  .wrapper {
    height: 100vh;
  }
</style>
