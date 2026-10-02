import { useState } from "react"
import { AuthModal } from "@/components/auth/AuthModal"
import { MobileAuthPage } from "@/components/auth/MobileAuthPage"
import { DefinitionPage } from "@/components/definition/DefinitionPage"
import { MobileDefinitionPage } from "@/components/definition/MobileDefinitionPage"
import { FavoritesPage } from "@/components/favorites/FavoritesPage"
import { MobileSavedPage } from "@/components/favorites/MobileSavedPage"
import { HomePage } from "@/components/home/HomePage"
import { MobileHomePage } from "@/components/home/MobileHomePage"
import { AppNav } from "@/components/layout/AppNav"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { MobileNotFoundPage } from "@/components/notfound/MobileNotFoundPage"
import { NotFoundPage } from "@/components/notfound/NotFoundPage"
import { MobilePreferencesPage } from "@/components/onboarding/MobilePreferencesPage"
import { MobileTutorialPage } from "@/components/onboarding/MobileTutorialPage"
import { PreferencesPage } from "@/components/onboarding/PreferencesPage"
import { TutorialPage } from "@/components/onboarding/TutorialPage"
import { MobileProfilePage } from "@/components/profile/MobileProfilePage"
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
  const [mobileTab, setMobileTab] = useState<MobileTab>("pesquisar")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [postAuthCb, setPostAuthCb] = useState<(() => void) | null>(null)

  const mobileProfileTab = isMobile && view.type === "home" && mobileTab === "perfil"
  const pageKey =
    view.type === "definition" || view.type === "notfound"
      ? `${view.type}:${view.word}`
      : mobileProfileTab
        ? "home:perfil"
        : view.type
  const slot: PageSlot = {
    type: view.type,
    mobileTab: isMobile ? (view.type === "favorites" ? "salvos" : mobileTab) : undefined,
  }
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
    setMobileTab("pesquisar")
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

  // ── Mobile ───────────────────────────────────────────────────────────────
  if (isMobile) {
    const showAuth = view.type === "login" || view.type === "signup"
    const showPrefs = view.type === "preferences"
    const showTutorial = view.type === "tutorial"
    const showDefinition = view.type === "definition"
    const showNotFound = view.type === "notfound"
    const showBottomNav = !showAuth && !showPrefs && !showTutorial

    const activeTab: MobileTab =
      view.type === "favorites" ? "salvos" : mobileTab

    return (
      <div className="relative" style={{ background: "var(--color-paper-warm)" }}>
        <PageTransition pageKey={pageKey} motion={pageNav.motion}>
        {/* Auth flow */}
        {showAuth && (
          <MobileAuthPage onLogin={() => setView({ type: "preferences" })} />
        )}

        {/* Preferences */}
        {showPrefs && (
          <MobilePreferencesPage
            onContinue={() => setView({ type: "tutorial" })}
          />
        )}

        {/* Tutorial */}
        {showTutorial && (
          <MobileTutorialPage onFinish={() => setView({ type: "home" })} />
        )}

        {/* Main app */}
        {showBottomNav &&
          !showDefinition &&
          !showNotFound &&
          view.type !== "favorites" && (
            <>
              {activeTab === "pesquisar" && (
                <MobileHomePage onSearch={goSearch} />
              )}
              {activeTab === "perfil" && (
                <MobileProfilePage
                  onLogout={logout}
            state={profile}
                  onTutorial={() => setView({ type: "tutorial" })}
                />
              )}
            </>
          )}

        {view.type === "favorites" && showBottomNav && (
          <MobileSavedPage
            onSearch={(w) => {
              goSearch(w)
            }}
            onGoHome={goHome}
          />
        )}

        {showDefinition && (
          <MobileDefinitionPage
            wordData={DB[(view as { type: "definition"; word: string }).word]}
            onSearch={goSearch}
            isLoggedIn={isLoggedIn}
            onOpenAuth={openAuth}
            onBack={() => {
              if (history.length > 1) setView({ type: "home" })
              else setView({ type: "home" })
            }}
          />
        )}

        {showNotFound && (
          <MobileNotFoundPage
            word={(view as { type: "notfound"; word: string }).word}
            onBack={() => setView({ type: "home" })}
          />
        )}
        </PageTransition>

        {/* Bottom nav */}
        {showBottomNav && (
          <MobileBottomNav
            active={activeTab}
            onChange={(tab) => {
              setMobileTab(tab)
              if (tab === "salvos") setView({ type: "favorites" })
              else setView({ type: "home" })
            }}
          />
        )}

        {authModal && (
          <AuthModal
            defaultMode={authModal}
            onAuth={handleAuth}
            onClose={() => {
              setAuthModal(null)
              setPostAuthCb(null)
            }}
          />
        )}
      </div>
    )
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  function goProfile() {
    if (!isLoggedIn) {
      openAuth()
      return
    }
    setView({ type: "profile" })
  }

  const showAppNav = [
    "home",
    "definition",
    "favorites",
    "notfound",
    "profile",
    "tutorial",
  ].includes(view.type)

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
          <div style={{ marginTop: -NAV_HEIGHT }}>
            <HomePage onSearch={goSearch} />
          </div>
        )}
        {view.type === "definition" && (
          <DefinitionPage
            wordData={DB[(view as { type: "definition"; word: string }).word]}
            onSearch={goSearch}
            isLoggedIn={isLoggedIn}
            onOpenAuth={(then) => openAuth(then)}
          />
        )}
        {view.type === "favorites" && (
          <FavoritesPage onSearch={goSearch} onGoHome={goHome} />
        )}
        {view.type === "notfound" && (
          <NotFoundPage
            word={(view as { type: "notfound"; word: string }).word}
            onBack={goHome}
          />
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
      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onAuth={handleAuth}
          onClose={() => {
            setAuthModal(null)
            setPostAuthCb(null)
          }}
        />
      )}
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
