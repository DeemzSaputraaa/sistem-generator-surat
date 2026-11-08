export function useModalFocus() {
  let previous: HTMLElement | null = null
  let dialog: HTMLElement | null = null
  function trap(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !dialog) return
    const items = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length > 0 && !el.closest('fieldset:disabled'))
    const first = items[0], last = items.at(-1)
    if (!first) { event.preventDefault(); dialog.focus(); return }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  onMounted(() => {
    previous = document.activeElement as HTMLElement
    dialog = document.querySelector('[role="dialog"]')
    dialog?.setAttribute('tabindex', '-1')
    dialog?.querySelector<HTMLElement>('button')?.focus()
    document.addEventListener('keydown', trap)
    document.body.style.overflow = 'hidden'
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', trap)
    document.body.style.overflow = ''
    previous?.focus()
  })
}
