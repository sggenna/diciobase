import { ProfilePage } from "@/components/profile/ProfilePage"
import type { useMobileProfileState } from "@/lib/hooks"

export function MobileProfilePage({
  state,
  onLogout,
  onTutorial,
}: {
  state: ReturnType<typeof useMobileProfileState>
  onLogout: () => void
  onTutorial: () => void
}) {
  return (
    <ProfilePage compact state={state} onLogout={onLogout} onTutorial={onTutorial} />
  )
}
