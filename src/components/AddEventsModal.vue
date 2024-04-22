<template>
  <q-dialog no-backdrop-dismiss>
    <q-card style="width: auto; height: auto">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          Adicionar Evento
        </q-toolbar-title>
        <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
      </q-toolbar>
      <div>
        <q-page padding style="min-height: unset">
          <q-form @submit="onSubmit" class="row q-col-gutter-sm">
            <q-input outlined v-model="form.title" label="Título" lazy-rules class="col-lg-6 col-xs-12"
              :rules="[val => val && val.length > 0 || 'Favor, preencher o campo obrigatório']" />
            <q-input outlined v-model="form.details" label="Detalhes" lazy-rules class="col-lg-6 col-xs-12"
              :rules="[val => val && val.length > 0 || 'Favor, preencher o campo obrigatório']" />
            <q-input filled v-model="form.date"
              :rules="[val => val && val.length > 0 || 'Favor, preencher o campo obrigatório']">
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
            <q-input v-model="form.bgcolor" label="Cor" outlined clearable
              :rules="[val => val && val.length > 0 || 'Favor, preencher o campo obrigatório']">
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
              <q-btn label="Salvar" color="primary" class="float-right" icon="save"
                :disable="!form.title || !form.details || !form.date || !form.bgcolor" type="submit"
                v-close-popup></q-btn>
              <q-btn id="cancel" label="Cancelar" color="white" class="float-right" text-color="primary" type="reset"
                v-close-popup></q-btn>
            </div>
          </q-form>
        </q-page>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import postsService from 'src/services/posts'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'AddEventsModal',
  props: {
    eventId: String,
    eventDate: String
  },

  setup (props) {
    const $q = useQuasar()
    const { post, getById, update } = postsService()
    const isDisable = true
    const form = ref({
      _id: props.eventId,
      title: '',
      details: '',
      date: props.eventDate,
      bgcolor: '',
      timeStart: ref(''),
      timeFinish: ref(''),
      duration: ref(null)
    })

    onMounted(async () => {
      if (props.eventId) {
        getPost(props.eventId)
      }
    }
    )

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
        if (form.value._id) {
          await update(form.value)
          $q.notify({ message: 'Evento atualizado com sucecsso', icon: 'check', color: 'positive' })
        } else {
          await post(form.value)
          $q.notify({ message: 'Evento criado com sucecsso', icon: 'check', color: 'positive' })
        }
        clearForm()
      } catch (error) {
        console.error(error)
      }
    }

    function clearForm () {
      form.value.title = ''
      form.value.details = ''
      form.value.date = ''
      form.value.bgcolor = ''
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
      isDisable
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
})

</script>
