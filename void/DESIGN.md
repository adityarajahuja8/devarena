---
name: Void
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#ffafd3'
  on-tertiary: '#620040'
  tertiary-container: '#e364a7'
  on-tertiary-container: '#560038'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffd8e7'
  tertiary-fixed-dim: '#ffafd3'
  on-tertiary-fixed: '#3d0026'
  on-tertiary-fixed-variant: '#85145a'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display:
    fontFamily: Geist
    fontSize: 80px
    fontWeight: '800'
    lineHeight: 100%
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 110%
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 120%
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 130%
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 160%
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 160%
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 100%
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 100%
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  unit: 8px
---

## Brand & Style

This design system is built on the concept of the "Deep Space" or "Void" aesthetic. It targets a highly technical, forward-thinking audience of developers and creators participating in futuristic hackathons. The emotional response is one of immersion, high-performance, and discovery.

The style is a hybrid of **Minimalism** and **Glassmorphism**, set against an infinite dark canvas. It utilizes heavy background blurs, ultra-thin high-contrast borders, and vibrant gradients to simulate light-emitting interfaces in a vacuum. Visual hierarchy is established through "light-pollution"—where interactive elements glow and inactive elements recede into the darkness.

## Colors

The palette is anchored by a true black `#030303` background. Brand identity is expressed through a "Spectrum Gradient" ranging from Deep Violet to Electric Blue.

- **Primary Gradient:** A linear blend from `#8B5CF6` (Violet) to `#0EA5E9` (Blue).
- **Surface Strategy:** Backgrounds use pure black. Elevated "Glass" layers use a semi-transparent surface (`rgba(10, 10, 10, 0.6)`) with a high-saturation background blur.
- **Accents:** Use Tertiary (`#F472B6`) sparingly for high-priority notifications or critical feedback loops.
- **Gradients:** Subtle mesh gradients should be layered behind glass cards using 20% opacity of the Primary and Secondary colors to create depth.

## Typography

The system uses **Geist** for its clinical precision and high-contrast impact. Headlines are set with tight tracking and aggressive weights to mimic terminal-style dominance. 

**JetBrains Mono** is utilized for functional labels, metadata, and status indicators to reinforce the developer-centric nature of the platform. All "Label" roles should be set in uppercase with increased letter spacing for maximum legibility against dark, blurred backgrounds.

## Layout & Spacing

This design system employs a **Fluid Grid** model with high internal padding within glass containers. 

- **Desktop:** 12-column grid, 24px gutters, 64px side margins. 
- **Tablet:** 8-column grid, 20px gutters, 32px side margins.
- **Mobile:** 4-column grid, 16px gutters, 20px side margins.

Spacing follows an 8px base unit. Component-to-component spacing should be generous (typically `unit * 8` or 64px) to allow the "Void" background to breathe and reduce visual noise.

## Elevation & Depth

Hierarchy is defined by **Glassmorphism** and opacity rather than traditional shadows.

1.  **Level 0 (Background):** Pure `#030303`. May contain subtle, non-interactive mesh gradients.
2.  **Level 1 (Cards/Containers):** `backdrop-filter: blur(40px)`. Background: `rgba(255, 255, 255, 0.03)`. Border: `1px solid rgba(255, 255, 255, 0.08)`.
3.  **Level 2 (Modals/Popovers):** `backdrop-filter: blur(64px)`. Background: `rgba(255, 255, 255, 0.06)`. Border: `1px solid rgba(255, 255, 255, 0.15)`.

Interactive elements use a "Tonal Glow"—a soft outer drop shadow using the primary violet color at 20% opacity to indicate focus or active state.

## Shapes

The design system uses **Rounded** geometry (`0.5rem` base) to contrast with the sharp, technical typography. Large containers like cards and sections should use `rounded-xl` (`1.5rem`) to create a soft, protective feel for the "content pods" floating in the void. Segmented selectors and buttons utilize the pill-shape for high-affordance interactivity.

## Components

### Buttons
- **Primary:** Full gradient background (Violet to Blue), white text, pill-shaped. Hover state adds a 15px primary-color outer glow.
- **Secondary:** Transparent background, 1px white border at 20% opacity. Text is white.
- **Ghost:** No background or border. Primary color text.

### Glass Cards
Standard containers for hackathon projects or user profiles. Must include a `1px` top-weighted border (linear gradient from `white` at 20% to `white` at 0%) to simulate a light source from above.

### Form Fields
Dark backgrounds (`#0A0A0A`) with `1px` borders. On focus, the border transitions to the primary gradient, and a subtle inner glow is applied. Labels use the `label-sm` monospaced style.

### Segmented Pill Selectors
A container with `rounded-full` and a dark background. The "Active" state is a glass-morphic pill that slides behind the text labels, featuring a 1px border and subtle blur.

### Notification Banners
Floating glass elements at the top of the viewport. Use a left-side accent bar (4px width) in primary (info), green (success), or red (error).

### Chips/Tags
Small, pill-shaped badges with `rgba(255, 255, 255, 0.05)` backgrounds and monospaced text.