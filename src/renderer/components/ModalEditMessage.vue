<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>{{ t('message.editMessage') }}</h4>
            <div class="input-element">
               <label>{{ t('word.name', 1) }}</label>
               <input
                  v-model="staticMsg.name"
                  type="text"
                  required
                  autofocus
               >
            </div>
            <div class="input-element">
               <label>{{ t('word.message', 1) }}</label>
               <textarea
                  v-model="staticMsg.message"
                  required
               />
            </div>
         </div>
         <div class="input-element">
            <label>{{ t('word.format') }}</label>
            <select v-model="staticMsg.format" required>
               <option value="" disabled>
                  {{ t('word.select') }}
               </option>
               <option value="ascii">
                  ASCII
               </option>
               <option value="hex">
                  HEX
               </option>
            </select>
         </div>
         <div class="buttons">
            <button class="cancel" @click="close">
               {{ t('word.cancel') }}
            </button>
            <button
               class="confirm"
               :disabled="validation"
               @click="confirm"
            >
               {{ t('word.edit') }}
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
   message: Object,
   index: Number
});

const { t } = useI18n();

const staticMsg = ref(Object.assign({}, props.message));

const emit = defineEmits(['hide-edit-message', 'edit-message']);

const validation = computed(() => {
   return staticMsg.value.message === '' || staticMsg.value.name === '' || staticMsg.value.format === '';
});

const close = () => {
   emit('hide-edit-message');
};

const confirm = () => {
   emit('edit-message', staticMsg.value, props.index);
};
</script>
