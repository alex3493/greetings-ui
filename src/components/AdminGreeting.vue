<script lang="ts">
import {defineComponent} from 'vue'
import GreetingService from "@/service/GreetingService";
import {mapGetters} from "vuex";

import ValidationService from '@/service/ValidationService'

const service = new GreetingService()

export default defineComponent({
  name: 'AdminGreetingForm',
  data: () => ({
    greeting: '',
    validationService: new ValidationService('AdminGreetings')
  }),
  computed: {
    ...mapGetters({
      isActionInProgress: 'settings/isActionInProgress',
    }),
  },
  mounted() {
    const el = this.$refs['adminGreetingModal'] as HTMLElement
    if (el) {
      el.addEventListener('shown.bs.modal', this.onModalShow)
      el.addEventListener('hide.bs.modal', this.onModalHide)
    }
  },
  unmounted() {
    const el = this.$refs['adminGreetingModal'] as HTMLElement
    if (el) {
      el.removeEventListener('shown.bs.modal', this.onModalShow)
      el.removeEventListener('hide.bs.modal', this.onModalShow)
    }
  },
  methods: {
    onModalShow() {
      const input = this.$refs['adminGreetingText'] as HTMLElement
      input?.focus()
    },
    onModalHide() {
      this.validationService.removeErrorsForContext('AdminGreetings')
    },
    submitForm() {
      this.validationService.removeErrorsForContext('AdminGreetings')
      service.sendAdminGreeting(this.greeting)
          .then((response) => {
            console.log('Admin greeting response', response)
            this.greeting = ''
            this.$emit('close')
          })
          .catch((error) => {
            console.log('Error sending admin greeting', error)
          })
    },
    close() {
      this.greeting = ''
      this.$emit('close')
    }
  }
})
</script>

<template>
  <div class="modal fade" id="adminGreetingModal" ref="adminGreetingModal" tabindex="-1"
       aria-labelledby="adminGreetingModalLabel"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" ref="adminGreetingModalLabel">Admin greeting</h1>
          <button type="button" class="btn-close" aria-label="Close"
                  @click="close"></button>
        </div>
        <div class="modal-body">
          <form name="admin-greeting-form">
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="admin-greeting-text" class="form-label">Text </label>
              <input type="text" class="form-control" id="admin-greeting-text" ref="adminGreetingText"
                     :class="{ 'is-invalid': validationService.propertyErrors('greeting', 'AdminGreetings').length }"
                     @input="validationService.removeErrors('greeting', 'AdminGreetings')"
                     v-model="greeting"/>
              <div v-for="(error, index) in validationService.propertyErrors('greeting', 'AdminGreetings')" :key="index"
                   class="invalid-feedback">
                {{ error }}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Close</button>
          <button type="button" class="btn btn-primary" @click.prevent="submitForm()" :disabled="isActionInProgress">
            <span v-if="isActionInProgress" class="spinner-border spinner-border-sm" role="status"
                  aria-hidden="true"></span>
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
