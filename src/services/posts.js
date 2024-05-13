import useApi from 'src/composables/UseApi'

export default function postsService () {
  const { list, post, update, remove, getById, authGoogle, postGoogle, isLoggedIn, getEventsGoogle } = useApi('events')
  return {
    list,
    post,
    update,
    remove,
    getById,
    authGoogle,
    postGoogle,
    isLoggedIn,
    getEventsGoogle
  }
}
