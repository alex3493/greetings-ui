<script setup lang="ts">
import {ref} from "vue"
import {UserRegistrationForm} from "@/models/types";
import UserService from '@/service/UserService'
import {useRouter} from "vue-router";

import ValidationService from '@/service/ValidationService'

const service = new UserService()

const router = useRouter()

const validationService = new ValidationService('User')

const form = ref<UserRegistrationForm>({
  email: '',
  password: '',
  password_confirmation: '',
  first_name: '',
  last_name: ''
})

const isSubmitting = ref<boolean>(false)

const submitForm = async () => {
  console.log('Submitting form', form.value)
  validationService.removeErrorsForContext()

  isSubmitting.value = true
  try {
    await service.register(form.value)
    await router.replace('/login')
  } catch (error) {
    console.log(error)
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <div class="container">
    <div class="d-flex justify-content-center">
      <div class="card col-lg-4 col-sm-6 col-xs-12">
        <div class="card-body">
          <form name="registration-form">
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="email" class="form-label">Email </label>
              <input type="text" class="form-control" id="email"
                     :class="{ 'is-invalid': validationService.propertyErrors('email').length }"
                     @input="validationService.removeErrors('email')"
                     v-model="form.email"/>
              <div v-for="(error, index) in validationService.propertyErrors('email')" :key="index"
                   class="invalid-feedback">
                {{ error }}
              </div>
            </div>
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="password" class="form-label">Password </label>
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
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="first_name" class="form-label">First Name </label>
              <input type="text" class="form-control" id="first_name"
                     :class="{ 'is-invalid': validationService.propertyErrors('firstName').length }"
                     @input="validationService.removeErrors('firstName')"
                     v-model="form.first_name"/>
              <div v-for="(error, index) in validationService.propertyErrors('firstName')" :key="index"
                   class="invalid-feedback">
                {{ error }}
              </div>
            </div>
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="last_name" class="form-label">Last Name </label>
              <input type="text" class="form-control" id="last_name"
                     :class="{ 'is-invalid': validationService.propertyErrors('lastName').length }"
                     @input="validationService.removeErrors('lastName')"
                     v-model="form.last_name"/>
              <div v-for="(error, index) in validationService.propertyErrors('lastName')" :key="index"
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
              Register
            </button>
          </form>
          <div class="mt-2">
            Already have an account?
            <router-link to="/login">Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
