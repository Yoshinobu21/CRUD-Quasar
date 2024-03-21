<template>
  <div class="row justify-center q-mr-xl">
    <div class="q-pa-md q-gutter-sm row">
      <q-btn no-caps class="button" style="margin: 2px;" @click="$emit('prev')">
        &lt; Mês Anterior
      </q-btn>
      <q-btn no-caps class="button" style="margin: 2px;" @click="$emit('today')">
        Hoje
      </q-btn>
      <q-btn no-caps class="button" style="margin: 2px;" @click="$emit('next')">
        Próximo Mês &gt;
      </q-btn>
    </div>
  </div>
</template>
