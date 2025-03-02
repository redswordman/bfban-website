<template>
  <header v-if="!isFull">
    <div class="header-container container">
      <router-link class="mobile-hide" :to="{name: 'home'}">
        <Badge text="beta" type="normal">
          <img src="../assets/images/logo.png"
               width="40"
               height="40"
               alt="bfban logo"/>
        </Badge>
      </router-link>
      <div class="nav nav-menu">
        <Icon class="desktop-hide" type="md-menu" size="30" @click="headerMenu.show = !headerMenu.show "/>
        <Drawer class="desktop-hide"
                :title="$t($route.name + '.title')"
                placement="left"
                width="300"
                :closable="true"
                v-model="headerMenu.show">

          <List v-show="!isLogin">
            <Card>
              <Row :gutter="10">
                <Col flex="1">
                  <div @click="navigatorTo({to: {name: 'signin'}})">
                    <Icon type="md-log-in" size="20"/>
                    {{ $t("header.signin") }}
                  </div>
                </Col>
                <Col>
                  <div @click="navigatorTo({to: {name: 'signup'}})">
                    <Icon type="md-person-add" size="20"/>
                    {{ $t("header.signup") }}
                  </div>
                </Col>
              </Row>
            </Card>
          </List>

          <List>
            <ListItem v-for="(i, index) in headerMenu.child" :key="index">
              <div @click.stop="navigatorTo(i)">
                {{ $t("header." + i.name) }}
              </div>
            </ListItem>
          </List>
        </Drawer>

        <router-link class="mobile-hide link"
                     :to="i.to"
                     v-for="(i, index) in headerMenu.child" :key="index">
          {{ $t("header." + i.name) }}
        </router-link>
      </div>
      <div class="nav">
        <router-link v-show="!isLogin" class="mobile-hide" :to="{name: 'signin'}">
          <Button type="primary" shape="circle">
            <Icon type="md-log-in"/>
            {{ $t("header.signin") }}
          </Button>
        </router-link>

        <Dropdown placement="bottom-end" v-if="isLogin" :padding="0">
          <router-link class="" :to="{name: 'account', params: { uId: `${currentUser.userinfo.userId}` }}">
            <Avatar>{{ currentUser.userinfo.username[0] || 'Null' }}</Avatar>
          </router-link>
          <span class="mobile-hide">&emsp;{{ currentUser.userinfo.username }}</span>
          <DropdownMenu slot="list" style="min-width: 260px;">
            <router-link :to="{name: 'account', params: { uId: `${currentUser.userinfo.userId}` }}">
              <DropdownItem>
                {{ $t("header.userCenter") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'report'}">
              <DropdownItem>
                {{ $t("header.report") }}
              </DropdownItem>
            </router-link>
            <router-link :to="{name: 'profile', params: { uId: `${currentUser.userinfo.userId}` }}">
              <DropdownItem>
                {{ $t("header.profile") }}
              </DropdownItem>
            </router-link>
            <Dropdown-item divided v-show="isLogin" @click="signout">
              <a @click.stop.prevent="signout">
                <Icon type="md-log-out"></Icon>
                {{ $t("header.signout") }}
              </a>
            </Dropdown-item>
          </DropdownMenu>
        </Dropdown>

        <Divider type="vertical" v-show="isLogin"/>

        <Tooltip :content="$t('profile.message.title')" placement="bottom-end">
          <Header_message v-show="isLogin">
            <Icon slot="content" type="md-notifications" size="30"/>
          </Header_message>
        </Tooltip>

        <Divider type="vertical"/>

        <Tooltip :content="$t('search.title')" placement="bottom-end">
          <router-link :to="{name: 'search_main'}">
            <Icon type="ios-search" size="28"/>
          </router-link>
        </Tooltip>

        <Divider type="vertical"/>

        <Tooltip :content="$t('home.howToUse.tools.main')" placement="bottom-end">
          <router-link :to="{name: 'apps'}">
            <Icon type="md-apps" size="30"/>
          </router-link>
        </Tooltip>
      </div>
    </div>
  </header>
</template>

<script>
import {api, http, http_token} from '../assets/js/index'

import menu from '/public/conf/headerMenu.json'

import Header_message from "./Header_message";

export default {
  data() {
    return {
      headerMenu: {
        show: false,
        child: [],
      },
      privileges: [],
    }
  },
  components: {Header_message},
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);
    this.headerMenu.child = menu.child;
  },
  methods: {
    async loadData() {
      const privileges = await import('/public/conf/privilege.json');
      this.privileges = privileges.child;
    },
    signout() {
      http.post(api["account_signout"], {
        headers: {
          'x-access-token': this.$store.state.user.token
        }
      }).then((res) => {
        const d = res.data;
        if (d.success === 1) {
          this.$Message.success(d.message);
          return;
        }

        this.cache(res);
      }).catch((e) => {
        this.$Message.error(e.toString());
      }).finally(() => {
        this.$store.dispatch('signout').then(() => {
          this.$router.push('/');
        });
      });
    },
    navigatorTo(i) {
      this.headerMenu.show = false;
      this.$router.push({name: i.to.name, query: i.to.query});
    }
  },
  computed: {
    isLogin() {
      return Boolean(this.$store.state.user);
    },
    isAdmin() {
      const user = this.$store.state.user;

      const is = user ? user.userPrivilege !== 'normal' : false;
      return Boolean(is);
    },
    isFull() {
      return Boolean(this.$route.query.full || false);
    },
    currentUser() {
      return this.$store.state.user;
    }
  }
}
</script>

<style lang="scss">
header {
  -webkit-app-region: drag;
  position: relative;
  z-index: 1000;
  width: 100%;
  height: auto;
  padding: 10px 0 !important;
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), transparent);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav {
  display: flex;
  align-items: center;
  padding: 0 .4rem;
  font-weight: bold;

  a.link {
    padding: .7rem .8rem;
    text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;
  }
}

.nav-menu {
  flex: 1;
}

.nav-username {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 6rem;
  flex-grow: 0;
}

.nav-signout {
  flex-shrink: 0;
}

@media screen and (min-width: 1088px) {
  .nav-username {
    width: 100%;
  }
}

.ivu-badge-dot {
  left: -4px;
}
</style>