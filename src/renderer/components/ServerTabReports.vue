<template>
   <div id="serverReports" class="box-100">
      <h3>{{ t('message.serverStatus') }}</h3>
      <table>
         <thead>
            <tr>
               <th>{{ t('word.port', 2) }}</th>
               <th>{{ t('word.socket', 2) }}</th>
               <th>{{ t('word.message', 2) }}</th>
               <th>{{ t('word.data', 2) }}</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(report, index) in reports" :key="index">
               <td>{{ report.port }}</td>
               <td>{{ report.sockets }}</td>
               <td>{{ report.messages.toLocaleString() }}</td>
               <td>{{ report.data.toLocaleString() }} B</td>
            </tr>
         </tbody>
         <tfoot>
            <tr>
               <td>{{ t('word.total', 2) }}</td>
               <td>{{ totSockets }}</td>
               <td>{{ totMessages.toLocaleString() }}</td>
               <td>{{ totData.toLocaleString() }} B</td>
            </tr>
         </tfoot>
      </table>
      <div class="buttons">
         <div class="button-wrap">
            <i class="material-icons">replay</i>
            <button
               class="save"
               :title="t('message.resetReceivedData')"
               @click="reset"
            >
               {{ t('word.reset') }}
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, PropType } from 'vue';
import { ServerReport } from 'common/interfaces';

const emit = defineEmits(['reset-reports']);

const { t } = useI18n();

const props = defineProps({
   reports: Array as PropType<ServerReport[]>
});

const totSockets = computed(() => {
   return props.reports.reduce((prev, cur) => prev + cur.sockets, 0);
});

const totMessages = computed(() => {
   return props.reports.reduce((prev, cur) => prev + cur.messages, 0);
});

const totData = computed(() => {
   return props.reports.reduce((prev, cur) => prev + cur.data, 0);
});

const reset = () => {
   emit('reset-reports');
};
</script>
