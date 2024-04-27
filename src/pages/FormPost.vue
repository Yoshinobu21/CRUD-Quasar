<template>
  <div>
    <q-page padding>
      <q-form @submit="onSubmit" class="row q-col-gutter-sm">
        <q-input outlined v-model="form.title" label="Título" lazy-rules class="col-lg-6 col-xs-12"
          :rules="[requiredRule]" />
        <q-input outlined v-model="form.details" label="Detalhes" lazy-rules class="col-lg-6 col-xs-12"
          :rules="[requiredRule]" />
        <q-input class="col-2" filled v-model="form.date" :rules="[requiredRule]">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.date" mask="YYYY-MM-DD">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input class="col-2" v-model="form.bgcolor" label="Cor" outlined clearable :rules="[requiredRule]">
          <template #append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy>
                <q-color v-model="form.bgcolor"></q-color>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input class="col-3" filled v-model="form.timeStart" mask="time" :rules="[requiredRule]" label="Horário inicial">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="form.timeStart" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input class="col-3" filled v-model="form.timeFinish" mask="time" :rules="[requiredRule, finishTimeRule]" label="Horário final">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="form.timeFinish" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <div class="row items-center justify-start">
          <p> Duração do evento: <br>{{ form.duration }} Minutos</p>
        </div>
        <div class="col-12 q-gutter-sm">
          <q-btn label="Salvar" color="primary" class="float-right" icon="save" type="submit"></q-btn>
          <q-btn label="Cancelar" color="white" class="float-right" text-color="primary" :to="{ name: 'home' }"></q-btn>
        </div>
      </q-form>
    </q-page>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import postsService from 'src/services/posts'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { today } from '@quasar/quasar-ui-qcalendar/src'
export default defineComponent({
  name: 'FormPost',
  setup () {
    const $q = useQuasar()
    const { post, getById, update } = postsService()
    const router = useRouter()
    const route = useRoute()
    const form = ref({
      title: '',
      details: '',
      date: ref(today()),
      bgcolor: '',
      timeStart: ref(''),
      timeFinish: ref(''),
      duration: ref(null)
    })
    const colors = [
      'blue', 'purple', 'green', 'yellow', 'red'
    ]

    onMounted(async () => {
      if (route.params.id) {
        getPost(route.params.id)
      }
    })

    const getPost = async (id) => {
      try {
        const response = await getById(id)
        form.value = response
      } catch (error) {
        console.error(error)
      }
    }

    const onSubmit = async () => {
      try {
        calculateDuration()
        if (form.value._id) {
          await update(form.value)
          $q.notify({ message: 'Evento atualizado com sucesso', icon: 'check', color: 'positive' })
        } else {
          await post(form.value)
          $q.notify({ message: 'Evento criado com sucesso', icon: 'check', color: 'positive' })
        }
        router.push({ name: 'home' })
      } catch (error) {
        console.error(error)
      }
    }
    function calculateDuration () {
      if (form.value.timeStart && form.value.timeFinish) {
        const [startHour, startMinute] = form.value.timeStart.split(':').map(Number)
        const [finishHour, finishMinute] = form.value.timeFinish.split(':').map(Number)

        const startTotalMinutes = startHour * 60 + startMinute
        const finishTotalMinutes = finishHour * 60 + finishMinute

        form.value.duration = Math.abs(finishTotalMinutes - startTotalMinutes)
      }
    }
    watch(() => form.value.timeStart, async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        calculateDuration()
      }
    })
    watch(() => form.value.timeFinish, async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        calculateDuration()
      }
    })
    return {
      form,
      onSubmit,
      getPost,
      colors
    }
  },
  methods: {
    requiredRule (val) {
      if (!val) {
        return 'Favor, preencher o campo obrigatório'
      }
      return true
    },
    finishTimeRule () {
      if (this.form.timeStart && this.form.timeFinish) {
        const startTime = new Date(`2000-01-01T${this.form.timeStart}`)
        const endTime = new Date(`2000-01-01T${this.form.timeFinish}`)

        if (startTime >= endTime) {
          return 'Favor, preencher um horário final maior que o inicial'
        }
        return true
      }
    }
  }
}
)

</script>
