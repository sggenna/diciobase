// What we measure, in one place. Counts only: nothing a person typed or saved leaves the browser, because a
// search box can hold anything. The dictionary's id is the only detail any event carries.
import { track as vercelTrack, type BeforeSend } from "@vercel/analytics/react"

type Events = {
  word_view: undefined
  search_no_result: undefined
  dictionary_switch: { dictionary: string }
  estrutura_open: undefined
  word_save: undefined
  citation_copy: { dictionary: string }
}

export function track<E extends keyof Events>(event: E, ...props: Events[E] extends undefined ? [] : [Events[E]]) {
  vercelTrack(event, props[0])
}

/** A page's address can contain the word someone searched for, so only the page's kind is reported. */
export const withoutWords: BeforeSend = (event) => {
  const url = new URL(event.url)
  const [page, detail] = url.pathname.split("/").filter(Boolean)
  url.search = ""
  url.hash = ""
  url.pathname = detail ? `/${page}/[palavra]` : page ? `/${page}` : "/"
  return { ...event, url: url.toString() }
}
