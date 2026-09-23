import Foundation
import SwiftUI

enum AppTab {
    case pesquisar
    case salvos
    case perfil
}

enum ProfilePanel {
    case main
    case editAvatar
    case editName
    case changePassword
    case notifications
    case terms
    case dicts
}

enum AuthMode {
    case entrar
    case criar
}

/// Mirrors the React app's `View` state machine (App.tsx), scoped to the
/// screens that shipped as the mobile experience.
enum Route: Equatable {
    case auth
    case preferences
    case tutorial
    case home
    case definition(word: String)
    case favorites
    case notFound(word: String)
    case profile
}

struct SavedWord: Identifiable {
    let word: String
    let pos: String
    let snippet: String
    let when: String
    var id: String { word }
}

enum FavoritesFilter: String, CaseIterable {
    case todas = "Todas"
    case substantivos = "Substantivos"
    case adjetivos = "Adjetivos"
}

struct TutorialSlide: Identifiable {
    enum Mockup {
        case search, definition, saved
    }

    let id: String
    let label: String
    let title: String
    let body: String
    let mockup: Mockup
    let accent: Color
}

struct DictionaryInfo: Identifiable {
    let id: String
    let name: String
    let tag: String
    let color: Color
    var description: String? = nil
}

struct TermsSection: Identifiable {
    let title: String
    let body: String
    var id: String { title }
}

struct ProfileMenuRow: Identifiable {
    let label: String
    var sub: String? = nil
    let systemIcon: String
    var badge: Int? = nil
    var danger: Bool = false
    let action: () -> Void
    var id: String { label }
}
