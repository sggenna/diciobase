import { ProfileBackBtn } from "@/components/profile/ProfileBackBtn";
import { P } from "@/components/profile/profileTheme";

export function ProfileSubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <ProfileBackBtn onClick={onBack} />
      <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 18, color: P.text }}>{title}</span>
    </div>
  );
}
