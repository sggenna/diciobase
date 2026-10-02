// Page-transition grammar. Every move in the app is one of five kinds, and
// each kind has its own motion so the animation says what just happened:
//   push    – drilling deeper (search → word). New page arrives from the right.
//   pop     – coming back out (word → home). Mirror of push.
//   side    – hopping between peer sections (Home / Salvos / Perfil). A short
//             sideways slide in the direction of the nav order, like tabs.
//   replace – same kind of page, new content (word → another word). No
//             horizontal travel, just a soft rise.
//   arrive  – finishing onboarding. A calm fade-and-settle into Home.

export type PageKind = "push" | "pop" | "side" | "replace" | "arrive"
export interface PageMotion {
  kind: PageKind
  dir: number
}

export interface PageSlot {
  type: string
  mobileTab?: "pesquisar" | "salvos" | "perfil"
  onboarding?: boolean
}

const isWord = (t: string) => t === "definition" || t === "notfound"

const DESKTOP_ORDER: Record<string, number> = {
  home: 0,
  preferences: 0,
  tutorial: 1,
  favorites: 2,
  profile: 3,
}

function mobileOrder(s: PageSlot) {
  if (s.type === "favorites") return 1
  if (s.type === "home" && s.mobileTab === "perfil") return 2
  return 0
}

function order(s: PageSlot, isMobile: boolean) {
  if (isWord(s.type)) return 0
  return isMobile ? mobileOrder(s) : (DESKTOP_ORDER[s.type] ?? 0)
}

export function motionBetween(
  from: PageSlot,
  to: PageSlot,
  isMobile: boolean,
): PageMotion {
  const fromWord = isWord(from.type)
  const toWord = isWord(to.type)

  if (fromWord && toWord) return { kind: "replace", dir: 0 }
  if (toWord) return { kind: "push", dir: 1 }

  if (from.type === "preferences" && to.type === "tutorial") {
    return { kind: "push", dir: 1 }
  }
  if (to.type === "preferences") return { kind: "push", dir: 1 }
  if (from.onboarding && from.type === "tutorial" && to.type === "home") {
    return { kind: "arrive", dir: 0 }
  }

  if (fromWord && to.type === "home" && to.mobileTab !== "perfil") {
    return { kind: "pop", dir: -1 }
  }

  if (isMobile && to.type === "tutorial") return { kind: "push", dir: 1 }
  if (isMobile && from.type === "tutorial") return { kind: "pop", dir: -1 }

  const d = Math.sign(order(to, isMobile) - order(from, isMobile)) || 1
  return { kind: "side", dir: d }
}

const ENTER = [0.22, 1, 0.36, 1] as const
const LEAVE = [0.4, 0, 1, 1] as const

export const pageVariants = {
  enter: ({ kind, dir }: PageMotion) => {
    switch (kind) {
      case "push":
      case "pop":
        return { opacity: 0, x: dir * 36, y: 0, scale: 1 }
      case "side":
        return { opacity: 0, x: dir * 18, y: 0, scale: 1 }
      case "arrive":
        return { opacity: 0, x: 0, y: 6, scale: 0.985 }
      default:
        return { opacity: 0, x: 0, y: 8, scale: 1 }
    }
  },
  center: ({ kind }: PageMotion) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration:
        kind === "push" || kind === "pop"
          ? 0.44
          : kind === "arrive"
            ? 0.55
            : kind === "side"
              ? 0.36
              : 0.3,
      ease: ENTER,
    },
  }),
  exit: ({ kind, dir }: PageMotion) => {
    const out =
      kind === "push" || kind === "pop"
        ? { opacity: 0, x: dir * -20, y: 0, scale: 1 }
        : kind === "side"
          ? { opacity: 0, x: dir * -12, y: 0, scale: 1 }
          : { opacity: 0, x: 0, y: 0, scale: 1 }
    return {
      ...out,
      transition: { duration: kind === "push" || kind === "pop" ? 0.13 : 0.1, ease: LEAVE },
    }
  },
}

// Moving between dictionaries: content slides the way the tabs are ordered,
// so the new source arrives from the side the user just pointed at.
export const dictVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.34, ease: ENTER },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -18,
    transition: { duration: 0.12, ease: LEAVE },
  }),
}
