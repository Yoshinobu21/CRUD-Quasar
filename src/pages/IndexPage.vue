<template>
  <q-page padding>
    <q-table title="Treats" :rows="posts" :columns="columns" row-key="name">
      <template v-slot:top>
        <span class="text-h5">Eventos</span>
        <q-space />
        <q-btn color="primary" label="Adicionar Eventos" :to="{ name: 'formPost' }"></q-btn>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn icon="edit" color="info" dense size="md" @click="handleEditPost(props.row._id)" />
          <q-btn icon="delete" color="negative" dense size="md" @click="handleDeletePost(props.row._id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import postsService from 'src/services/posts'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'IndexPage',
  setup () {
    const posts = ref([])
    const { list, remove } = postsService()
    const columns = [

      { name: 'id', label: 'Id', field: '_id', sortable: true, align: 'left' },
      { name: 'title', label: 'Título', field: 'title', sortable: true, align: 'left' },
      { name: 'details', label: 'Detalhes', field: 'details', sortable: true, align: 'left' },
      { name: 'date', label: 'Data', field: 'date', sortable: true, align: 'left' },
      { name: 'bgcolor', label: 'Cor', field: 'bgcolor', sortable: true, align: 'left' },
      { name: 'duration', label: 'Duração', field: 'duration', sortable: true, align: 'left' },
      { name: 'actions', label: 'Ações', field: 'actions', align: 'left' }
    ]
    const $q = useQuasar()
    const router = useRouter()

    onMounted(() => {
      getPosts()
    })

    const getPosts = async () => {
      try {
        const data = await list()
        posts.value = data
      } catch (error) {
        console.error(error)
      }
    }

    const handleDeletePost = async (id) => {
      try {
        $q.dialog({
          title: 'Deletar',
          message: 'Você deseja mesmo deletar esse evento?',
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(id)
          $q.notify({ message: 'Evento deletado com sucesso', icon: 'check', color: 'positive' })
          getPosts()
        })
      } catch (error) {
        $q.notify({ message: 'Evento não deletado com sucesso', icon: 'times', color: 'negative' })
      }
    }

    const handleEditPost = (id) => {
      router.push({ name: 'formPost', params: { id } })
    }

    return {
      posts,
      columns,
      handleDeletePost,
      handleEditPost
    }
  }
})
</script>
