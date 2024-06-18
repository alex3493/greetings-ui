<template>
  <div>
    <div class="card mt-4">
      <div class="card-header">
        Profile
      </div>
      <div class="card-body">
        <EditProfile/>
      </div>
    </div>
    <div class="card mt-4">
      <div class="card-header">
        Change Password
      </div>
      <div class="card-body">
        <ChangePassword/>
      </div>
    </div>
    <div class="card mt-4 mb-4">
      <div class="card-header">
        Registered Devices
      </div>
      <div class="card-body">
        <RegisteredDevices/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onBeforeUnmount, onMounted} from "vue";
import ProfileService from "@/service/ProfileService";
import EditProfile from "@/components/EditProfile.vue";
import ChangePassword from "@/components/ChangePassword.vue";
import RegisteredDevices from "@/components/RegisteredDevices.vue";
import {useStore} from 'vuex'

const service = new ProfileService();

const store = useStore()

onMounted(() => {
  console.log('Dashboard component mounted.');

  service.loadProfile()
})

onBeforeUnmount(() => {
  store.commit('settings/removeValidationErrorsForContext', 'User')
})

</script>
