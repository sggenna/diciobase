import { P } from "@/components/profile/profileTheme";

export function AvatarBubble({ size = 80, initials = "M", src }: { size?: number; initials?: string; src?: string }) {
  return src ? (
    <img src={src} alt="avatar" className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: P.avatarBg }}>
      <span style={{ fontFamily: "'Poppins:Bold'", fontSize: size * 0.34, color: P.text }}>
        {initials}
      </span>
    </div>
  );
}
