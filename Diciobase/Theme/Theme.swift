import SwiftUI

/// Color tokens ported from the web app's Tailwind classes / inline hex values.
enum AppColor {
    static let background = Color(hex: "#FBF9F6")
    static let ink = Color(hex: "#1C1B19")
    static let subtleText = Color(hex: "#8C8A82")
    static let bodyText = Color(hex: "#4A4742")
    static let border = Color(hex: "#E0DDD6")
    static let borderSoft = Color(hex: "#EFECE6")
    static let chipFill = Color(hex: "#EFECE6")
    static let placeholder = Color(hex: "#C0BCB4")

    static let aurelio = Color(hex: "#3D6647")
    static let houaiss = Color(hex: "#24456B")
    static let michaelis = Color(hex: "#7A6520")

    static func dictColor(_ id: String) -> Color {
        switch id {
        case "aurelio": return aurelio
        case "houaiss": return houaiss
        case "michaelis": return michaelis
        default: return .black
        }
    }
}

/// The "P" (light) profile palette from profileTheme.ts.
enum ProfileLight {
    static let background = Color.white
    static let card = Color(hex: "#F5F2EB")
    static let border = Color.black.opacity(0.07)
    static let borderMid = Color.black.opacity(0.12)
    static let text = Color(hex: "#1C1B19")
    static let sub = Color.black.opacity(0.42)
    static let icon = Color.black.opacity(0.50)
    static let danger = Color(hex: "#D04030")
    static let dangerBg = Color(hex: "#D04030").opacity(0.08)
    static let avatarBg = Color(hex: "#E4E0D8")
    static let inputBg = Color(hex: "#F5F2EB")
    static let successBg = Color(hex: "#3D6647").opacity(0.10)
    static let successBorder = Color(hex: "#3D6647").opacity(0.30)
    static let successText = Color(hex: "#3D6647")
}

/// The "MC" (dark) menu-card palette from profileTheme.ts.
enum ProfileDark {
    static let background = Color(hex: "#1A1917")
    static let row = Color.white.opacity(0.04)
    static let border = Color.white.opacity(0.08)
    static let text = Color(hex: "#F5F2EB")
    static let sub = Color.white.opacity(0.42)
    static let iconBg = Color.white.opacity(0.10)
    static let danger = Color(hex: "#E05C4B")
    static let dangerBg = Color(hex: "#E05C4B").opacity(0.14)
}

/// Font helper standing in for the design's Poppins family. Poppins isn't
/// bundled with this scaffold (no font files were part of the export) — add
/// the .ttf/.otf files to the project and register them under
/// `UIAppFonts` in Info.plist, then swap these `.system` calls for
/// `.custom("Poppins-...", size:)` to match the original design exactly.
enum AppFont {
    static func regular(_ size: CGFloat) -> Font { .system(size: size, weight: .regular) }
    static func medium(_ size: CGFloat) -> Font { .system(size: size, weight: .medium) }
    static func semibold(_ size: CGFloat) -> Font { .system(size: size, weight: .semibold) }
    static func bold(_ size: CGFloat) -> Font { .system(size: size, weight: .bold) }
    static func extraBold(_ size: CGFloat) -> Font { .system(size: size, weight: .heavy) }
    static func italic(_ size: CGFloat) -> Font { .system(size: size, weight: .regular).italic() }
}

extension Color {
    init(hex: String) {
        var hexString = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexString = hexString.replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: hexString).scanHexInt64(&rgb)
        let r = Double((rgb >> 16) & 0xFF) / 255
        let g = Double((rgb >> 8) & 0xFF) / 255
        let b = Double(rgb & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
