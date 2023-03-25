<template>
   <div id="serverReports" class="box-100">
      <h3>Stato del Server</h3>
      <table>
         <thead>
            <tr>
               <th>Porta</th>
               <th>Socket</th>
               <th>Messaggi</th>
               <th>Dati</th>
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
               <td>Totali</td>
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
               title="Azzera i dati ricevuti"
               @click="reset"
            >
               Reset
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';

const emit = defineEmits(['resetReports']);

const props = defineProps({
   reports: Array as PropType<any[]>
});

const totSockets = computed(() => {
   return props.reports.reduce((prev, cur: any) => prev + cur.sockets, 0);
});

const totMessages = computed(() => {
   return props.reports.reduce((prev, cur: any) => prev + cur.messages, 0);
});

const totData = computed(() => {
   return props.reports.reduce((prev, cur: any) => prev + cur.data, 0);
});

const reset = () => {
   emit('resetReports');
};
</script>
