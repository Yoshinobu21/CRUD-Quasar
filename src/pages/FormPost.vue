<template>
  <div>
    <q-page padding>
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
        <div class="col-12 q-gutter-sm">
          <q-btn label="Salvar" color="primary" class="float-right" icon="save" type="submit"></q-btn>
          <q-btn label="Cancelar" color="white" class="float-right" text-color="primary" :to="{ name: 'home' }"></q-btn>
        </div>
      </q-form>
    </q-page>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
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
      bgcolor: ''
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
        if (form.value._id) {
          await update(form.value)
        } else {
          await post(form.value)
        }
        $q.notify({ message: 'Post created successfully', icon: 'check', color: 'positive' })
        router.push({ name: 'home' })
      } catch (error) {
        console.error(error)
      }
    }
    return {
      form,
      onSubmit,
      getPost,
      colors
    }
  }
})

</script>
