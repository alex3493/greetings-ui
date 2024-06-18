<script setup lang="ts">
import GreetingModel from "@/models/GreetingModel";
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import GreetingService from "@/service/GreetingService";
import {GreetingUpdateDTO} from '@/models/types'

import {useStore} from 'vuex'

import ValidationService from '@/service/ValidationService'

const store = useStore()

const service = new GreetingService()

const validationService = new ValidationService('Greeting')

export interface Props {
  greeting: GreetingModel | undefined,
}

const props = withDefaults(defineProps<Props>(), {
  greeting: undefined,
})

const inEditMode = computed(() => props.greeting?.isValidId())

const modalTitle = computed(() => inEditMode.value ? 'Edit Greeting' : 'Create Greeting')

const isActionInProgress = computed(() => store.getters['settings/isActionInProgress'])
const isBusy = computed(() => store.getters['settings/isBusy'])
const isLoading = computed(() => store.getters['settings/isLoading'])

const hasUpdate = computed(() => store.getters['greeting/hasUpdate'](greetingRef.value?.id))
const isDeleted = computed(() => store.getters['greeting/hasDeletionUpdate'](greetingRef.value?.id))

const newGreeting = {
  id: undefined,
  text: '',
  variant: 'secondary',
}

let greetingRef = ref<GreetingUpdateDTO>(newGreeting)

watch(props, (newValue: Props) => {
  if (newValue.greeting && newValue.greeting.isValidId()) {
    greetingRef.value = {
      id: newValue.greeting.id,
      text: newValue.greeting.text,
      variant: newValue.greeting.variant.name
    }
  } else {
    greetingRef.value = {...newGreeting}
  }
}, {
  immediate: true
})

const emit = defineEmits(['close'])

const variantSelected = (variant: string) => {
  greetingRef.value.variant = variant
}

const currentVariant = (variant: string) => (greetingRef.value.variant === variant)

const focusInput = () => {
  const input = document.getElementById('greeting-text') as HTMLInputElement
  input?.focus()
  input?.select()
}

const onModalShow = async () => {
  if (greetingRef.value?.id) {
    try {
      await service.loadGreeting(greetingRef.value.id)
      await service.addSubscription(greetingRef.value.id)
    } catch (error) {
      console.log('Error opening greeting edit modal', error)
    }
  }
  focusInput()
}

const onModalHide = () => {
  if (greetingRef.value?.id) {
    service.removeSubscription(greetingRef.value.id)
    store.commit('greeting/removeUpdate', greetingRef.value.id)
  }
}

onMounted(() => {
  console.log('Edit greeting modal mounted')
  const modal = document.getElementById('editGreetingModal') as HTMLElement
  modal?.addEventListener('shown.bs.modal', onModalShow)
  modal?.addEventListener('hide.bs.modal', onModalHide)
})

onBeforeUnmount(() => {
  console.log('Edit greeting modal unmounted')
  const modal = document.getElementById('editGreetingModal') as HTMLElement
  modal?.removeEventListener('shown.bs.modal', focusInput)
  modal?.removeEventListener('hide.bs.modal', onModalHide)
})

const acceptUpdate = async () => {
  try {
    const update = await store.dispatch('greeting/consumeUpdate', greetingRef.value?.id)
    greetingRef.value = update

    console.log('acceptUpdate', update)
  } catch (error) {
    console.log('Error accepting update', error)
  }
}

const saveGreeting = async () => {
  if (greetingRef.value) {
    validationService.removeErrorsForContext()

    if (inEditMode.value) {
      // We are about to save greeting. Updates check doesn't make sense at this point.
      store.commit('greeting/removeUpdate', greetingRef.value.id)

      try {
        await service.updateGreeting(greetingRef.value)
        closeModal()
      } catch (error) {
        console.log('Error updating greeting', error)
      }
    } else {
      try {
        await service.createGreeting(greetingRef.value)
        closeModal()
      } catch (error) {
        console.log('Error creating greeting', error)
      }
    }
  }
}

const closeModal = () => {
  greetingRef.value.text = ''
  validationService.removeErrorsForContext()
  emit('close')
}
</script>

<template>
  <div class="modal fade" id="editGreetingModal" ref="editGreetingModal" tabindex="-1"
       aria-labelledby="editGreetingModalLabel"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="editGreetingModalLabel">{{ modalTitle }}</h1>
          &nbsp;<span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <button type="button" class="btn-close" aria-label="Close"
                  @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form v-if="greetingRef" name="greeting-form">
            <div v-if="hasUpdate" class="alert alert-warning text-center">
              <span>Greeting was updated by another user </span>
            </div>
            <div v-if="isDeleted" class="alert alert-danger text-center">
              <span>Greeting was deleted by another user </span>
            </div>
            <div data-mdb-input-init class="form-outline mb-4">
              <label for="greeting-text" class="form-label">Text </label>
              <input type="text" class="form-control"
                     :class="{ 'is-invalid': validationService.propertyErrors('text').length }"
                     @input="validationService.removeErrors('text')"
                     :disabled="isDeleted || hasUpdate"
                     id="greeting-text" v-model="greetingRef.text"/>
              <div v-for="(error, index) in validationService.propertyErrors('text')" :key="index"
                   class="invalid-feedback">
                {{ error }}
              </div>
            </div>
            <div class="btn-group" role="group" aria-label="Greeting variant">
              <input
                  @click="variantSelected('primary')"
                  type="radio"
                  class="btn-check"
                  name="options" id="primary"
                  :checked="currentVariant('primary')"
                  :disabled="isDeleted || hasUpdate"
                  autocomplete="off">
              <label
                  class="btn btn-outline-primary"
                  for="primary"
              >Primary</label>

              <input
                  @click="variantSelected('secondary')"
                  type="radio"
                  class="btn-check"
                  name="options"
                  id="secondary"
                  :checked="currentVariant('secondary')"
                  :disabled="isDeleted || hasUpdate"
                  autocomplete="off">
              <label
                  class="btn btn-outline-secondary"
                  for="secondary"
              >Secondary</label>

              <input
                  @click="variantSelected('success')"
                  type="radio"
                  class="btn-check"
                  name="options"
                  id="success"
                  :checked="currentVariant('success')"
                  :disabled="isDeleted || hasUpdate"
                  autocomplete="off">
              <label
                  class="btn btn-outline-success"
                  for="success"
              >Success</label>

              <input
                  @click="variantSelected('warning')"
                  type="radio"
                  class="btn-check"
                  name="options"
                  id="warning"
                  :checked="currentVariant('warning')"
                  :disabled="isDeleted || hasUpdate"
                  autocomplete="off">
              <label
                  class="btn btn-outline-warning"
                  for="warning"
              >Warning</label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
          <button v-if="!hasUpdate" type="button" class="btn btn-primary" @click="saveGreeting"
                  :disabled="isBusy || isDeleted">
            <span v-if="isActionInProgress" class="spinner-border spinner-border-sm" role="status"
                  aria-hidden="true"></span>
            Save changes
          </button>
          <button v-else @click="acceptUpdate" type="button" class="btn btn-warning">Accept Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
