import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type BreakpointKey = "mobile" | "tablet" | "desktop";
type AnimationName =
  | "fade"
  | "fade-left"
  | "fade-right"
  | "fade-up"
  | "fade-down"
  | "lines"
  | "none";
type ActiveAnimationName = Exclude<AnimationName, "none">;

type AnimationPreset = {
  name: ActiveAnimationName;
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  splitText?: boolean;
  stagger?: number;
  batchMax?: number;
  trigger?: Partial<ScrollTrigger.Vars>;
};

type BreakpointPresetMap = Record<ActiveAnimationName, AnimationPreset>;

type SiteAnimationConfig = {
  breakpoints: Record<BreakpointKey, string>;
  manualSelector: string;
  readyAttribute: string;
  scrollTriggerDefaults: Partial<ScrollTrigger.Vars>;
  presets: Record<BreakpointKey, BreakpointPresetMap>;
};

type AnimatableElement = HTMLElement & {
  dataset: DOMStringMap & {
    animate?: AnimationName;
    animateMobile?: AnimationName;
    animateTablet?: AnimationName;
    animateDesktop?: AnimationName;
  };
};

type LenisLike = {
  on?: (event: string, callback: () => void) => void;
  off?: (event: string, callback: () => void) => void;
};

declare global {
  interface Window {
    __PROPLUMB_LENIS__?: LenisLike;
  }
}

// We only need to remember original HTML for elements that use line-splitting.
const originalMarkup = new WeakMap<HTMLElement, string>();

let activeMatchMedia: gsap.MatchMedia | null = null;
let lenisCleanup: (() => void) | null = null;
let motionPreferenceBound = false;
let layoutRefreshBound = false;

export const ANIMATION_ENABLED = true;
export const ANIMATION_RETRIGGER_ON_SCROLL = true;

export const SITE_ANIMATION_CONFIG: SiteAnimationConfig = {
  breakpoints: {
    mobile: "(max-width: 767px)",
    tablet: "(min-width: 768px) and (max-width: 1023px)",
    desktop: "(min-width: 1024px)",
  },
  manualSelector:
    "[data-animate], [data-animate-mobile], [data-animate-tablet], [data-animate-desktop], .animate-fade-left, .animate-fade-right, .animate-fade-up, .animate-fade-down, .animate-lines",
  readyAttribute: "data-animated-ready",
  scrollTriggerDefaults: {
    start: "top 96%",
    once: true,
    invalidateOnRefresh: true,
  },
  presets: {
    mobile: {
      fade: {
        name: "fade",
        from: { autoAlpha: 0, y: 8 },
        to: { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
        batchMax: 6,
      },
      "fade-left": {
        name: "fade-left",
        from: { autoAlpha: 0, x: -88 },
        to: { autoAlpha: 1, x: 0, duration: 1.1, ease: "power3.out" },
        batchMax: 6,
      },
      "fade-right": {
        name: "fade-right",
        from: { autoAlpha: 0, x: 88 },
        to: { autoAlpha: 1, x: 0, duration: 1.1, ease: "power3.out" },
        batchMax: 6,
      },
      "fade-up": {
        name: "fade-up",
        from: { autoAlpha: 0, y: 88 },
        to: { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out" },
        batchMax: 6,
      },
      "fade-down": {
        name: "fade-down",
        from: { autoAlpha: 0, y: -88 },
        to: { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out" },
        batchMax: 6,
      },
      lines: {
        name: "lines",
        from: { autoAlpha: 0, y: 10 },
        to: { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
        splitText: false,
      },
    },
    tablet: {
      fade: {
        name: "fade",
        from: { autoAlpha: 0, y: 12 },
        to: { autoAlpha: 1, y: 0, duration: 0.58, ease: "power2.out" },
        batchMax: 8,
      },
      "fade-left": {
        name: "fade-left",
        from: { autoAlpha: 0, x: -64 },
        to: { autoAlpha: 1, x: 0, duration: 0.95, ease: "power3.out" },
        batchMax: 8,
      },
      "fade-right": {
        name: "fade-right",
        from: { autoAlpha: 0, x: 64 },
        to: { autoAlpha: 1, x: 0, duration: 0.95, ease: "power3.out" },
        batchMax: 8,
      },
      "fade-up": {
        name: "fade-up",
        from: { autoAlpha: 0, y: 64 },
        to: { autoAlpha: 1, y: 0, duration: 0.95, ease: "power3.out" },
        batchMax: 8,
      },
      "fade-down": {
        name: "fade-down",
        from: { autoAlpha: 0, y: -64 },
        to: { autoAlpha: 1, y: 0, duration: 0.95, ease: "power3.out" },
        batchMax: 8,
      },
      lines: {
        name: "lines",
        from: { autoAlpha: 0, y: 14 },
        to: { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" },
        splitText: false,
      },
    },
    desktop: {
      fade: {
        name: "fade",
        from: { autoAlpha: 0, y: 14 },
        to: { autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out" },
        batchMax: 10,
      },
      "fade-left": {
        name: "fade-left",
        from: { autoAlpha: 0, x: -80 },
        to: { autoAlpha: 1, x: 0, duration: 1.05, ease: "power3.out" },
        batchMax: 10,
      },
      "fade-right": {
        name: "fade-right",
        from: { autoAlpha: 0, x: 80 },
        to: { autoAlpha: 1, x: 0, duration: 1.05, ease: "power3.out" },
        batchMax: 10,
      },
      "fade-up": {
        name: "fade-up",
        from: { autoAlpha: 0, y: 80 },
        to: { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out" },
        batchMax: 10,
      },
      "fade-down": {
        name: "fade-down",
        from: { autoAlpha: 0, y: -80 },
        to: { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out" },
        batchMax: 10,
      },
      lines: {
        name: "lines",
        from: { autoAlpha: 0, yPercent: 35 },
        to: { autoAlpha: 1, yPercent: 0, duration: 0.72, ease: "power3.out" },
        splitText: true,
        stagger: 0.08,
      },
    },
  },
};

const motionQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function getBreakpointOverride(
  element: AnimatableElement,
  breakpoint: BreakpointKey,
) {
  return {
    mobile: element.dataset.animateMobile,
    tablet: element.dataset.animateTablet,
    desktop: element.dataset.animateDesktop,
  }[breakpoint];
}

function bindMotionPreferenceListener() {
  if (!motionQuery || motionPreferenceBound) return;

  // Rebuild the animation state when the user's motion preference changes.
  motionQuery.addEventListener("change", () => {
    if (motionQuery.matches) {
      destroySiteAnimations();
      return;
    }

    initSiteAnimations();
  });

  motionPreferenceBound = true;
}

function resolveAnimationName(
  element: AnimatableElement,
  breakpoint: BreakpointKey,
): AnimationName {
  const breakpointOverride = getBreakpointOverride(element, breakpoint);

  return (
    breakpointOverride ??
    element.dataset.animate ??
    getClassAnimationName(element) ??
    "none"
  );
}

function getClassAnimationName(
  element: AnimatableElement,
): AnimationName | null {
  if (element.classList.contains("animate-fade-left")) {
    return "fade-left";
  }

  if (element.classList.contains("animate-fade-right")) {
    return "fade-right";
  }

  if (element.classList.contains("animate-fade-up")) {
    return "fade-up";
  }

  if (element.classList.contains("animate-fade-down")) {
    return "fade-down";
  }

  if (element.classList.contains("animate-lines")) {
    return "lines";
  }

  return null;
}

function getAnimatableElements(): AnimatableElement[] {
  return Array.from(
    document.querySelectorAll<AnimatableElement>(
      SITE_ANIMATION_CONFIG.manualSelector,
    ),
  );
}

function restoreSplitElement(element: HTMLElement) {
  const originalHtml = originalMarkup.get(element);
  if (!originalHtml) return;

  element.innerHTML = originalHtml;
  element.removeAttribute(SITE_ANIMATION_CONFIG.readyAttribute);
}

function restoreAllSplitElements() {
  getAnimatableElements().forEach((element) => restoreSplitElement(element));
}

function splitElementIntoLines(element: HTMLElement): HTMLElement[] {
  if (!originalMarkup.has(element)) {
    originalMarkup.set(element, element.innerHTML);
  }

  if (!element.hasAttribute(SITE_ANIMATION_CONFIG.readyAttribute)) {
    const source = originalMarkup.get(element) ?? element.innerHTML;
    const fragments = source
      .split(/<br\s*\/?>/gi)
      .map((fragment) => fragment.trim())
      .filter(Boolean);

    if (fragments.length === 0) {
      return [];
    }

    element.innerHTML = "";

    fragments.forEach((fragment) => {
      // The outer mask clips the reveal. The inner node is what GSAP animates.
      const lineMask = document.createElement("div");
      const descenderBuffer = "0.18em";
      lineMask.style.overflow = "hidden";
      lineMask.style.display = "block";
      lineMask.style.lineHeight = "inherit";
      lineMask.style.paddingBottom = descenderBuffer;
      lineMask.style.marginBottom = `-${descenderBuffer}`;

      const lineInner = document.createElement("div");
      lineInner.innerHTML = fragment;
      lineInner.style.display = "block";
      lineInner.style.willChange = "transform, opacity";

      lineMask.appendChild(lineInner);
      element.appendChild(lineMask);
    });

    element.setAttribute(SITE_ANIMATION_CONFIG.readyAttribute, "true");
  }

  return Array.from(element.children)
    .map((child) => child.firstElementChild)
    .filter((child): child is HTMLElement => child instanceof HTMLElement);
}

function createBatchScrollAnimation(
  elements: HTMLElement[],
  preset: AnimationPreset,
) {
  if (elements.length === 0) return;

  // Set initial state once up-front so ScrollTrigger only handles the reveal.
  gsap.set(elements, {
    ...preset.from,
    willChange: "transform, opacity",
    force3D: true,
  });

  ScrollTrigger.batch(elements, {
    ...SITE_ANIMATION_CONFIG.scrollTriggerDefaults,
    ...(preset.trigger ?? {}),
    batchMax: preset.batchMax ?? elements.length,
    onEnter: (batch) => revealElements(batch, preset),
    ...(shouldRetriggerOnScroll(preset)
      ? {
          onEnterBack: (batch) => revealElements(batch, preset),
          onLeave: (batch) => resetElements(batch, preset),
          onLeaveBack: (batch) => resetElements(batch, preset),
        }
      : {}),
  });
}

function shouldRetriggerOnScroll(preset: AnimationPreset) {
  const once =
    preset.trigger?.once ?? SITE_ANIMATION_CONFIG.scrollTriggerDefaults.once;

  return ANIMATION_RETRIGGER_ON_SCROLL && once !== true;
}

function revealElements(elements: Element[], preset: AnimationPreset) {
  gsap.to(elements, {
    ...preset.to,
    overwrite: "auto",
    stagger: (index, target) =>
      getRevealDelay(target as HTMLElement) + index * 0.08,
    clearProps: "will-change,transform,opacity,visibility",
  });
}

function resetElements(elements: Element[], preset: AnimationPreset) {
  gsap.set(elements, {
    ...preset.from,
    willChange: "transform, opacity",
    force3D: true,
  });
}

function getRevealDelay(element: HTMLElement) {
  const delay = getComputedStyle(element)
    .getPropertyValue("--reveal-delay")
    .trim();
  if (!delay) return 0;

  if (delay.endsWith("ms")) {
    return Number.parseFloat(delay) / 1000;
  }

  if (delay.endsWith("s")) {
    return Number.parseFloat(delay);
  }

  return Number.parseFloat(delay) || 0;
}

function createLinesAnimation(element: HTMLElement, preset: AnimationPreset) {
  const targets = preset.splitText ? splitElementIntoLines(element) : [element];
  if (targets.length === 0) return;

  gsap.set(targets, {
    ...preset.from,
    willChange: "transform, opacity",
    force3D: true,
  });

  const revealTargets = () => {
    gsap.to(targets, {
      ...preset.to,
      delay: getRevealDelay(element),
      overwrite: "auto",
      stagger: preset.stagger ?? 0,
      clearProps: "will-change,transform,opacity,visibility",
    });
  };

  if (shouldRetriggerOnScroll(preset)) {
    ScrollTrigger.create({
      trigger: element,
      ...SITE_ANIMATION_CONFIG.scrollTriggerDefaults,
      ...(preset.trigger ?? {}),
      onEnter: revealTargets,
      onEnterBack: revealTargets,
      onLeave: () => resetElements(targets, preset),
      onLeaveBack: () => resetElements(targets, preset),
    });
    return;
  }

  gsap.to(targets, {
    ...preset.to,
    delay: getRevealDelay(element),
    overwrite: "auto",
    stagger: preset.stagger ?? 0,
    clearProps: "will-change,transform,opacity,visibility",
    scrollTrigger: {
      trigger: element,
      ...SITE_ANIMATION_CONFIG.scrollTriggerDefaults,
      ...(preset.trigger ?? {}),
    },
  });
}

function syncLenisWithScrollTrigger() {
  if (lenisCleanup) {
    lenisCleanup();
    lenisCleanup = null;
  }

  const lenis = window.__PROPLUMB_LENIS__;
  if (!lenis?.on) return;

  // Lenis owns scroll timing, so ScrollTrigger needs to update alongside it.
  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  lenisCleanup = () => {
    lenis.off?.("scroll", onScroll);
  };
}

function bindLayoutRefresh() {
  if (layoutRefreshBound) return;

  const refresh = () => {
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  window.addEventListener("load", refresh, { once: true });
  document.fonts?.ready.then(refresh).catch(() => undefined);

  layoutRefreshBound = true;
}

function applyAnimationsForBreakpoint(breakpoint: BreakpointKey) {
  const fadeElements: HTMLElement[] = [];
  const fadeLeftElements: HTMLElement[] = [];
  const fadeRightElements: HTMLElement[] = [];
  const fadeUpElements: HTMLElement[] = [];
  const fadeDownElements: HTMLElement[] = [];
  const breakpointPresets = SITE_ANIMATION_CONFIG.presets[breakpoint];

  getAnimatableElements().forEach((element) => {
    const animationName = resolveAnimationName(element, breakpoint);

    // Breakpoint changes can switch an element between split and non-split
    // modes, so we always restore before deciding how to animate it again.
    restoreSplitElement(element);

    if (animationName === "none") {
      gsap.set(element, { clearProps: "all" });
      return;
    }

    if (animationName === "fade") {
      fadeElements.push(element);
      return;
    }

    if (animationName === "fade-left") {
      fadeLeftElements.push(element);
      return;
    }

    if (animationName === "fade-right") {
      fadeRightElements.push(element);
      return;
    }

    if (animationName === "fade-up") {
      fadeUpElements.push(element);
      return;
    }

    if (animationName === "fade-down") {
      fadeDownElements.push(element);
      return;
    }

    createLinesAnimation(element, breakpointPresets.lines);
  });

  createBatchScrollAnimation(fadeElements, breakpointPresets.fade);
  createBatchScrollAnimation(fadeLeftElements, breakpointPresets["fade-left"]);
  createBatchScrollAnimation(
    fadeRightElements,
    breakpointPresets["fade-right"],
  );
  createBatchScrollAnimation(fadeUpElements, breakpointPresets["fade-up"]);
  createBatchScrollAnimation(fadeDownElements, breakpointPresets["fade-down"]);
}

export function destroySiteAnimations() {
  activeMatchMedia?.revert();
  activeMatchMedia = null;
  restoreAllSplitElements();
  lenisCleanup?.();
  lenisCleanup = null;
}

export function initSiteAnimations() {
  bindMotionPreferenceListener();
  destroySiteAnimations();

  // Reduced-motion should always win over the project-level toggle.
  if (!ANIMATION_ENABLED || motionQuery?.matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  syncLenisWithScrollTrigger();
  bindLayoutRefresh();

  activeMatchMedia = gsap.matchMedia();

  activeMatchMedia.add(SITE_ANIMATION_CONFIG.breakpoints.mobile, () => {
    applyAnimationsForBreakpoint("mobile");
  });

  activeMatchMedia.add(SITE_ANIMATION_CONFIG.breakpoints.tablet, () => {
    applyAnimationsForBreakpoint("tablet");
  });

  activeMatchMedia.add(SITE_ANIMATION_CONFIG.breakpoints.desktop, () => {
    applyAnimationsForBreakpoint("desktop");
  });

  ScrollTrigger.refresh();
}
