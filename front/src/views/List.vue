<template>
  <div>
    <div class="container">
      <div class="content">
        <br>
        <Row>
          <Col :xs="{push: 1}" :lg="{push: 0}">
            <Breadcrumb>
              <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
              <BreadcrumbItem>{{ $t("list.title") }}</BreadcrumbItem>
            </Breadcrumb>
          </Col>
        </Row>
        <br>

        <!-- 游戏类型选择 S -->
        <Row>
          <Col flex="auto" :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
            <RadioGroup
                size="large"
                class="game-type"
                v-model="gameName"
                @on-change="handleChanges"
                type="button">
              <Radio label="all" value="all">
                <Badge :count="getTotalNum('*')" :overflow-count="90000" type="normal">
                  {{ $t('basic.games.all') }}
                </Badge>
              </Radio>
              <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value"
                     :style="'background-image: url(' + require('/src/assets/' + i.bk_file + '/bf.jpg') + ');'"
                     :class="gameName == i.value ? 'gametype-select' : ''">
                <Badge :count="getTotalNum(i.value)" :overflow-count="90000" type="info">
                  <Tooltip :content="$t('basic.games.' + i.value)" placement="top-start">
                    <img height="35" :src="require('/src/assets/' + i.bk_file + '/logo.png')" v-if="i.logo_src"/>
                    <span v-else>{{ i.full_name }}</span>
                  </Tooltip>
                </Badge>
              </Radio>
            </RadioGroup>
          </Col>
          <Col flex="auto" v-if="statusGroup == 6 || statusGroup == 0">
            <i-switch v-model="bot.autoUpdate" @on-change="autoUpdateList"/>
            <Divider type="vertical"/>
            <Tooltip content="每隔设置时间刷新，有新的待审核桌面通知您" max-width="200">
              <Icon type="md-help-circle"/>
            </Tooltip>
          </Col>
        </Row>
        <!-- 游戏类型选择 E -->

        <RadioGroup
            style="margin-top: 12px"
            v-model="statusGroup"
            @on-change="handleStatusChange"
            type="button">
          <Radio label="-1">
            <Badge :overflow-count="900000"
                   size="small"
                   type="info">
              {{ $t("basic.status.all") }}
            </Badge>
          </Radio>
          <Radio
              v-for="status in cheaterStatus"
              :key="status.value"
              :label="`${status.value}`">
            <Badge :count="getcHeaterStatusNum(status.value)" :overflow-count="900000" type="info">
              {{ $t(`basic.status[${status.value}]`) }}{{ status[$i18n.locale] }}
            </Badge>
          </Radio>
        </RadioGroup>

        <Row :gutter="10">
          <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 17, push: 0, pull: 0}">
            <Card dis-hover class="list">
              <Page :page-size="limit" show-sizer show-total show-elevator :current="skip" @on-change="handlePageChange"
                    @on-page-size-change="handlePageSizeChange" :total="total" class="page" size="small"/>
              <Spin size="large" fix show-elevator v-show="spinShow"></Spin>
              <br>
              <div v-for="d in data" :key="d.originUserId">
                <Badge :text=" d.viewNum > 100 && d.commentsNum > 10 ? 'hot': ''" style="width: 100%">
                  <Card>
                    <Row :gutter="10" type="flex">
                      <Col :xs="{span: 8, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}">
                        <!-- 头像 S -->
                        <Avatar :src="d.avatarLink || '//bfban-static.bamket.com/assets/images/avatar.png'"
                                alt="avatar"
                                size="55">
                        </Avatar>
                        <!-- 头像 E -->
                      </Col>
                      <Col :xs="{span: 16, push: 0,pull:0}" :lg="{span: 15, push: 0,pull:0}">
                        <div style="display: flex; flex-direction: column;">
                          <router-link
                              :to="{name: 'cheater', params: { ouid: `${d.originPersonaId}` }}">
                            <Tooltip :content="$t('list.colums.playerId')">
                              <h2>
                                {{ d.originName }}
                                <Button size="small" type="text" icon="ios-copy-outline"
                                        :data-clipboard-text="d.originId"
                                        @click="copied"></Button>
                              </h2>
                            </Tooltip>
                          </router-link>
                        </div>

                        {{ $t('list.colums.reportTime') }}
                        <Time v-if="d.createTime" :time="d.createTime"/>
                        <Divider type="vertical"/>
                        {{ $t('list.colums.updateTime') }}
                        <Time v-if="d.updateTime" :time="d.updateTime"/>
                      </Col>
                      <Col :xs="{span: 24, push: 0,pull:0}" :lg="{span: 4, push: 0,pull:0}" class="mobile-hide">
                        <Row type="flex" justify="center" align="middle" style="height: 50px">
                          <Col flex="auto" align="right">
                            <span class="item-text">{{ d.viewNum || 0 }} </span>
                            <Icon type="md-eye" size="17" class="item-icon"/>
                          </Col>
                          <Col flex="auto" align="right">
                            <span class="item-text">{{ d.commentsNum || 0 }}</span>
                            <Icon type="md-chatboxes" size="17" class="item-icon"/>
                          </Col>
                        </Row>
                      </Col>
                      <Col :xs="{span: 24, push: 0,pull:0}" :lg="{span: 2, push: 0,pull:0}" align="center"
                           class="mobile-hide">
                        <Progress vertical :percent="0" hide-info/>
                        <Divider type="vertical"/>
                        <Progress vertical :percent="d.status == 1 ? 99 : 100" hide-info status="wrong"/>
                      </Col>
                    </Row>
                  </Card>
                  <br/>
                </Badge>
              </div>
              <Card v-if="data.length <= 0" align="center">
                (｀ﾍ´)=3=3=3=3=3=3
              </Card>
              <Page :page-size="limit" show-sizer show-total show-elevator :current="skip" @on-change="handlePageChange"
                    @on-page-size-change="handlePageSizeChange" :total="total" class="page" size="small"/>
            </Card>
          </Col>
          <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 7, push: 0, pull: 0}">
            <br>
            <Affix :offset-top="20">
              <Card>
                <p slot="title">
                  <Icon type="md-funnel" /> {{ $t('list.colums.screenTitle') }}
                </p>

                <Form>
                  <FormItem :label="$t('list.reportTime')">
                    <DatePicker :value="createTime" @on-change="handleCDatepicker" split-panels
                                :placeholder="$t('list.reportTime')" style="width: 100%"></DatePicker>
                  </FormItem>
                  <FormItem :label="$t('list.updateTime')">
                    <DatePicker :value="updateTime" @on-change="handleUDatepicker" split-panels
                                :placeholder="$t('list.updateTime')" style="width: 100%"></DatePicker>
                  </FormItem>
                  <FormItem>
                    <Select @on-change="handleChanges" v-model="sortByValue">
                      <Option v-for="item in sortBy" :value="item.value" :key="item.value">
                        {{ $t(`list.filters.sortBy.${item.value}`) }}
                      </Option>
                    </Select>
                  </FormItem>
                </Form>
                <!--                <Divider class="desktop-hide"></Divider>-->
                <!--                <Select class="desktop-hide" @on-change="handleChanges" v-model="statusGroup" style="width: 100%">-->
                <!--                  <Option value="-1">{{ $t("list.filters.status.all") }}({{ getAllStatusNum }})</Option>-->
                <!--                  <Option v-for="status in cheaterStatus" :value="status.value" :key="status.value">-->
                <!--                    {{ status.label }}({{ getcHeaterStatusNum(status.value) }})-->
                <!--                  </Option>-->
                <!--                </Select>-->
              </Card>
            </Affix>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {api, http, util} from '../assets/js/index'
import cheaterStatus from '/public/conf/cheaterStatus.json'
import gameName from '/public/conf/gameName.json'
import _ from "lodash";

export default new BFBAN({
  data() {
    return {
      games: [],
      data: [],
      spinShow: true,
      gameName: "all",
      statusGroup: "",
      createTime: "",
      updateTime: "",
      skip: 1,
      limit: 10,
      total: 0,
      gameSum: [],
      totalSum: [],
      sortBy: [
        {value: "createTime",},
        {value: "updateTime",},
        {value: "viewNum",},
        {value: "commentNum",},
      ],
      sortByValue: "createTime",
      cheaterStatus: null,

      bot: {
        autoUpdate: false,
        time: 10000
      }
    };
  },
  created() {
    this.loadData();
  },
  watch: {
    $route: "loadData",
  },
  methods: {
    getCheaterStatusLabel: util.getCheaterStatusLabel,
    autoUpdateList() {
      const that = this;

      if (!that.bot.autoUpdate) {
        clearInterval(this.bot.fun);
        return;
      }

      that.bot.fun = setInterval(function () {
        that.getCheaterList();
      }, that.bot.time)
    },
    /**
     * 游戏数量统计
     */
    getTotalNum(val) {
      let target = {};
      switch (val) {
        case '*':
          // 总数
          this.gameSum.forEach(i => {
            return target.num += (i.count);
          });
          break;
        default:
          target = _.find(this.gameSum, ["game", val]);
      }
      return target ? target.num : 0;
    },
    getcHeaterStatusNum(val) {
      let target = _.find(this.totalSum, ["status", val]);
      return target ? target.num : 0;
    },
    /**
     * 复制文本
     */
    copied() {
      this.$Message.info("已复制");
    },
    /**
     * 加载数据
     * @returns {Promise<void>}
     */
    async loadData() {
      await util.initUtil().then((res) => {
        this.cheaterStatus = res.cheaterStatus;

        this.games = res.gameName;
      });

      this.getCheaterList();
      this.getPlayerStatistics();
    },
    /**
     * 取得数量统计
     */
    getPlayerStatistics() {
      const that = this;
      let data = {
        data: []
      };
      let splitIndex = 0;

      gameName.child.forEach(i => {
        data.data.push({"game": i.value, "status": -1});
        splitIndex++;
      });

      cheaterStatus.child.forEach((i, index) => {
        data.data.push({"game": this.gameName == 'all' ? '*' : this.gameName, "status": index})
      });

      http.post(api['playerStatistics'], {
        data,
      }).then(res => {
        const d = res.data;
        let gameSum = [];
        let totalSum = [];

        if (d.success === 1) {
          // game Type
          [].concat(d.data).splice(0, splitIndex).forEach((i, index) => {
            gameSum.push({game: that.games[index].value.toString(), num: Number(i.count)})
          });
          this.gameSum = gameSum;

          // type methods
          [].concat(d.data).splice(splitIndex, d.data.length - 1).forEach((i, index) => {
            totalSum.push({status: that.cheaterStatus.filter(i => i.value == index)[0].value, num: Number(i.count)})
          });
          this.totalSum = totalSum;
        }
      }).catch((res) => {
        this.$Message.error(res.message);
      })
    },
    /**
     * 取得作弊玩家列表
     */
    getCheaterList() {
      this.spinShow = true;

      // default values
      const {game = "all", status = -1, createTime, updateTime, skip = this.skip, sort = "updateTime", limit = this.limit} = this.$route.query;

      let config = {
        params: {
          game,
          skip: (skip - 1) * limit,
          sort,
          status,
          tz: '', // moment.tz.gutter(),
          limit,
        },
      };

      if (createTime) {
          config["params"]["createTime"] = new Date(createTime).getTime();
      }

      if (updateTime) {
          config["params"]["updateTime"] = new Date(updateTime).getTime();
      }

      this.gameName = game;
      this.statusGroup = status;
      this.createTime = createTime;
      this.updateTime = updateTime;
      this.skip = Number.parseInt(skip);
      this.limit = Number.parseInt(limit);
      this.sortByValue = sort;

      http.get(api['players'], config).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.data = d.data.result || [];
          this.total = d.data.total;
        } else {
          this.catch(res);
        }
      }).catch((err) => {
        this.$Message.error(err.code);
      }).finally(() => {
        this.spinShow = false;
      });
    },
    routerQuery() {
      const game = this.gameName;
      const status = this.statusGroup;
      const createTime = this.createTime; //.join(",");
      const updateTime = this.updateTime; // .join(",");
      const skip = this.skip;
      const limit = this.limit;
      const sort = this.sortByValue;

      let o = {};

      o["status"] = status;
      if (createTime !== ",") o["createTime"] = createTime;
      if (updateTime !== ",") o["updateTime"] = updateTime;
      if (skip !== 1) o["skip"] = skip;
      o["limit"] = limit;
      if (sort !== "") o["sort"] = sort;
      if (game !== "") o["game"] = game;

      return o;
    },
    handleChanges() {
      this.spinShow = true;

      const query = this.routerQuery();

      this.$router.push({name: this.$router.name, query});
    },
    handleStatusChange() {
      this.skip = 1;

      this.handleChanges();
    },
    handleCDatepicker(date) {
      this.createTime = date;
      this.skip = 1;

      this.handleChanges();
    },
    handleUDatepicker(date) {
      this.updateTime = date;
      this.skip = 1;

      this.handleChanges();
    },
    handlePageChange(num) {
      this.skip = num;
      this.handleChanges();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.handleChanges();
    },
  },
  computed: {
    getAllStatusNum() {
      let target = {num: 0};
      switch (this.gameName) {
        case 'all':
          for (let i of this.gameSum)
            target.num += i.num || 0;
          break;
        default:
          target = _.find(this.gameSum, ["game", this.gameName]);
      }
      return target ? target.num : 0;
    },
  },
});
</script>

<style lang="scss" scoped>
.page {
  padding: 0 16px;
  margin: 13px -16px;
  display: inline-block;
  width: calc(100% + 32px);
}

.list {
  margin: 20px 0;
  position: relative;

  .item-icon {
    margin: 0 10px;
  }
}

.game-type {
  padding-top: 1rem;

  label {
    text-align: center;
    min-width: 130px;
    animation: all .25s;
    background-size: cover;
    background-position: center;
  }

  label:first-child {
    min-width: inherit !important;
  }

  img {
    margin: 5px 0;
    height: 30px;
    animation: all 1s;
  }

  .gametype-select {
    position: relative;
    animation: gameAnimation 15s infinite;
  }

  @keyframes gameAnimation {
    0% {
      background-position-y: 50%;
      background-size: 150%;
    }
    25% {
      background-position-y: 100%;
      background-size: 100%;
    }
    75% {
      background-position-y: 0%;
      background-size: 150%;
    }
    100% {
      background-position-y: 50%;
    }
  }
}
</style>