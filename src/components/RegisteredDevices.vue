<script setup lang="ts">
import {computed, ref} from "vue"
import {useStore} from 'vuex'
import UserService from '@/service/UserService'
import RegisteredDeviceModel from "@/models/RegisteredDeviceModel";

const store = useStore()

const service = new UserService()

const isSubmitting = ref<Record<string, boolean>>({})

const devices = computed(() => store.getters['user/getCurrentUser'] ? store
    .getters['user/getCurrentUser']
    .auth_tokens
    .map((d: RegisteredDeviceModel) => new RegisteredDeviceModel(d)) : [])

const logoutDevice = async (tokenId: string) => {
  isSubmitting.value[tokenId] = true
  await service.logoutDevice(tokenId)
  isSubmitting.value[tokenId] = false
}

const signOut = async () => {
  isSubmitting.value['all'] = true
  await service.signOut()
  isSubmitting.value['all'] = false
}

</script>

<template>
  <div v-if="devices.length">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">Device Name</th>
        <th scope="col">Last Used</th>
        <th scope="col"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="device in devices" :key="device.id">
        <td>{{ device.name }}</td>
        <td>{{ device.getLastUsedAt() }}</td>
        <td>
          <button
              @click="logoutDevice(device.id)"
              class="btn btn-danger"
              :disabled="isSubmitting[device.id] || isSubmitting['all']"
          >
              <span v-if="isSubmitting[device.id]" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            Logout
          </button>
        </td>
      </tr>
      </tbody>
    </table>
    <button @click="signOut" class="btn btn-danger" :disabled="isSubmitting['all']">
          <span v-if="isSubmitting['all']" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
      Sign out
    </button>
  </div>
  <div v-else class="alert alert-info text-center">
    No registered mobile devices found
  </div>
</template>

<style scoped lang="scss">

</style>
