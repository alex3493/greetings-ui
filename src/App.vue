<template>

  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <!--a class="navbar-brand" href="#">Navbar</a-->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Greetings</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
          <li v-if="isLoggedIn" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
               data-bs-toggle="dropdown"
               aria-expanded="false">
              {{ currentUser.display_name }}
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <!--li>
                <a class="dropdown-item">
                  <router-link class="nav-link" to="/dashboard">Profile</router-link>
                </a>
              </li-->
              <!--li>
                <hr class="dropdown-divider">
              </li-->
              <li><a class="dropdown-item" href="#" @click.prevent="logout">Log Out</a></li>
            </ul>
          </li>
          <li v-if="isAdmin" class="nav-item dropdown">
            <a class="nav-link"
               href="#"
               @click.prevent="openAdminGreetingDialog"
               role="button"
               aria-expanded="false">
              Admin Greeting
            </a>
          </li>
        </ul>
        <!--form class="d-flex">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form-->
      </div>
    </div>
  </nav>

  <div class="container">
    <router-view/>
  </div>

  <AdminGreetingForm @close="closeEditGreetingModal"/>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {mapActions, mapGetters} from "vuex"
import UserService from "@/service/UserService"
import PusherService from '@/service/PusherService'
import {AdminGreetingDTO} from "@/models/types";
import AdminGreetingForm from "@/components/AdminGreeting.vue";
import {Modal} from "bootstrap";
import router from "@/router";
import {PusherEvent} from "pusher-js/types/src/core/connection/protocol/message-types";

const userService = new UserService()
const pusher = PusherService.shared()

interface componentData {
  greetingModal: Modal | undefined
}

interface PusherStates {
  previous: string
  current: string
}

export default defineComponent({
  name: 'App',
  components: {
    AdminGreetingForm,
  },
  data(): componentData {
    return {
      greetingModal: undefined
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'user/getCurrentUser',
      isLoggedIn: 'user/isLoggedIn',
      isAdmin: 'user/isAdminUser',
    })
  },
  async mounted() {
    console.log('App mounted')
  },
  beforeUnmount() {
    console.log('App before unmount')

    this.unsubscribePusher()
  },
  watch: {
    isLoggedIn: {
      handler(newVal: boolean, oldVal: boolean) {
        if (newVal) {
          console.log('Subscribing to pusher')
          this.subscribePusher()
        } else if (!newVal && oldVal) {
          console.log('Unsubscribing from pusher')
          this.unsubscribePusher()

          router.replace('/login')
        }
      },
      immediate: true,
    }
  },
  methods: {
    ...mapActions({
      setCurrentUser: 'user/setCurrentUser'
    }),
    logout() {
      userService.logout()
    },
    subscribePusher() {
      try {
        const channel = pusher.subscribe('private-greeting')
        channel.bind('message_sent', (data: AdminGreetingDTO) => {
          console.log('Pusher message', data, data.author_id, this.currentUser.id)
          if (data.author_id !== this.currentUser.id) {
            // Only show toast if author is not self.
            /*const instance =*/
            this.$toast.open({
              message: `${data.author_name}<br>${data.greeting}`,
              type: 'default',
              duration: 10000
            });
          }
          // Force dismiss specific toast
          // instance.dismiss()

          // Dismiss all opened toast immediately
          // this.$toast.clear()
        })

        channel.bind_global((event: string, data: PusherEvent) => {
          console.log(`DEBUG :: Pusher event "${event}" was triggered with data ${JSON.stringify(data)}`);
        })

        pusher.connection.bind('state_change', (states: PusherStates) => {
          console.log(`Pusher connection state changed from ${states.previous} to ${states.current}`);
        });

      } catch (e) {
        console.log(e)
      }
    },
    unsubscribePusher() {
      pusher.unsubscribe('private-greeting')
    },
    openAdminGreetingDialog() {
      console.log('openAdminGreetingDialog')
      this.greetingModal = new Modal(document.getElementById('adminGreetingModal') as HTMLElement)
      this.greetingModal.show()
    },
    closeEditGreetingModal() {
      console.log('closeEditGreetingModal')
      if (this.greetingModal) {
        this.greetingModal.hide()
      }
      this.greetingModal = undefined
    },
  },
})
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }

  .admin-greeting-dropdown {
    min-width: 50vw;
  }

}
</style>

