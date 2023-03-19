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

<script>
export default {
   name: 'ServerReports',
   props: {
      reports: Array
   },
   computed: {
      totSockets () {
         return this.$props.reports.reduce((prev, cur) => prev + cur.sockets, 0);
      },
      totMessages () {
         return this.$props.reports.reduce((prev, cur) => prev + cur.messages, 0);
      },
      totData () {
         return this.$props.reports.reduce((prev, cur) => prev + cur.data, 0);
      }
   },
   methods: {
      reset () {
         this.$emit('resetReports');
      }
   }
};
</script>
