<script setup lang="ts">
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle
} from '@/components/ui/dialog/index.js'
import { CameraIcon, EnvelopeClosedIcon, GithubLogoIcon, GlobeIcon, HomeIcon, InfoCircledIcon, LayersIcon,
  PersonIcon, UpdateIcon } from '@radix-icons/vue'
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuSub } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { useImportExport } from '@/composables/useImportExport'
import { usePresetsStore } from '@/stores/presets'
const route = useRoute();
const mode = useColorMode()
const auth = useAuthStore()

const infoOpen = ref(false);
const loginOpen = ref(false);
const emailLoginOpen = ref(false)
const email = ref('')
const password = ref('')
const authError = ref('')
const signingUp = ref(false)
const resetSent = ref(false)
const newPassword = ref('')

watch(() => auth.recoveringPassword, (recovering) => {
  if (recovering) {
    loginOpen.value = true
  }
})

const authBusy = ref(false)

const runAuth = async (action: () => Promise<void>) => {
  authError.value = ''
  authBusy.value = true
  try {
    await action()
  } catch (error) {
    authError.value = error.message
  } finally {
    authBusy.value = false
  }
}

const sendReset = () => {
  if (!email.value) {
    authError.value = 'Enter your email first'
    return
  }
  return runAuth(async () => {
    await auth.sendPasswordReset(email.value)
    resetSent.value = true
  })
}

const submitNewPassword = () => runAuth(() => auth.updatePassword(newPassword.value))

const submitPassword = () => runAuth(() => signingUp.value
  ? auth.signUp(email.value, password.value)
  : auth.loginWithPassword(email.value, password.value))

const { getPresetsForExport, importPresets } = useImportExport();
const { firstVisit } = usePresetsStore();

const emit = defineEmits(['presets-imported'])

const toggleTo = computed(() => (route.path === '/map' ? '/' : '/map'));

const exportProfiles = async () => {
  const profiles = await getPresetsForExport();

  const json = JSON.stringify(profiles)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'profiles.json'
  a.click()

  URL.revokeObjectURL(url)
}
const importInput = ref(null)
const importProfiles = () => importInput.value.click();

const handleImport = (event) => {
  const file = event.target.files?.[0]
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = async () =>{
     await importPresets(reader.result)
    emit('presets-imported')
  }
  reader.readAsText(file)

  event.target.value = ''
}

</script>

<template>
  <div class="hidden md:flex space-x-2 lg:space-x-4">
    <Button @click="infoOpen = true" variant="outline" class="px-3 lg:px-4"> <InfoCircledIcon></InfoCircledIcon></Button>
    <Button @click="$router.push(toggleTo)" variant="outline" class="px-3 lg:px-4">
      <GlobeIcon v-if="route.path === '/'"></GlobeIcon>
      <HomeIcon v-else></HomeIcon>
    </Button>
    <a href="https://github.com/AydinHassan/austriawebcamwatch" target="_blank">
      <Button variant="outline" class="px-3 lg:px-4">
        <GithubLogoIcon></GithubLogoIcon>
      </Button>
    </a>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="px-3 lg:px-4">
          <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="px-3 lg:px-4">
          <Icon icon="radix-icons:gear" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span class="sr-only">Config</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="exportProfiles"> Export profiles</DropdownMenuItem>
        <DropdownMenuItem @click="importProfiles"> Import profiles</DropdownMenuItem>
        <input
          ref="importInput"
          type="file"
          accept="application/json"
          class="hidden"
          @change="handleImport"
        >
      </DropdownMenuContent>
    </DropdownMenu>

    <Button @click="loginOpen = true" variant="outline" class="px-3 lg:px-4">
      <PersonIcon :class="auth.user ? 'text-green-500' : 'text-red-400'" />
    </Button>
  </div>

  <div class="inline-flex md:hidden">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="px-3 lg:px-4">
          <Icon icon="radix-icons:hamburger-menu" class="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-48">
        <DropdownMenuItem @click="infoOpen = true">
          <InfoCircledIcon class="mr-2 h-4 w-4" />
          Info & Help
        </DropdownMenuItem>

        <DropdownMenuItem @click="$router.push(toggleTo)">
          <GlobeIcon v-if="route.path === '/'" class="mr-2 h-4 w-4" />
          <HomeIcon v-else class="mr-2 h-4 w-4" />
          {{ route.path === '/' ? 'Map' : 'Webcams' }}
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <a href="https://github.com/AydinHassan/austriawebcamwatch" target="_blank" class="flex items-center">
            <GithubLogoIcon class="mr-2 h-4 w-4" />
            GitHub
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icon icon="radix-icons:moon" class="mr-4 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Icon icon="radix-icons:sun" class="mr-4 absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
              <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
              <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>

        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem @click="loginOpen = true">
          <PersonIcon class="mr-2 h-4 w-4" :class="auth.user ? 'text-green-500' : 'text-red-400'" />
          {{ auth.user ? 'Profile' : 'Login' }}
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  </div>


  <Dialog v-model:open="infoOpen">
    <DialogScrollContent class="w-[90vw] sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Info and Help</DialogTitle>
      </DialogHeader>
      <div class="flex space-x-2 flex-col pt-6">
        <p v-show="firstVisit" class="text-sm text-gray-300 mb-6">Welcome to Austria Webcam Watcher - we've added a few default webcams for you to monitor. Read on below to understand why and how to use.</p>
        <div class="grid grid-cols-8 mb-8">
          <CameraIcon class="h-8 w-6 col-span-1 text-primary"/>
          <p class="text-sm text-gray-300 col-span-7">This website allows you to monitor multiple webcams in Austria from <a class="underline text-primary" href="https://www.bergfex.at" target="_blank" rel="noopener">Bergfex</a>, <a class="underline text-primary" href="https://www.panomax.com/" target="_blank" rel="noopener">Panomax</a> and <a class="underline text-primary" href="https://www.foto-webcam.eu/" target="_blank" rel="noopener">foto-webcam.eu</a>. You can search and select up to 9 webcams per preset.</p>
        </div>

        <div class="grid grid-cols-8 mb-8">
          <LayersIcon class="h-8 w-8 col-span-1 text-primary"/>
          <p class="text-sm text-gray-300 col-span-7">You can create multiple presets and add up to 9 webcams on each. For example you could have presets for the Wachau, Hohe Tauern & Südsteiermark. You can easily switch presets using the drop down in the menu bar.</p>
        </div>

        <div class="grid grid-cols-8 mb-8">
          <UpdateIcon class="h-8 w-8 col-span-1 text-primary"/>
          <p class="text-sm text-gray-300 col-span-7">Each selected webcam can be refreshed, deleted and enlarged using the controls when hovering on a webcam. You can also visit the provider website.</p>
        </div>

        <div class="grid grid-cols-8 mb-8">
          <GlobeIcon class="h-8 w-8 col-span-1 text-primary"/>
          <p class="text-sm text-gray-300  col-span-7">You can also view all the webcams on a map of Austria by clicking the globe icon in the top right. From there you can add webcams to your selected preset.</p>
        </div>

        <div class="grid grid-cols-8 mb-12">
          <GithubLogoIcon class="h-8 w-8 col-span-1 text-primary"/>
          <p class="text-sm text-gray-300 col-span-7">I created this site as an easy way to monitor weather conditions for photography projects. The code is <a class="underline text-primary" href="https://github.com/AydinHassan/austriawebcamwatch" target="_blank" rel="noopener">fully open source on GitHub</a>.</p>
        </div>

        <p class="inline-flex items-center text-xs text-gray-300">To view this help again, click the <InfoCircledIcon class="mx-1"/> icon in the top right corner.</p>
      </div>
      <DialogFooter class="sm:justify-end">
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>

  <Dialog v-model:open="loginOpen">
    <DialogScrollContent class="w-[90vw] sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Profile</DialogTitle>
      </DialogHeader>
      <div class="flex space-x-2 flex-col pt-6">
        <form v-if="auth.recoveringPassword" class="flex flex-col gap-3" @submit.prevent="submitNewPassword">
          <Label for="new-password">New password</Label>
          <Input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" minlength="6" required />
          <p v-show="authError" class="text-xs text-red-600">{{ authError }}</p>
          <Button type="submit" :disabled="authBusy">{{ authBusy ? 'Saving…' : 'Set password' }}</Button>
        </form>
        <div v-else-if="auth.user" class="flex flex-col gap-4">
          <p>Logged in as <Badge variant="secondary">{{auth.user.email}}</Badge> via <Badge variant="outline" class="capitalize">{{auth.user.app_metadata.provider}}</Badge></p>

          <Button variant="destructive" type="button" @click="auth.logout()">Logout</Button>
        </div>
        <div v-else-if="!emailLoginOpen" class="flex flex-col gap-3">
          <Button variant="outline" type="button" @click="auth.login('github')">
            <GithubLogoIcon class="mr-2 h-4 w-4" />
            Login with GitHub
          </Button>
          <Button variant="outline" type="button" @click="emailLoginOpen = true">
            <EnvelopeClosedIcon class="mr-2 h-4 w-4" />
            Login with email
          </Button>
        </div>
        <div v-else class="flex flex-col gap-4">
          <form class="flex flex-col gap-3" @submit.prevent="submitPassword">
            <Label for="login-email">Email</Label>
            <Input id="login-email" v-model="email" type="email" autocomplete="email" required />
            <Label for="login-password">Password</Label>
            <Input id="login-password" v-model="password" type="password" :autocomplete="signingUp ? 'new-password' : 'current-password'" minlength="6" required />
            <p v-show="authError" class="text-xs text-red-600">{{ authError }}</p>
            <p v-show="resetSent" class="text-xs text-muted-foreground">If that email has an account, a reset link is on its way.</p>
            <Button type="submit" :disabled="authBusy">{{ authBusy ? 'Please wait…' : signingUp ? 'Sign up' : 'Log in' }}</Button>
          </form>
          <button v-if="!signingUp" type="button" class="text-xs text-muted-foreground underline hover:text-primary disabled:opacity-50" :disabled="authBusy" @click="sendReset">Forgot password?</button>
          <p class="text-center text-xs text-muted-foreground">
            {{ signingUp ? 'Have an account?' : 'No account?' }}
            <button type="button" class="underline hover:text-primary" @click="signingUp = !signingUp; authError = ''">{{ signingUp ? 'Log in' : 'Sign up' }}</button>
          </p>
          <button type="button" class="text-xs text-muted-foreground hover:text-primary" @click="emailLoginOpen = false">Back</button>
        </div>
      </div>
      <DialogFooter class="sm:justify-end">
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
