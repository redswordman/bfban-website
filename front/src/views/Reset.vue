<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("reset.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Card dis-hover>
        <Form :label-width="80">
          <FormItem :label="$t('reset.form.qq')">
            <Input type="text" v-model="reset.qq" :placeholder="$t('reset.form.qq')"/>
          </FormItem>

          <FormItem :label="$t('reset.form.password')">
            <Input type="password" v-model="reset.password" :placeholder="$t('reset.form.password')"/>
          </FormItem>

          <FormItem :label="$t('reset.form.passwordRepeat')">
            <Input type="password" v-model="reset.passwordRepeat" :placeholder="$t('reset.form.passwordRepeat')"/>
          </FormItem>

          <FormItem>
            <Button @click.prevent.stop="handleReset" type="primary">{{ $t('reset.form.submit') }}</Button>
          </FormItem>

          <Spin size="large" fix v-show="spinShow"></Spin>
        </Form>
      </Card>
    </div>
  </div>

</template>

<script>
import BFBAN from "../assets/js/bfban";

import {http, api, http_token} from '../assets/js/index'
import { waitForAction} from '@/mixins/common';

const {mapActions, mapMutations} = Vuex;

export default new BFBAN({
  data() {
    return {
      reset: {
        qq: '',
        password: '',
        passwordRepeat: '',
      },
      spinShow: false,
    }
  },
  created() {
    this.http = http_token.call(this);
  },
  methods: {
    handleReset() {
      const {qq, password, passwordRepeat} = _.each(this.reset, (v, k, o) => {
        o[k] = v.trim();
      });

      const {token} = this.$route.query

      if (qq && password && passwordRepeat && password === passwordRepeat) {
        this.spinShow = true;

        this.http.post(api["player_reset"], {
          data: {
            qq, token, password, passwordRepeat,
          },
        }).then((res) => {
          this.spinShow = false;

          const d = res.data;

          this.$Message.success(d.msg);
          if (d.error === 1) {
            this.reset.password = '';
            this.reset.passwordRepeat = '';
          } else {
            this.$router.push('/signin')
          }
        })
      } else {
        this.$Message.error(this.$i18n.t('signup.fillIn'));
      }
    }
  }
});
</script>

<style>
</style>
