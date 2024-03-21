<template>
  <div>
    <q-page padding>
      <q-form @submit="onSubmit" class="row q-col-gutter-sm">
        <q-input outlined v-model="form.title" label="Title" lazy-rules class="col-lg-6 col-xs-12"
          :rules="[val => val && val.length > 0 || 'Please type something']" />
        <q-input outlined v-model="form.author" label="Author" lazy-rules class="col-lg-6 col-xs-12"
          :rules="[val => val && val.length > 0 || 'Please type something']" />

        <div class="col-lg-12 col-xs-12">
          <q-editor v-model="form.content" min-height="5rem" />
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
import { defineComponent, ref, onMounted } from 'vue'
import postsService from 'src/services/posts'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
export default defineComponent({
  name: 'FormPost',
  setup () {
    const $q = useQuasar()
    const { post, getById, update } = postsService()
    const router = useRouter()
    const route = useRoute()
    const form = ref({
      title: '',
      content: '',
      author: ''
    })

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
        if (form.value.id) {
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
      getPost
    }
  }
})

</script>