<script setup lang="ts">
import {ref} from "vue"
import {useStore} from 'vuex'
import {UserProfileForm} from "@/models/types";
import UserService from '@/service/UserService'

const store = useStore()

const service = new UserService()

const form = ref<UserProfileForm>({
  first_name: store.getters['user/getCurrentUser'].first_name,
  last_name: store.getters['user/getCurrentUser'].last_name,
})

const email = store.getters['user/getCurrentUser'].email

const isSubmitting = ref<boolean>(false)

const submitForm = async () => {
  console.log('Submitting form', form.value)
  isSubmitting.value = true
  await service.updateProfile(form.value)
  isSubmitting.value = false
}

</script>

<template>
  <form name="edit-profile-form">
    <div data-mdb-input-init class="form-outline mb-4">
      <label for="email" class="form-label">Email </label>
      <input type="text" class="form-control" id="email" :value="email" readonly disabled/>
    </div>
    <div data-mdb-input-init class="form-outline mb-4">
      <label for="firstName" class="form-label">First Name </label>
      <input type="text" class="form-control" id="firstName" v-model="form.first_name"/>
    </div>
    <div data-mdb-input-init class="form-outline mb-4">
      <label for="lastName" class="form-label">Last Name </label>
      <input type="text" class="form-control" id="lastName" v-model="form.last_name"/>
    </div>
    <button
        class="btn btn-outline btn-primary"
        type="submit"
        :disabled="isSubmitting"
        @click.prevent="submitForm()"
    >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status"
                  aria-hidden="true"></span>
      Submit
    </button>
  </form>
</template>

<style scoped lang="scss">

</style>
