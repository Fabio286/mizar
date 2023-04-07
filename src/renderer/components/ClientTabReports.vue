<template>
   <div id="serverReports" class="box-100">
      <h3>{{ t('message.testReport') }}</h3>
      <table>
         <thead>
            <tr>
               <th>{{ t('word.host', 2) }}</th>
               <th>{{ t('word.client', 2) }}</th>
               <th>{{ t('word.message', 2) }}</th>
               <th>{{ t('word.data', 2) }}</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(report, index) in reports" :key="index">
               <td>{{ report.host }}</td>
               <td>{{ report.sockets }}</td>
               <td><span :title="t('word.sent', 2)">{{ report.messages.toLocaleString() }}</span> <i class="material-icons">import_export</i><span :title="t('word.received', 2)">{{ report.received }}</span></td>
               <td><span :title="t('word.sent', 2)">{{ report.data.toLocaleString() }} B</span></td>
            </tr>
         </tbody>
         <tfoot>
            <tr>
               <td>{{ t('word.total', 2) }}</td>
               <td>{{ totSockets }}</td>
               <td><span :title="t('word.sent', 2)">{{ totMessages.toLocaleString() }}</span> <i class="material-icons">import_export</i><span :title="t('word.received', 2)">{{ totReceived.toLocaleString() }}</span></td>
               <td><span :title="t('word.sent', 2)">{{ totData.toLocaleString() }} B</span></td>
            </tr>
         </tfoot>
      </table>
   </div>
</template>

<script setup lang="ts">
import { ClientReport } from 'common/interfaces';
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
   reports: Array as PropType<ClientReport[]>
});

const { t } = useI18n();

const totSockets = computed(() => {
   return props.reports.reduce((prev, cur) => prev + cur.sockets, 0);
});

const totMessages = computed(() => {
   return props.reports.reduce((prev, cur) => prev + cur.messages, 0);
});

const totReceived = computed(() => {
   return props.reports.reduce((prev, cur) => prev + cur.received, 0);
});

const totData = computed(() => {
   return props.reports.reduce((prev, cur) => prev + cur.data, 0);
});
</script>
