<template>
  <q-dialog no-backdrop-dismiss>
    <q-card style="width: auto; height: auto">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          Add Event
        </q-toolbar-title>
        <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
      </q-toolbar>
      <div>
        <q-page padding style="min-height: unset">
          <q-form @submit="onSubmit" class="row q-col-gutter-sm">
            <q-input outlined v-model="form.title" label="Title" lazy-rules class="col-lg-6 col-xs-12"
              :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input outlined v-model="form.details" label="Details" lazy-rules class="col-lg-6 col-xs-12"
              :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled v-model="form.date" :rules="[val => val && val.length > 0 || 'Please type something']">
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
            <q-input v-model="form.bgcolor" label="Color" outlined clearable
              :rules="[val => val && val.length > 0 || 'Please type something']">
              <template #append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-color v-model="form.bgcolor"></q-color>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
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
import { defineComponent, ref, onMounted } from 'vue'
import postsService from 'src/services/posts'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'AddEventsModal',
  props: {
    eventDate: String
  },

  setup (props) {
    const $q = useQuasar()
    const { post, getById, update } = postsService()
    const route = useRoute()

    const isDisable = true
    const form = ref({
      title: '',
      details: '',
      date: props.eventDate,
      bgcolor: ''
    })
    const colors = [
      'blue', 'purple', 'green', 'yellow', 'red'
    ]

    onMounted(async () => {
      if (route.params.id) {
        getPost(route.params.id)
      }
      console.log(props.eventDate)
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
        if (form.value.id) {
          await update(form.value)
        } else {
          await post(form.value)
        }
        clearForm()
        $q.notify({ message: 'Post created successfully', icon: 'check', color: 'positive' })
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

    return {
      form,
      onSubmit,
      getPost,
      colors,
      isDisable
    }
  }
})

</script>
