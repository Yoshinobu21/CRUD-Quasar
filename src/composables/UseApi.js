import { api } from 'boot/axios'

export default function useApi (url) {
  const list = async () => {
    try {
      const response = await api.get(`${url}`)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const getEventsGoogle = async () => {
    try {
      const response = await api.get(`${url}/events-google`)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const getById = async (id) => {
    try {
      const response = await api.get(`${url}/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const post = async (form) => {
    try {
      const response = await api.post(`${url}/add-event`, form)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const authGoogle = async () => {
    try {
      const response = await api.get(`${url}/google-auth`)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const isLoggedIn = async () => {
    try {
      const response = await api.get(`${url}/is-logged-in`)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const postGoogle = async (form) => {
    try {
      const response = await api.post(`${url}/add-event-google`, form)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const update = async (form) => {
    try {
      const response = await api.put(`${url}/edit-event`, form)
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const remove = async (id) => {
    try {
      const { data } = await api.delete(`${url}/delete-event/${id}`)
      return data
    } catch (error) {
      throw new Error(error)
    }
  }

  return {
    list,
    post,
    update,
    remove,
    getById,
    postGoogle,
    authGoogle,
    isLoggedIn,
    getEventsGoogle
  }
}
