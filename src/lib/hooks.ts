import { useState, useEffect } from "react"
import { ProfilePanel } from "@/lib/types"

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const h = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])
  return mobile
}

/** Desktop layout (Tailwind's lg): the word page moves its etymology into the side column there. */
export function useIsWide() {
  const [wide, setWide] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const h = (e: MediaQueryListEvent) => setWide(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])
  return wide
}

export function useMobileProfileState() {
  const [panel, setPanel] = useState<ProfilePanel>("main")
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>()
  const [pwCurrent, setPwCurrent] = useState("")
  const [pwNew, setPwNew] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")
  const [nameEdit, setNameEdit] = useState("")
  return {
    panel,
    setPanel,
    avatarSrc,
    setAvatarSrc,
    pwCurrent,
    setPwCurrent,
    pwNew,
    setPwNew,
    pwConfirm,
    setPwConfirm,
    nameEdit,
    setNameEdit,
  }
}
