<script setup lang="ts">
import {ref} from "vue"
import {UserUpdatePasswordForm} from "@/models/types";
import UserService from '@/service/UserService'

import ValidationService from '@/service/ValidationService'

const service = new UserService()

const validationService = new ValidationService('User')

const form = ref<UserUpdatePasswordForm>({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const isSubmitting = ref<boolean>(false)

const submitForm = async () => {
  console.log('Submitting form', form.value)
  validationService.removeErrorsForContext()

  isSubmitting.value = true
  await service.updatePassword(form.value)
      .catch((error: Error) => {
        console.log(error)
      })
  isSubmitting.value = false
}

</script>

<template>
  <form name="change-password-form">
    <div data-mdb-input-init class="form-outline mb-4">
      <label for="currentPassword" class="form-label">Current Password </label>
      <input type="password" class="form-control" id="currentPassword" autocomplete="current-password"
             :class="{ 'is-invalid': validationService.propertyErrors('currentPassword').length }"
             @input="validationService.removeErrors('currentPassword')"
             v-model="form.current_password"/>
      <div v-for="(error, index) in validationService.propertyErrors('currentPassword')" :key="index"
           class="invalid-feedback">
        {{ error }}
      </div>
    </div>
    <div data-mdb-input-init class="form-outline mb-4">
      <label for="password" class="form-label">New Password </label>
      <input type="password" class="form-control" id="password" autocomplete="new-password"
             :class="{ 'is-invalid': validationService.propertyErrors('password').length }"
             @input="validationService.removeErrors('password')"
             v-model="form.password"/>
      <div v-for="(error, index) in validationService.propertyErrors('password')" :key="index"
           class="invalid-feedback">
        {{ error }}
      </div>
    </div>
    <div data-mdb-input-init class="form-outline mb-4">
      <label for="passwordConfirmation" class="form-label">Confirm Password </label>
      <input type="password" class="form-control" id="passwordConfirmation" autocomplete="new-password"
             :class="{ 'is-invalid': validationService.propertyErrors('passwordConfirmation').length }"
             @input="validationService.removeErrors('passwordConfirmation')"
             v-model="form.password_confirmation"/>
      <div v-for="(error, index) in validationService.propertyErrors('passwordConfirmation')" :key="index"
           class="invalid-feedback">
        {{ error }}
      </div>
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
