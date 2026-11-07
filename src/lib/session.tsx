import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react"
import type * as React from "react"
import { useToast } from "@/components/ui/Toast"
import {
  api, ApiError, setUnauthorizedHandler,
  type ApiUser, type DictToggles, type SavedWord, type Settings,
} from "@/lib/api"

type Status = "loading" | "anon" | "authed"

interface Account {
  user: ApiUser
  createdAt: string | null
  settings: Settings
  searches: number
}

export interface Session {
  status: Status
  user: ApiUser | null
  createdAt: string | null
  settings: Settings | null
  saved: SavedWord[]
  savedLoaded: boolean
  searches: number
  isSaved: (word: string) => boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  saveWord: (word: string) => Promise<boolean>
  unsaveWord: (word: string) => Promise<boolean>
  recordSearch: (query: string) => void
  updateName: (name: string) => Promise<void>
  updateSettings: (patch: Partial<Pick<Settings, "notifications" | "tips" | "interests">> & { dicts?: DictToggles }) => Promise<void>
  changePassword: (current: string, next: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>")
  return ctx
}

const norm = (w: string) => w.normalize("NFC").toLowerCase()

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [status, setStatus] = useState<Status>("loading")
  const [account, setAccount] = useState<Account | null>(null)
  const [saved, setSaved] = useState<SavedWord[]>([])
  const [savedLoaded, setSavedLoaded] = useState(false)
  const savedRef = useRef(saved)
  savedRef.current = saved

  const clear = useCallback(() => {
    setAccount(null)
    setSaved([])
    setSavedLoaded(false)
    setStatus("anon")
  }, [])

  const loadAccount = useCallback(async () => {
    const me = await api.me.get()
    setAccount({
      user: { id: me.user.id, email: me.user.email, name: me.user.name },
      createdAt: me.user.createdAt,
      settings: me.settings,
      searches: me.stats.searches,
    })
    setStatus("authed")
    const list = await api.me.saved()
    setSaved(list.saved)
    setSavedLoaded(true)
  }, [])

  // Restore the session from the HttpOnly cookie, if there is one.
  useEffect(() => {
    let alive = true
    api.auth
      .me()
      .then(() => (alive ? loadAccount() : undefined))
      .catch(() => {
        if (alive) setStatus("anon")
      })
    return () => {
      alive = false
    }
  }, [loadAccount])

  // A request that needed a session came back 401: it expired or was revoked.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clear()
      toast({
        id: "session-expired",
        title: "Sua sessão expirou",
        description: "Entre novamente para continuar.",
        variant: "info",
      })
    })
    return () => setUnauthorizedHandler(null)
  }, [clear, toast])

  const login = useCallback(async (email: string, password: string) => {
    await api.auth.login(email, password)
    await loadAccount()
  }, [loadAccount])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.auth.register(name, email, password)
    await loadAccount()
  }, [loadAccount])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } finally {
      clear()
    }
  }, [clear])

  const failed = useCallback(
    (title: string, e: unknown) => {
      if (e instanceof ApiError && e.status === 401) return // the 401 handler already spoke
      toast({
        id: "api-error",
        title,
        description: e instanceof ApiError && e.code === "network"
          ? "Sem conexão com o servidor. Tente novamente."
          : "Algo deu errado. Tente novamente em instantes.",
        variant: "info",
      })
    },
    [toast],
  )

  const reloadSaved = useCallback(async () => {
    const list = await api.me.saved()
    setSaved(list.saved)
  }, [])

  const saveWord = useCallback(async (word: string) => {
    if (savedRef.current.some((s) => norm(s.word) === norm(word))) return true
    const optimistic: SavedWord = { id: -Date.now(), word, pos: null, gloss: null, source: null, savedAt: new Date().toISOString() }
    setSaved((s) => [optimistic, ...s])
    try {
      await api.me.save(word)
      await reloadSaved()
      return true
    } catch (e) {
      setSaved((s) => s.filter((x) => x.id !== optimistic.id))
      failed("Não foi possível salvar", e)
      return false
    }
  }, [failed, reloadSaved])

  const unsaveWord = useCallback(async (word: string) => {
    const hit = savedRef.current.find((s) => norm(s.word) === norm(word))
    if (!hit) return true
    setSaved((s) => s.filter((x) => x !== hit))
    try {
      // The row may still carry a temporary id if the save has not finished yet.
      const id = hit.id > 0 ? hit.id : (await api.me.saved()).saved.find((s) => norm(s.word) === norm(word))?.id
      if (id) await api.me.unsave(id)
      return true
    } catch (e) {
      setSaved((s) => [hit, ...s])
      failed("Não foi possível remover", e)
      return false
    }
  }, [failed])

  const recordSearch = useCallback((query: string) => {
    if (status !== "authed") return
    api.me.recordSearch(query).then(
      () => setAccount((a) => (a ? { ...a, searches: a.searches + 1 } : a)),
      () => undefined, // history is best-effort
    )
  }, [status])

  const updateName = useCallback(async (name: string) => {
    await api.me.rename(name)
    setAccount((a) => (a ? { ...a, user: { ...a.user, name } } : a))
  }, [])

  const updateSettings: Session["updateSettings"] = useCallback(async (patch) => {
    const before = account?.settings
    setAccount((a) => (a ? { ...a, settings: { ...a.settings, ...patch } } : a))
    try {
      await api.me.settings(patch)
    } catch (e) {
      setAccount((a) => (a && before ? { ...a, settings: before } : a))
      failed("Não foi possível salvar a preferência", e)
      throw e
    }
  }, [account?.settings, failed])

  const changePassword = useCallback(async (current: string, next: string) => {
    await api.me.changePassword(current, next)
  }, [])

  const deleteAccount = useCallback(async (password: string) => {
    await api.me.deleteAccount(password)
    clear()
  }, [clear])

  const value = useMemo<Session>(() => ({
    status,
    user: account?.user ?? null,
    createdAt: account?.createdAt ?? null,
    settings: account?.settings ?? null,
    saved,
    savedLoaded,
    searches: account?.searches ?? 0,
    isSaved: (w) => saved.some((s) => norm(s.word) === norm(w)),
    login, register, logout, saveWord, unsaveWord, recordSearch,
    updateName, updateSettings, changePassword, deleteAccount,
  }), [status, account, saved, savedLoaded, login, register, logout, saveWord, unsaveWord, recordSearch, updateName, updateSettings, changePassword, deleteAccount])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
