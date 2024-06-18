<template>
  <div class="home">
    <!--img alt="Vue logo" src="../assets/logo.png"-->
    <Greetings/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Greetings from '@/components/Greetings.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    Greetings,
  },
});
</script>
