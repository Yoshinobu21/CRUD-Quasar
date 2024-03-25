<template>
  <q-page padding>
    <q-table title="Treats" :rows="posts" :columns="columns" row-key="name">
      <template v-slot:top>
        <span class="text-h5">Eventos</span>
        <q-space />
        <q-btn color="primary" label="Add Event" :to="{ name: 'formPost' }"></q-btn>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn icon="edit" color="info" dense size="md" @click="handleEditPost(props.row.id)" />
          <q-btn icon="delete" color="negative" dense size="md" @click="handleDeletePost(props.row.id)" />
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

      { name: 'id', label: 'Id', field: 'id', sortable: true, align: 'left' },
      { name: 'title', label: 'Title', field: 'title', sortable: true, align: 'left' },
      { name: 'details', label: 'Details', field: 'details', sortable: true, align: 'left' },
      { name: 'date', label: 'Date', field: 'date', sortable: true, align: 'left' },
      { name: 'bgColor', label: 'Color', field: 'bgColor', sortable: true, align: 'left' },
      { name: 'icon', label: 'Icon', field: 'icon', sortable: true, align: 'left' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'left' }
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
          title: 'Delete',
          message: 'Would you like to delete the post?',
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(id)
          $q.notify({ message: 'deleted successfully', icon: 'check', color: 'positive' })
          getPosts()
        })
      } catch (error) {
        $q.notify({ message: 'deleted unsuccessfully', icon: 'times', color: 'negative' })
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
