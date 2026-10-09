import { useEffect, useState } from "react"
import { AnimatePresence } from "motion/react"
import { AuthModal } from "@/components/auth/AuthModal"
import { DefinitionPage } from "@/components/definition/DefinitionPage"
import { FavoritesPage } from "@/components/favorites/FavoritesPage"
import { HomePage } from "@/components/home/HomePage"
import { AppNav } from "@/components/layout/AppNav"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { NotFoundPage } from "@/components/notfound/NotFoundPage"
import { PreferencesPage } from "@/components/onboarding/PreferencesPage"
import { TutorialPage } from "@/components/onboarding/TutorialPage"
import { ProfilePage } from "@/components/profile/ProfilePage"
import { DB } from "@/lib/data"
import { PageTransition } from "@/components/ui/PageTransition"
import { ToastProvider, useToast } from "@/components/ui/Toast"
import { type PageMotion, type PageSlot, motionBetween } from "@/lib/pageMotion"
import { useIsMobile, useMobileProfileState } from "@/lib/hooks"
import { MobileTab } from "@/lib/types"

type View =
  | { type: "login" }
  | { type: "signup" }
  | { type: "preferences" }
  | { type: "tutorial" }
  | { type: "home" }
  | { type: "definition"; word: string }
  | { type: "favorites" }
  | { type: "notfound"; word: string }
  | { type: "profile" }

const NAV_HEIGHT = 53

function AppInner() {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const profile = useMobileProfileState()
  const [view, setView] = useState<View>({ type: "home" })
  const [navSearch, setNavSearch] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [postAuthCb, setPostAuthCb] = useState<(() => void) | null>(null)

  const pageKey =
    view.type === "definition" || view.type === "notfound"
      ? `${view.type}:${view.word}`
      : view.type
  const slot: PageSlot = { type: view.type }
  const [pageNav, setPageNav] = useState<{
    key: string
    slot: PageSlot
    motion: PageMotion
  }>({ key: pageKey, slot, motion: { kind: "side", dir: 1 } })
  if (pageNav.key !== pageKey) {
    const nextSlot: PageSlot = {
      ...slot,
      onboarding:
        view.type === "preferences" ||
        (view.type === "tutorial" &&
          (pageNav.slot.type === "preferences" || !!pageNav.slot.onboarding)),
    }
    setPageNav({
      key: pageKey,
      slot: nextSlot,
      motion: motionBetween(pageNav.slot, nextSlot, isMobile),
    })
  }

  function openAuth(then?: () => void) {
    setPostAuthCb(then ? () => then : null)
    setAuthModal("login")
  }
  function handleAuth() {
    setIsLoggedIn(true)
    setAuthModal(null)
    if (postAuthCb) {
      postAuthCb()
      setPostAuthCb(null)
      return
    }
    toast({
      id: "auth",
      title: "Login realizado",
      description: "Sua conta está pronta para usar.",
    })
    setView({ type: "preferences" })
  }

  function goSearch(word: string) {
    const key = word.toLowerCase()
    if (DB[key]) setView({ type: "definition", word: key })
    else setView({ type: "notfound", word })
  }

  function goHome() {
    setView({ type: "home" })
    setNavSearch("")
  }
  function logout() {
    setIsLoggedIn(false)
    goHome()
    toast({
      id: "auth",
      title: "Você saiu da conta",
      description: "Suas palavras salvas ficam guardadas até o próximo acesso.",
      variant: "info",
    })
  }
  function goFav() {
    setView({ type: "favorites" })
  }

  function goProfile() {
    if (!isLoggedIn) {
      openAuth()
      return
    }
    setView({ type: "profile" })
  }

  const inMainApp = ["home", "definition", "favorites", "notfound", "profile"].includes(
    view.type,
  )
  const showAppNav = !isMobile && (inMainApp || view.type === "tutorial")
  const showBottomNav = isMobile && inMainApp
  useEffect(() => {
    document.documentElement.dataset.tabbar = showBottomNav ? "1" : ""
  }, [showBottomNav])
  const activeTab: MobileTab =
    view.type === "favorites" ? "salvos" : view.type === "profile" ? "perfil" : "pesquisar"

  return (
    <>
      {showAppNav && (
        <AppNav
          initial={profile.name[0]}
          avatarSrc={profile.avatarSrc}
          onHome={goHome}
          onFavorites={goFav}
          onProfile={goProfile}
          onTutorial={() => setView({ type: "tutorial" })}
          onSearch={(word) => {
            setNavSearch("")
            goSearch(word)
          }}
          searchValue={navSearch}
          onSearchChange={setNavSearch}
          isLoggedIn={isLoggedIn}
          hideSearch={
            view.type === "home" ||
            view.type === "favorites" ||
            view.type === "tutorial" ||
            view.type === "profile"
          }
        />
      )}
      <div style={{ paddingTop: showAppNav ? NAV_HEIGHT : 0 }}>
        <PageTransition pageKey={pageKey} motion={pageNav.motion}>
          {view.type === "preferences" && (
            <PreferencesPage onContinue={() => setView({ type: "tutorial" })} />
          )}
          {view.type === "tutorial" && (
            <TutorialPage onFinish={() => setView({ type: "home" })} />
          )}
          {view.type === "home" && (
            <div style={{ marginTop: showAppNav ? -NAV_HEIGHT : 0 }}>
              <HomePage onSearch={goSearch} />
            </div>
          )}
          {view.type === "definition" && (
            <DefinitionPage
              wordData={DB[view.word]}
              onSearch={goSearch}
              onBack={goHome}
              isLoggedIn={isLoggedIn}
              onOpenAuth={(then) => openAuth(then)}
            />
          )}
          {view.type === "favorites" && (
            <FavoritesPage onSearch={goSearch} onGoHome={goHome} />
          )}
          {view.type === "notfound" && (
            <NotFoundPage word={view.word} onBack={goHome} />
          )}
          {view.type === "profile" && (
            <ProfilePage
              onLogout={logout}
              state={profile}
              onTutorial={() => setView({ type: "tutorial" })}
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

      <AnimatePresence>
        {authModal && (
          <AuthModal
            key="auth"
            defaultMode={authModal}
            onAuth={handleAuth}
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
      <AppInner />
    </ToastProvider>
  )
}
