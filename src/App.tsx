import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { MobileAuthPage } from "@/components/auth/MobileAuthPage";
import { DefinitionPage } from "@/components/definition/DefinitionPage";
import { MobileDefinitionPage } from "@/components/definition/MobileDefinitionPage";
import { FavoritesPage } from "@/components/favorites/FavoritesPage";
import { MobileSavedPage } from "@/components/favorites/MobileSavedPage";
import { HomePage } from "@/components/home/HomePage";
import { MobileHomePage } from "@/components/home/MobileHomePage";
import { AppNav } from "@/components/layout/AppNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileNotFoundPage } from "@/components/notfound/MobileNotFoundPage";
import { NotFoundPage } from "@/components/notfound/NotFoundPage";
import { MobilePreferencesPage } from "@/components/onboarding/MobilePreferencesPage";
import { MobileTutorialPage } from "@/components/onboarding/MobileTutorialPage";
import { PreferencesPage } from "@/components/onboarding/PreferencesPage";
import { TutorialPage } from "@/components/onboarding/TutorialPage";
import { MobileProfilePage } from "@/components/profile/MobileProfilePage";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { DB } from "@/lib/data";
import { useIsMobile } from "@/lib/hooks";
import { MobileTab } from "@/lib/types";

type View =
  | { type: "login" }
  | { type: "signup" }
  | { type: "preferences" }
  | { type: "tutorial" }
  | { type: "home" }
  | { type: "definition"; word: string }
  | { type: "favorites" }
  | { type: "notfound"; word: string }
  | { type: "profile" };

export default function App() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>({ type: "home" });
  const [navSearch, setNavSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("pesquisar");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [postAuthCb, setPostAuthCb] = useState<(() => void) | null>(null);

  function openAuth(then?: () => void) {
    setPostAuthCb(then ? () => then : null);
    setAuthModal("login");
  }
  function handleAuth() {
    setIsLoggedIn(true);
    setAuthModal(null);
    if (postAuthCb) { postAuthCb(); setPostAuthCb(null); return; }
    setView({ type: "preferences" });
  }

  function goSearch(word: string) {
    const key = word.toLowerCase();
    if (DB[key]) setView({ type: "definition", word: key });
    else setView({ type: "notfound", word });
  }

  function goHome() { setView({ type: "home" }); setNavSearch(""); setMobileTab("pesquisar"); }
  function goFav()  { setView({ type: "favorites" }); }

  // ── Mobile ───────────────────────────────────────────────────────────────
  if (isMobile) {
    const showAuth = view.type === "login" || view.type === "signup";
    const showPrefs = view.type === "preferences";
    const showTutorial = view.type === "tutorial";
    const showDefinition = view.type === "definition";
    const showNotFound = view.type === "notfound";
    const showBottomNav = !showAuth && !showPrefs && !showTutorial;

    const activeTab: MobileTab =
      view.type === "favorites" ? "salvos" : mobileTab;

    return (
      <div className="relative" style={{ background: "#fbf9f6" }}>
        {/* Auth flow */}
        {showAuth && (
          <MobileAuthPage onLogin={() => setView({ type: "preferences" })} />
        )}

        {/* Preferences */}
        {showPrefs && (
          <MobilePreferencesPage onContinue={() => setView({ type: "tutorial" })} />
        )}

        {/* Tutorial */}
        {showTutorial && (
          <MobileTutorialPage onFinish={() => setView({ type: "home" })} />
        )}

        {/* Main app */}
        {showBottomNav && !showDefinition && !showNotFound && view.type !== "favorites" && (
          <>
            {activeTab === "pesquisar" && <MobileHomePage onSearch={goSearch} />}
            {activeTab === "perfil" && <MobileProfilePage onLogout={goHome} />}
          </>
        )}

        {view.type === "favorites" && showBottomNav && (
          <MobileSavedPage onSearch={w => { goSearch(w); }} />
        )}

        {showDefinition && (
          <MobileDefinitionPage
            wordData={DB[(view as { type: "definition"; word: string }).word]}
            onSearch={goSearch}
            isLoggedIn={isLoggedIn}
            onOpenAuth={openAuth}
            onBack={() => {
              if (history.length > 1) setView({ type: "home" });
              else setView({ type: "home" });
            }}
          />
        )}

        {showNotFound && (
          <MobileNotFoundPage
            word={(view as { type: "notfound"; word: string }).word}
            onBack={() => setView({ type: "home" })}
          />
        )}

        {/* Bottom nav */}
        {showBottomNav && (
          <MobileBottomNav
            active={activeTab}
            onChange={tab => {
              setMobileTab(tab);
              if (tab === "salvos") setView({ type: "favorites" });
              else setView({ type: "home" });
            }}
          />
        )}
      </div>
    );
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  function goProfile() {
    if (!isLoggedIn) { openAuth(); return; }
    setView({ type: "profile" });
  }

  const showAppNav = ["home","definition","favorites","notfound","profile"].includes(view.type);

  return (
    <>
      {showAppNav && (
        <AppNav
          onHome={goHome}
          onFavorites={goFav}
          onProfile={goProfile}
          onSearch={word => { setNavSearch(""); goSearch(word); }}
          searchValue={navSearch}
          onSearchChange={setNavSearch}
          isLoggedIn={isLoggedIn}
          hideSearch={view.type === "home"}
        />
      )}
      <div style={{ paddingTop: showAppNav ? 64 : 0 }}>
        {view.type === "preferences" && (
          <PreferencesPage onContinue={() => setView({ type: "tutorial" })} />
        )}
        {view.type === "tutorial" && (
          <TutorialPage onFinish={() => setView({ type: "home" })} />
        )}
        {view.type === "home" && (
          <div style={{ marginTop: -64 }}>
            <HomePage onSearch={goSearch} onOpenAuth={() => openAuth()} />
          </div>
        )}
        {view.type === "definition" && (
          <div style={{ marginTop: -64 }}>
            <DefinitionPage
              wordData={DB[(view as { type: "definition"; word: string }).word]}
              onSearch={goSearch}
              onBack={goHome}
              isLoggedIn={isLoggedIn}
              onOpenAuth={then => openAuth(then)}
            />
          </div>
        )}
        {view.type === "favorites" && (
          <FavoritesPage onSearch={goSearch} />
        )}
        {view.type === "notfound" && (
          <NotFoundPage
            word={(view as { type: "notfound"; word: string }).word}
            onBack={goHome}
          />
        )}
        {view.type === "profile" && (
          <ProfilePage onLogout={() => { setIsLoggedIn(false); goHome(); }} onBack={goHome} />
        )}
      </div>
      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onAuth={handleAuth}
          onClose={() => { setAuthModal(null); setPostAuthCb(null); }}
        />
      )}
    </>
  );
}
