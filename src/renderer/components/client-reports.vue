<template>
   <div id="serverReports" class="box-100">
      <h3>Report del Test</h3>
      <table>
         <thead>
            <tr>
               <th>Host</th>
               <th>Client</th>
               <th>Messaggi</th>
               <th>Dati</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(report, index) in reports" :key="index">
               <td>{{ report.host }}</td>
               <td>{{ report.sockets }}</td>
               <td><span title="Inviati">{{ report.messages.toLocaleString() }}</span> <i class="material-icons">import_export</i><span title="Ricevuti">{{ report.received }}</span></td>
               <td><span title="Inviati">{{ report.data.toLocaleString() }} B</span></td>
            </tr>
         </tbody>
         <tfoot>
            <tr>
               <td>Totali</td>
               <td>{{ totSockets }}</td>
               <td><span title="Inviati">{{ totMessages.toLocaleString() }}</span> <i class="material-icons">import_export</i><span title="Ricevuti">{{ totReceived.toLocaleString() }}</span></td>
               <td><span title="Inviati">{{ totData.toLocaleString() }} B</span></td>
            </tr>
         </tfoot>
      </table>
   </div>
</template>

<script>
export default {
   name: 'ClientReports',
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
      totReceived () {
         return this.$props.reports.reduce((prev, cur) => prev + cur.received, 0);
      },
      totData () {
         return this.$props.reports.reduce((prev, cur) => prev + cur.data, 0);
      }
   }
};
</script>
