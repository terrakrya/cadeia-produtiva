<template>
    <div>
      <!-- IFrame incorporando o relatório do Power BI -->
      <iframe
        width="800"
        height="600"
        :src="powerBILink"
        frameborder="0"
        allowFullScreen="true"
      ></iframe>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // Substitua 'SEU_CODIGO_DE_INCORPORACAO' pelo código que você copiou do Power BI
        powerBILink: 'https://app.powerbi.com/view?r=eyJrIjoiYzU3ZjEzZGMtNmYwZS00NmM0LWI0ZjQtY2Y2Y2I2MmZhODRiIiwidCI6ImZmMjIxZjk2LTI1NGUtNDFlYy1iMTUwLWI5ZmExZDBkMDNjNCJ9'
      };
    }
  };
  </script>
  