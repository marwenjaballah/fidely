"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useAuthStore } from "@/store/auth-store"
import { ApiError } from "@/features/auth/services/auth-service"
import { strings } from "@/lib/strings"
import { getRoleRedirectUrl } from "@/lib/navigation"
import { setStoredTokens } from "@/lib/api-client"

type CallbackState = "processing" | "success" | "error"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleGoogleCallback, handleGoogleTokens } = useAuth()
  const [state, setState] = useState<CallbackState>("processing")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const processedRef = useRef(false)
  const handlersRef = useRef({ handleGoogleCallback, handleGoogleTokens, router })

  useEffect(() => {
    handlersRef.current = { handleGoogleCallback, handleGoogleTokens, router }
  }, [handleGoogleCallback, handleGoogleTokens, router])

  useEffect(() => {
    if (typeof window === "undefined" || processedRef.current) return

    // 1. Cross-subdomain SSO handoff
    const isSso = searchParams.get("sso") === "1"
    const ssoAccessToken = searchParams.get("access_token")
    const ssoRefreshToken = searchParams.get("refresh_token")

    if (isSso && ssoAccessToken) {
      processedRef.current = true
      setStoredTokens(ssoAccessToken, ssoRefreshToken || undefined)
      useAuthStore.getState().revalidateSession().then(() => {
        setState("success")
        window.location.replace('/')
      }).catch((err) => {
        console.error("SSO handoff error:", err)
        window.location.replace('/')
      })
      return
    }

    // 2. OAuth Callback (Google / Supabase)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const code = searchParams.get("code") || hashParams.get("code")
    const stateParam = searchParams.get("state") || hashParams.get("state")
    const error = searchParams.get("error") || hashParams.get("error")
    const errorDescription = searchParams.get("error_description") || hashParams.get("error_description")
    
    const accessToken = hashParams.get("access_token")
    const refreshToken = hashParams.get("refresh_token")

    if (error) {
      setErrorMessage(errorDescription || error || strings.auth_oauth_error)
      setState("error")
      processedRef.current = true
      return
    }

    if (!code && !accessToken) {
      setErrorMessage(strings.auth_oauth_missing_code)
      setState("error")
      processedRef.current = true
      return
    }

    processedRef.current = true

    const processCallback = async () => {
      try {
        if (code) {
          await handlersRef.current.handleGoogleCallback(code, stateParam || undefined)
        } else if (accessToken) {
          await handlersRef.current.handleGoogleTokens(accessToken, refreshToken || undefined)
        } else {
          setErrorMessage(strings.auth_oauth_missing_code)
          setState("error")
          return
        }
        
        setState("success")

        const timeout = setTimeout(() => {
          const userRole = useAuthStore.getState().profile?.role
          const currentAccessToken = localStorage.getItem("fidely_access_token")
          const currentRefreshToken = localStorage.getItem("fidely_refresh_token")
          window.location.href = getRoleRedirectUrl(userRole, {
            tokens: {
              accessToken: currentAccessToken,
              refreshToken: currentRefreshToken,
            },
          })
        }, 1000)

        return () => clearTimeout(timeout)
      } catch (err: unknown) {
        console.error("OAuth callback error:", err)
        if (err instanceof ApiError) {
          setErrorMessage(err.message)
        } else {
          setErrorMessage(strings.auth_oauth_error)
        }
        setState("error")
      }
    }

    processCallback()
  }, [searchParams])

  const renderIcon = () => {
    if (state === "processing") return <Loader2 className="w-8 h-8 text-primary animate-spin" />
    if (state === "success") return <CheckCircle className="w-8 h-8 text-green-500" />
    return <XCircle className="w-8 h-8 text-destructive" />
  }

  const title =
    state === "success"
      ? strings.auth_oauth_success_title
      : state === "processing"
        ? strings.auth_oauth_processing_title
        : strings.auth_oauth_error_title

  const description =
    state === "success"
      ? strings.auth_oauth_success_description
      : state === "processing"
        ? strings.auth_oauth_processing_description
        : errorMessage || strings.auth_oauth_error_description

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">{renderIcon()}</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {state === "error" && (
          <button
            onClick={() => router.push("/auth/login")}
            className="text-primary hover:underline"
          >
            {strings.auth_back_to_login}
          </button>
        )}
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
