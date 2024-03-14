<template>
  <q-page padding>
    <q-table title="Treats" :rows="posts" :columns="columns" row-key="name" />
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import postsService from 'src/services/posts'

export default defineComponent({
  name: 'IndexPage',
  setup () {
    const posts = ref([])
    const { list } = postsService()
    const columns = [

      { name: 'id', label: 'Id', field: 'id', sortable: true, align: 'left' },
      { name: 'title', label: 'Title', field: 'title', sortable: true, align: 'left' },
      { name: 'author', label: 'Author', field: 'author', sortable: true, align: 'left' }
    ]

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

    return {
      posts,
      columns
    }
  }
})
</script>
