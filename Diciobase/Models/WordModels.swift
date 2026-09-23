import Foundation

struct Sense: Identifiable {
    let num: String
    let text: String
    var labels: [String] = []
    var subsenses: [Subsense] = []
    var examples: [String] = []

    var id: String { num }

    struct Subsense: Identifiable {
        let num: String
        let text: String
        var id: String { num }
    }
}

struct DictEntry: Identifiable {
    let id: String
    let name: String
    let shortName: String
    let tag: String
    var etymology: String?
    let senses: [Sense]
    var notes: [String] = []
    var synonyms: [String] = []
    var related: [String] = []
}

struct Fact: Identifiable {
    let label: String
    let value: String
    var id: String { label }
}

struct WordData {
    let word: String
    let partOfSpeech: String
    let phonetic: String
    var gender: String?
    let dicts: [DictEntry]
    let synonyms: [String]
    let facts: [Fact]
}
