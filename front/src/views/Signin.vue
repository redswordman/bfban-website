<template>
  <div class="container">
    <br>
    <div class="content">
      <Row :gutter="0">
        <Col :xs="{span: 24}" :lg="{span: 11}" class="mobile-hide carousel">
          <Carousel :autoplay-speed="5000" :dots="'none'" class="carousel-item">
            <CarouselItem>
              <img src="../assets/images/logo.png">
              <h2>{{ $t("home.cover.h1") }}</h2>
              <span>{{ $t("home.cover.h3") }}</span>
            </CarouselItem>
          </Carousel>
        </Col>
        <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 13, push: 0, pull: 0}">
          <Card v-if="currentUser.token == ''" shadow>
            <p slot="title">{{ $t("signin.title") }}</p>
            <Form ref="signin" :model="signin" :rules="ruleValidate">
              <FormItem :label="$t('signin.form.username')" prop="username">
                <Input prefix="ios-contact" type="text" v-model="signin.username" size="large"
                       :placeholder="$t('signin.form.username')">
                </Input>
              </FormItem>

              <FormItem :label="$t('signin.form.password')" prop="password">
                <Input type="password" password v-model="signin.password" size="large"
                       :placeholder="$t('signin.form.password')"/>
              </FormItem>

              <FormItem :label="$t('captcha.title')" prop="captcha">
                <Input type="text" v-model="signin.captcha" size="large" maxlength="4"
                       :placeholder="$t('captcha.title')">
                  <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                    <Captcha ref="captcha"></Captcha>
                  </div>
                </Input>
              </FormItem>

              <FormItem>
                <Button @click.prevent.stop="handleSignin" long :loading="spinShow" size="large" type="primary">
                  {{ $t('signin.form.submit') }}
                </Button>

                <Divider>
                  <router-link :to="{name: 'signup'}">{{ $t('signin.form.submitHint') }}</router-link>
                  <Divider type="vertical"/>
                  <router-link :to="{name: 'forgetPassword'}">{{ $t('signin.form.forgetPasswordHint') }}</router-link>
                </Divider>
              </FormItem>
            </Form>
          </Card>
          <Card v-if="currentUser.token != ''" shadow align="center">
            <br>
            <Avatar size="100">{{ currentUser.userinfo.username[0] }}</Avatar>
            <h1>
              {{ currentUser.userinfo.username }}
            </h1>
            <p>哎列？请先登出 (✿◡‿◡)</p>
            <br>
          </Card>
        </Col>
      </Row>
    </div>
    <br>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {api, http} from '../assets/js/index'
import Captcha from "../components/Captcha";
import Vuex from "vuex";
import _ from "lodash";

const {mapActions, mapMutations} = Vuex;

export default new BFBAN({
  components: {Captcha},
  data() {
    return {
      ruleValidate: {
        username: [
          {required: true, trigger: 'blur'}
        ],
        password: [
          {required: true, trigger: 'blur'}
        ],
        captcha: [
          {required: true, max: 4, trigger: 'blur'}
        ],
      },
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
      spinShow: false,
    }
  },
  beforeMount() {
    if (this.$route.query.rurl) {
      this.$Message.info(this.$t('signin.loginFirst'));
    }
  },
  methods: {
    ...mapActions({
      'signinUser': 'signin'
    }),
    ...mapMutations([
      'SIGNIN'
    ]),

    // 登录
    handleSignin() {
      const that = this;
      const {username, password, captcha} = _.each(this.signin, (v, k, o) => {
        o[k] = v.trim();
      });

      this.$refs['signin'].validate((valid) => {
        if (valid) {
          this.spinShow = true;

          http.post(api["account_signin"], {
            data: {
              data: {
                username,
                password,
              },
              encryptCaptcha: this.$refs.captcha.hash,
              captcha,
            },
          }).then((res) => {
            const d = res.data;

            if (d.error === 1) {
              that.$Message.error(this.$t('signin.failed') + ': ' + d.message);
              that.signin.password = '';
              that.signin.captcha = '';
              that.refreshCaptcha();
            } else {
              that.signinUser(d.data).then(() => {
                const rurl = this.$route.query.rurl;

                // redirect rurl or home
                if (rurl) {
                  this.$router.push(rurl);
                } else {
                  this.$router.go('-1');
                }

                this.$Message.success(this.$t('signin.success'));
              })
            }
          }).finally((res) => {
            that.spinShow = false;
          });

        } else {
          this.$Message.error(this.$t('signin.fillEverything'));
        }
      });
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
});
</script>

<style lang="scss" scoped>
.carousel {
  border-bottom: 2px solid #f2f2f2;
  width: 440px;
  overflow: hidden;
  //background: #fff;
  background: #401487;

  > * {
    background-image: url("https://app.bfban.com/public/svg/bk1.svg");
    background-repeat: repeat;
  }

  .carousel-item {
    text-align: center;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    align-content: center;
    height: 100%;
    color: #fff;

    img {
      width: 150px;
      height: 150px;
    }
  }
}
</style>