import { defineStore } from 'pinia'
import { ref } from 'vue'
import useSupabase from '@/composables/useSupabase'

export const useAuthStore = defineStore('auth', () => {
  const { supabase } = useSupabase()
  const user = ref(null)
  const recoveringPassword = ref(false)
  let initialised = false

  async function init() {
    if (initialised) {
      return
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        user.value = null
      }
      if (event === 'SIGNED_IN') {
        user.value = session?.user ?? null
      }
      if (event === 'PASSWORD_RECOVERY') {
        recoveringPassword.value = true
      }
    });

    const { data } = await supabase.auth.getUser();
    user.value = data.user ?? null;

    initialised = true;
  }

  async function login(provider) {
    await supabase.auth.signInWithOAuth({ provider })
  }

  async function loginWithPassword(email: string, password: string, captchaToken: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } })
    if (error) {
      throw error
    }
    window.location.reload()
  }

  async function signUp(email: string, password: string, captchaToken: string) {
    const { error } = await supabase.auth.signUp({ email, password, options: { captchaToken } })
    if (error) {
      throw error
    }
    window.location.reload()
  }

  async function sendPasswordReset(email: string, captchaToken: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin, captchaToken })
    if (error) {
      throw error
    }
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      throw error
    }
    window.location.reload()
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, recoveringPassword, init, login, loginWithPassword, signUp, sendPasswordReset, updatePassword, logout }
})
