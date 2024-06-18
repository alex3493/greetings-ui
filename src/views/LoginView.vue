<template>
  <div class="container">
    <div class="d-flex justify-content-center">
      <div class="card col-lg-4 col-sm-6 col-xs-12">
        <div class="card-body">
          <form name="login-form">
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="email" class="form-label">Email </label>
              <input type="text" class="form-control" id="email" v-model="email"/>
            </div>
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="password" class="form-label">Password </label>
              <input type="password" class="form-control" id="password" v-model="password"/>
            </div>
            <button class="btn btn-outline btn-primary" type="submit" @click.prevent="submitForm()">
              <span v-if="isBusy" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
              Login
            </button>
          </form>
          <div class="mt-2">
            Do not have an account?
            <router-link to="/register">Register</router-link>
          </div>
        </div>
        <div v-if="loginError" class="card-footer">
          <div class="alert alert-danger" role="alert">
            {{ loginError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import BackendService from '@/service/BackendService'
import {mapGetters} from 'vuex'
import store from "@/store";
import router from "@/router";

const service = new BackendService()

export default defineComponent({
  name: 'LoginView',
  data: () => ({
    email: '',
    password: '',
    loginError: ''
  }),
  computed: {
    ...mapGetters({
      isActionInProgress: 'settings/isActionInProgress',
      isBusy: 'settings/isBusy'
    })
  },
  methods: {
    submitForm() {
      console.log('Submitting login form...', this.email, this.password);
      service.post('/login_check', {
        email: this.email,
        password: this.password,
      })
          .then(({data}) => {
            console.log(data)
            this.loginError = ''
            service.setSession(data.token, data.refresh_token)

            service.get('/dashboard').then(({data}) => {
              console.log(data)
              store.dispatch('user/setCurrentUser', data.user)

              router.replace('/')
            })
          })
          .catch((error) => {
            console.log('Error caught in login view', error)
            if (error.code === 401) {
              this.loginError = 'Invalid email or password'
            }
          })
    }
  }
})

</script>

<style scoped lang="scss">

</style>
