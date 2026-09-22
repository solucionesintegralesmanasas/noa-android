<template>
    <div class="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div class="text-center p-4 bg-white rounded shadow-sm">
            <i class="fab fa-google text-primary mb-3" style="font-size: 3rem;"></i>
            <h4 class="mb-3 text-secondary">Autenticando con Google...</h4>
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted small">Por favor, espera mientras vinculamos tu cuenta de Google Drive.</p>
        </div>
    </div>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-29
 * @module Features.Auth
 * @resource GoogleCallback
 */

import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api/client'
import { useAuthStore } from '@/store/modules/auth'
import { usePermissionsStore } from '@/store/modules/permissions'
import { useNotifications } from '@/hooks/useNotifications'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const permissionsStore = usePermissionsStore()
const { showSuccessToast, showErrorToast } = useNotifications()

onMounted(async () => {
    // Si no hay token de autenticación (el usuario no está logueado), no podemos vincular
    if (!authStore.isAuthenticated) {
        showErrorToast('Debes iniciar sesión para vincular Google Drive')
        router.push('/login')
        return
    }

    try {
        // Obtenemos todos los query params que devolvió Google (code, state, scope, etc)
        const queryParams = new URLSearchParams(route.query).toString()
        
        // Enviamos la petición al backend para que Laravel Socialite haga el intercambio del code por tokens
        const response = await apiClient.global.get(`/integrations/google-drive/callback?${queryParams}`)

        if (response.data.success) {
            // Actualizar la info del usuario en el store para reflejar que ya vinculó Google
            if (response.data.data && response.data.data.google_email) {
                if (permissionsStore.user) {
                    permissionsStore.user.google_email = response.data.data.google_email;
                    permissionsStore.user.has_google_drive = true;
                }
            }
            
            showSuccessToast('Cuenta de Google Drive vinculada exitosamente')
        } else {
            showErrorToast('No se pudo vincular la cuenta de Google Drive')
        }
    } catch (error) {
        console.error('Error en callback de Google:', error)
        showErrorToast(error.response?.data?.message || 'Ocurrió un error al vincular tu cuenta de Google')
    } finally {
        // Finalmente, redirigir de vuelta al perfil
        router.push('/profile')
    }
})
</script>

<style scoped>

.vh-100 {
    font-family: 'Outfit', sans-serif;
}
</style>
