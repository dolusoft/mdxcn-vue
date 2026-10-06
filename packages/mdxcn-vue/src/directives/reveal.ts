import type { ObjectDirective } from 'vue'

export interface RevealOptions {
  /** Target opacity; defaults to the element's computed opacity. */
  opacity?: number
  /** Delay in milliseconds, including any per-item stagger. */
  delay?: number
  rootMargin?: string
}

interface RevealState {
  options: RevealOptions
  observer?: IntersectionObserver
  animation?: Animation
  media: MediaQueryList
  pending: boolean
  opacity: string
  transform: string
  target: string
  baseTransform: string
  onChange: () => void
}

const states = new WeakMap<HTMLElement, RevealState>()

function show(element: HTMLElement, state: RevealState) {
  state.pending = false
  element.style.opacity =
    state.options.opacity == null ? state.opacity : String(state.options.opacity)
  element.style.transform = state.transform
  state.observer?.disconnect()
}

function cleanup(element: HTMLElement) {
  const state = states.get(element)
  if (!state) return
  show(element, state)
  state.animation?.cancel()
  state.media.removeEventListener('change', state.onChange)
  states.delete(element)
}

export const vReveal: ObjectDirective<HTMLElement, RevealOptions | undefined> = {
  mounted(element, binding) {
    const options = binding.value ?? {}
    if (options.opacity != null) element.style.opacity = String(options.opacity)
    if (
      typeof IntersectionObserver === 'undefined' ||
      typeof element.animate !== 'function' ||
      typeof window.matchMedia !== 'function'
    )
      return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return
    // Content already visible in the initial viewport must not flash on hydration.
    const rect = element.getBoundingClientRect()
    if (
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth
    )
      return
    const computed = window.getComputedStyle(element)
    const state: RevealState = {
      options,
      media,
      pending: true,
      opacity: element.style.opacity,
      transform: element.style.transform,
      target: options.opacity == null ? computed.opacity || '1' : String(options.opacity),
      baseTransform: computed.transform === 'none' ? '' : computed.transform,
      onChange: () => {
        if (!media.matches) return
        show(element, state)
        state.animation?.cancel()
        state.animation = undefined
      },
    }
    states.set(element, state)
    try {
      state.observer = new IntersectionObserver(
        (entries) => {
          if (!state.pending || !entries.some((entry) => entry.isIntersecting)) return
          const target =
            state.options.opacity == null ? state.target : String(state.options.opacity)
          show(element, state)
          if (media.matches) return
          try {
            const animation = element.animate(
              [
                { opacity: 0, transform: `${state.baseTransform} translateY(8px)`.trim() },
                { opacity: target, transform: state.baseTransform || 'none' },
              ],
              {
                duration: 220,
                easing: 'cubic-bezier(.215,.61,.355,1)',
                delay: state.options.delay ?? 0,
                fill: 'backwards',
              },
            )
            state.animation = animation
            animation.onfinish = () => {
              animation.cancel()
              state.animation = undefined
            }
          } catch {
            show(element, state)
          }
        },
        { threshold: 0, rootMargin: options.rootMargin ?? '0px 0px -24px 0px' },
      )
      state.observer.observe(element)
      media.addEventListener('change', state.onChange)
      // Only a successfully observed element may be hidden.
      element.style.opacity = '0'
      element.style.transform = `${state.baseTransform} translateY(8px)`.trim()
    } catch {
      cleanup(element)
    }
  },
  updated(element, binding) {
    const state = states.get(element)
    if (state) {
      state.options = binding.value ?? {}
      if (!state.pending) show(element, state)
    } else if (binding.value?.opacity != null) element.style.opacity = String(binding.value.opacity)
  },
  unmounted: cleanup,
  // No SSR style is generated. Content remains visible without client JS.
  getSSRProps: () => ({}),
}
