import { useState, useEffect } from "react";
import { ProfilePanel } from "@/lib/types";

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mobile;
}

export function useFade(dep: unknown) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setVis(false);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setVis(true)));
    return () => cancelAnimationFrame(t);
  }, [dep]);
  return vis;
}

export function useMobileProfileState() {
  const [panel, setPanel] = useState<ProfilePanel>("main");
  const [name, setName] = useState("Maria Silva");
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>();
  const [notifs, setNotifs] = useState(true);
  const [dictToggles, setDictToggles] = useState({ aurelio: true, houaiss: true, michaelis: false });
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [nameEdit, setNameEdit] = useState(name);
  return { panel, setPanel, name, setName, avatarSrc, setAvatarSrc, notifs, setNotifs, dictToggles, setDictToggles, pwCurrent, setPwCurrent, pwNew, setPwNew, pwConfirm, setPwConfirm, pwSaved, setPwSaved, nameEdit, setNameEdit };
}
