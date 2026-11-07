// Sharing a link: the system share sheet where there is one, the clipboard otherwise.

export type ShareOutcome = "shared" | "cancelled" | "copied" | "failed"

/** For browsers without the Clipboard API, or on plain http, where it isn't exposed. */
function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.opacity = "0"
  document.body.appendChild(area)
  area.select()
  try {
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    area.remove()
  }
}

export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return legacyCopy(url)
  }
}

/**
 * Only a title and the URL go to the sheet: Messages and others send any `text`
 * as a separate message beside the link, which breaks up the rich preview.
 */
export async function shareLink({ title, url }: { title: string; url: string }): Promise<ShareOutcome> {
  const data = { title, url }
  if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data)
      return "shared"
    } catch (e) {
      const name = (e as Error).name
      // The person closed the sheet, or it's already open: not a failure, and nothing to copy.
      if (name === "AbortError" || name === "InvalidStateError") return "cancelled"
      // NotAllowedError and the like (blocked by policy, no sheet on this device): fall through.
    }
  }
  return (await copyLink(url)) ? "copied" : "failed"
}
