import { useEffect, useRef, useState } from "react"
import { AnimatePresence } from "motion/react"
import { AuthModal } from "@/components/auth/AuthModal"
import { DefinitionPage } from "@/components/definition/DefinitionPage"
import { FavoritesPage } from "@/components/favorites/FavoritesPage"
import { HomePage } from "@/components/home/HomePage"
import { AppNav } from "@/components/layout/AppNav"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { NotFoundPage } from "@/components/notfound/NotFoundPage"
import { TutorialPage } from "@/components/onboarding/TutorialPage"
import { ProfilePage } from "@/components/profile/ProfilePage"
import { PageTransition } from "@/components/ui/PageTransition"
import { TipHost, TipsProvider, useTips } from "@/components/ui/Tips"
import { WordLoading } from "@/components/ui/WordLoading"
import { ToastProvider, useToast } from "@/components/ui/Toast"
import { type PageMotion, type PageSlot, motionBetween } from "@/lib/pageMotion"
import { useIsMobile, useMobileProfileState } from "@/lib/hooks"
import { useRoute, wordKey } from "@/lib/router"
import { STATIC_SITE } from "@/lib/api"
import { SessionProvider, useSession } from "@/lib/session"
import { useWordData } from "@/lib/words"
import { MobileTab } from "@/lib/types"

const NAV_HEIGHT = 53
const SITE_TITLE = "Diciobase: os dicionários do português em uma só busca"

function AppInner() {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const profile = useMobileProfileState()
  const session = useSession()
  const tips = useTips()
  const { route, navigate } = useRoute()
  const view = route.view
  const [navSearch, setNavSearch] = useState("")
  const isLoggedIn = session.status === "authed"
  const [attempt, setAttempt] = useState(0)
  const lookup = useWordData(view.type === "definition" ? view.word : null, attempt)
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [authWord, setAuthWord] = useState<string | null>(null)
  const [postAuthCb, setPostAuthCb] = useState<(() => void) | null>(null)

  const pageKey = view.type === "definition" ? `definition:${view.word}` : view.type
  const slot: PageSlot = { type: view.type }
  const [pageNav, setPageNav] = useState<{
    key: string
    slot: PageSlot
    motion: PageMotion
  }>({ key: pageKey, slot, motion: { kind: "side", dir: 1 } })
  if (pageNav.key !== pageKey) {
    const nextSlot: PageSlot = slot
    setPageNav({
      key: pageKey,
      slot: nextSlot,
      motion: motionBetween(pageNav.slot, nextSlot, isMobile, route.travel),
    })
  }

  // Opened by saving a word: it says which word, and defaults to creating an account.
  function openAuth(then?: () => void, word?: string) {
    setPostAuthCb(then ? () => then : null)
    setAuthWord(word ?? null)
    setAuthModal(word ? "signup" : "login")
  }
  async function submitAuth(
    mode: "login" | "signup",
    v: { name: string; email: string; password: string },
  ) {
    if (mode === "signup") await session.register(v.name, v.email, v.password)
    else await session.login(v.email, v.password)
    setAuthModal(null)
    const then = postAuthCb
    setPostAuthCb(null)
    if (then) {
      then()
      return
    }
    toast({
      id: "auth",
      title: mode === "signup" ? "Conta criada" : "Login realizado",
      description: mode === "signup" ? "Bem-vindo ao Diciobase." : "Sua conta está pronta para usar.",
    })
  }

  function goSearch(word: string) {
    const key = wordKey(word)
    if (!key) return
    navigate({ type: "definition", word: key })
    session.recordSearch(key)
  }

  function goHome() {
    navigate({ type: "home" })
    setNavSearch("")
  }
  async function logout() {
    await session.logout().catch(() => undefined)
    goHome()
    toast({
      id: "auth",
      title: "Você saiu da conta",
      description: "Suas palavras salvas ficam guardadas até o próximo acesso.",
      variant: "info",
    })
  }
  function goFav() {
    navigate({ type: "favorites" })
  }

  function goProfile() {
    if (!isLoggedIn) {
      openAuth()
      return
    }
    navigate({ type: "profile" })
  }

  // /perfil opened by link or by Back with no session: ask to sign in, unless the person just signed out here.
  const prevStatus = useRef(session.status)
  useEffect(() => {
    const was = prevStatus.current
    prevStatus.current = session.status
    if (view.type !== "profile" || session.status !== "anon") return
    navigate({ type: "home" }, { replace: true })
    if (was !== "authed") openAuth(() => navigate({ type: "profile" }))
  }, [view.type, session.status, navigate])

  // An open sign-in dialog belongs to the page it was opened on; Back or Forward leaves that page.
  useEffect(() => {
    if (route.travel !== "new") {
      setAuthModal(null)
      setPostAuthCb(null)
    }
  }, [route])

  const wordTitle = view.type === "definition" ? (lookup.status === "ready" ? lookup.data.word : view.word) : null
  useEffect(() => {
    document.title = wordTitle
      ? `Diciobase | ${wordTitle.charAt(0).toLocaleUpperCase("pt-BR")}${wordTitle.slice(1)}`
      : view.type === "favorites"
        ? "Salvos · Diciobase"
        : view.type === "profile"
          ? "Perfil · Diciobase"
          : view.type === "tutorial"
            ? "Como funciona · Diciobase"
            : SITE_TITLE
  }, [wordTitle, view.type])

  // The landing page has its own big search; the nav's only appears once that one is scrolled away.
  const [heroSearchVisible, setHeroSearchVisible] = useState(true)
  const inMainApp = ["home", "definition", "favorites", "profile"].includes(view.type)
  const showAppNav = !isMobile && (inMainApp || view.type === "tutorial")
  const showBottomNav = isMobile && inMainApp
  useEffect(() => {
    document.documentElement.dataset.tabbar = showBottomNav ? "1" : ""
  }, [showBottomNav])

  // The account's own "tips off" choice follows the user to any device.
  const serverTips = session.settings?.tips
  useEffect(() => {
    if (serverTips === false && tips.enabled) tips.setEnabled(false)
  }, [serverTips, tips])
  const activeTab: MobileTab =
    view.type === "favorites" ? "salvos" : view.type === "profile" ? "perfil" : "pesquisar"

  return (
    <>
      {showAppNav && (
        <AppNav
          initial={session.user?.name?.[0] ?? "?"}
          avatarSrc={profile.avatarSrc}
          onHome={goHome}
          onFavorites={goFav}
          onProfile={goProfile}
          onSearch={(word) => {
            setNavSearch("")
            goSearch(word)
          }}
          searchValue={navSearch}
          onSearchChange={setNavSearch}
          // The static site's reader has no name to show an initial of, so the nav keeps the person icon.
          isLoggedIn={isLoggedIn && !STATIC_SITE}
          hideSearch={
            (view.type === "home" && heroSearchVisible) ||
            view.type === "favorites" ||
            view.type === "tutorial" ||
            view.type === "profile"
          }
        />
      )}
      <div style={{ paddingTop: showAppNav ? NAV_HEIGHT : 0 }}>
        <PageTransition pageKey={pageKey} motion={pageNav.motion}>
          {view.type === "tutorial" && (
            <TutorialPage onFinish={() => navigate({ type: "home" })} />
          )}
          {view.type === "home" && (
            <div style={{ marginTop: showAppNav ? -NAV_HEIGHT : 0 }}>
              <HomePage onSearch={goSearch} onHeroSearchVisible={setHeroSearchVisible} />
            </div>
          )}
          {view.type === "definition" &&
            (lookup.status === "ready" ? (
              <DefinitionPage
                wordData={lookup.data}
                typed={view.word}
                onSearch={goSearch}
                onBack={goHome}
                isLoggedIn={isLoggedIn}
                onOpenAuth={openAuth}
              />
            ) : lookup.status === "loading" ? (
              <WordLoading word={view.word} />
            ) : (
              <NotFoundPage
                key={view.word}
                word={view.word}
                unavailable={lookup.status === "error"}
                onBack={goHome}
                onSearch={goSearch}
                onRetry={() => setAttempt((n) => n + 1)}
              />
            ))}
          {view.type === "favorites" && (
            <FavoritesPage onSearch={goSearch} onGoHome={goHome} onOpenAuth={() => openAuth()} />
          )}
          {view.type === "profile" && session.status === "authed" && (
            <ProfilePage
              onLogout={logout}
              onDeleted={() => {
                goHome()
                toast({
                  id: "auth",
                  title: "Conta excluída",
                  description: "Seus dados foram removidos do Diciobase.",
                  variant: "info",
                })
              }}
              state={profile}
              onTutorial={() => navigate({ type: "tutorial" })}
              onExplore={goHome}
            />
          )}
        </PageTransition>
      </div>

      {showBottomNav && (
        <MobileBottomNav
          active={activeTab}
          onChange={(tab) => {
            if (tab === "salvos") goFav()
            else if (tab === "perfil") goProfile()
            else goHome()
          }}
        />
      )}

      {(view.type === "home" ||
        view.type === "definition" ||
        view.type === "favorites" ||
        view.type === "profile") && (
        <TipHost
          key={pageKey}
          screen={view.type}
          paused={!!authModal || (view.type === "profile" && profile.panel !== "main")}
        />
      )}

      <AnimatePresence>
        {authModal && (
          <AuthModal
            key="auth"
            defaultMode={authModal}
            word={authWord ?? undefined}
            onSubmit={submitAuth}
            onClose={() => {
              setAuthModal(null)
              setPostAuthCb(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <TipsProvider>
        <SessionProvider>
          <AppInner />
        </SessionProvider>
      </TipsProvider>
    </ToastProvider>
  )
}
