<template>
  <div>
    <div class="card mt-4 mb-4">
      <div class="card-header">
        Recent Greetings
      </div>
      <div class="card-body">
        <div v-if="isLoadingGreetings" class="d-flex justify-content-center mb-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <table class="table" v-if="getGreetings.length">
          <thead>
          <tr>
            <th scope="col">Created</th>
            <th scope="col">From</th>
            <th scope="col" class="w-50">Message</th>
            <th scope="col">Updated</th>
            <th scope="col"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="greeting in getGreetings" :key="greeting.id" :class="`table-${greeting.variant.name}`">
            <td>{{ greeting.getCreatedAt() }}</td>
            <td>{{ greeting.author.display_name }}</td>
            <td>{{ greeting.text }}</td>
            <td>
              <div v-if="greeting.updated_at">
                {{ greeting.getUpdatedAt() }}
                <span v-if="greeting.updated_by.id !== greeting.author.id">
                  <br> by {{ greeting.updated_by.display_name }}
                </span>
              </div>
            </td>
            <td>
              <button
                  v-if="isAdmin || (isLoggedIn && getCurrentUser.id === greeting.author.id)"
                  type="button"
                  class="btn btn-sm btn-primary m-1"
                  @click="openEditGreetingDialog(greeting)"
              >
                Edit
              </button>
              <button
                  v-if="isAdmin || (isLoggedIn && getCurrentUser.id === greeting.author.id)"
                  type="button"
                  class="btn btn-sm btn-danger m-1"
                  @click="deleteGreeting(greeting.id)"
              >
                Delete
              </button>
            </td>
          </tr>
          </tbody>
        </table>
        <div class="alert alert-warning" v-else-if="!isLoadingGreetings">
          No greetings yet
        </div>
      </div>
      <div class="card-footer">
        <button
            type="button"
            class="btn btn-primary"
            @click="openEditGreetingDialog(undefined)"
        >
          Add Greeting
        </button>
      </div>
    </div>
    <CreateOrUpdateGreeting
        ref="greetingModal"
        :greeting="editGreeting"
        @close="closeEditGreetingModal"
    />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

import {mapGetters} from 'vuex'
import CreateOrUpdateGreeting from '@/components/CreateOrUpdateGreeting.vue'

import {Modal} from 'bootstrap'

import GreetingService from '@/service/GreetingService'
import GreetingModel from "@/models/GreetingModel";

const service = new GreetingService()

interface componentData {
  editGreeting: GreetingModel | undefined
  greetingModal: Modal | undefined
  isLoadingGreetings: boolean
}

export default defineComponent({
  name: 'GreetingsComponent',
  components: {CreateOrUpdateGreeting},
  props: {
    //
  },
  data(): componentData {
    return {
      editGreeting: undefined,
      greetingModal: undefined,
      isLoadingGreetings: false,
    }
  },
  async mounted() {
    console.log('Greetings mounted')

    try {
      this.isLoadingGreetings = true

      // console.log('Testing concurrent requests')
      // Promise.all([
      //   service.loadGreetings(5, 5),
      //   service.loadGreetings(1, 1),
      // ]).then(() => {
      //   console.log('Concurrent requests finished')
      // })

      await service.loadGreetings()
    } catch (error) {
      console.log('Failed to load greetings', error)
    } finally {
      this.isLoadingGreetings = false
    }
  },
  beforeUnmount() {
    console.log('Releasing mercure subscription.')

    service.removeSubscription()
  },
  computed: {
    ...mapGetters({
      // getGreetings: 'greeting/getGreetingSorted',
      getGreetings: 'greeting/getGreetings',
      getCurrentUser: 'user/getCurrentUser',
      isLoggedIn: 'user/isLoggedIn',
      isAdmin: 'user/isAdminUser',
      isBusy: 'settings/isBusy',
      isLoading: 'settings/isLoading',
    })
  },
  methods: {
    openEditGreetingDialog(greeting: GreetingModel | undefined) {
      this.editGreeting = greeting
      this.greetingModal = new Modal(document.getElementById('editGreetingModal') as HTMLElement)
      if (this.greetingModal) {
        this.greetingModal.show()
      }
    },
    closeEditGreetingModal() {
      if (this.greetingModal) {
        this.greetingModal.hide()
      }
      this.greetingModal = undefined
      this.editGreeting = undefined
    },
    async deleteGreeting(id: string | number) {
      try {
        await service.deleteGreeting(id)
      } catch (error) {
        console.log('Error deleting greeting', error)
      }
    }
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
