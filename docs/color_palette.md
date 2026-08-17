---
name: Matte Luxury Interface
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e06'
  surface-container-low: '#1f1b13'
  surface-container: '#231f16'
  surface-container-high: '#2d2a20'
  surface-container-highest: '#38342b'
  on-surface: '#eae2d3'
  on-surface-variant: '#d0c6af'
  inverse-surface: '#eae2d3'
  inverse-on-surface: '#343026'
  outline: '#99907b'
  outline-variant: '#4d4635'
  surface-tint: '#e9c340'
  primary: '#e9c340'
  on-primary: '#3c2f00'
  primary-container: '#b8960c'
  on-primary-container: '#3d3000'
  inverse-primary: '#725c00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#b8c4ff'
  on-tertiary: '#09277e'
  tertiary-container: '#7f94ef'
  on-tertiary-container: '#0b287f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe082'
  primary-fixed-dim: '#e9c340'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#564500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c4ff'
  on-tertiary-fixed: '#001454'
  on-tertiary-fixed-variant: '#283f95'
  background: '#16130b'
  on-background: '#eae2d3'
  surface-variant: '#38342b'
typography:
  display:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-end aesthetic studio management, evoking a sense of exclusivity, precision, and calm. The visual language follows a **Minimalist** philosophy with a focus on "Quiet Luxury"—where quality is signaled through deliberate spacing and refined materials rather than decorative excess.

The target audience consists of boutique owners and practitioners who value a professional, clutter-free environment that reflects the premium nature of their services. The interface prioritizes high-contrast legibility against a deep, matte canvas, utilizing gold as a functional highlight rather than a primary fill. This creates a sophisticated digital environment that feels like an extension of a luxury physical studio.

## Colors

The palette is strictly curated to maintain a dark, focused atmosphere. The **Background** (#0A0A0A) provides a deep, void-like base that allows UI elements to appear as if they are part of a seamless surface. **Surface/Card** colors use a slightly lighter matte (#111111) to create subtle tonal separation without relying on heavy shadows.

**Gold** (#B8960C) is reserved for primary actions, success states, and brand highlights. It should be used sparingly to maintain its impact. All interactive elements use the **Primary Hover** (#D4AE1A) to provide a soft, glowing feedback loop. Text utilizes an off-white **Primary Text** (#F0EDE8) to reduce eye strain and a **Muted Text** (#888888) for secondary metadata and labels.

## Typography

This design system employs a three-tier typographic hierarchy to balance editorial elegance with functional utility. 

- **Sora** is used for Headlines and Display styles. Its geometric nature provides a modern, architectural feel that commands attention.
- **Inter** handles all interface and body copy. It is selected for its exceptional legibility at small sizes and its neutral character, ensuring that management tasks remain efficient.
- **JetBrains Mono** is utilized for data-heavy displays, price points, timestamps, and technical labels. This adds a layer of precision and "clinical" accuracy appropriate for a studio environment.

Line heights are generous to promote readability, and tracking is slightly tightened on larger headlines to maintain a cohesive visual block.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop, transitioning to a single-column stack for mobile devices. The rhythm is dictated by a 4px baseline, with 16px (md) being the standard padding for most containers.

To preserve the luxury aesthetic, negative space is used as a structural element. Margins are intentionally wide on desktop (64px+) to center the user's focus on the content. Elements are grouped using logical nesting—related items share an 8px (sm) gap, while distinct sections are separated by 40px (xl) or more. For data-heavy views, the grid should shift to a more compact 8px gutter to maximize information density while maintaining alignment.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Low-Contrast Outlines** and **Tonal Layers**. 

Depth is communicated through the following hierarchy:
1. **Level 0 (Background):** The deepest layer (#0A0A0A).
2. **Level 1 (Cards/Surfaces):** Slightly raised surfaces (#111111) defined by a 1px solid border (#1E1E1E).
3. **Level 2 (Modals/Popovers):** These elements use the same surface color but include a subtle primary-tinted glow (e.g., a 10% opacity gold shadow) to indicate they are floating above the main interface.

Interactive elements do not "lift" on hover; instead, their borders brighten or their background fills shift slightly in tone. This maintains the "matte" physical metaphor of the brand.

## Shapes

The shape language is consistent and disciplined. A **roundedness level of 2 (8px)** is applied to all primary UI components, including cards, input fields, and buttons. This radius provides a soft, approachable feel that counteracts the sharpness of the high-contrast dark theme.

Smaller components like checkboxes or tags maintain this 8px radius, while larger containers (like sidebars or full-page modals) may occasionally use 0px on edges that touch the screen boundary to emphasize their structural role. Avoid fully circular "pill" shapes except for status indicators or notification badges.

## Components

### Buttons
- **Primary:** Gold (#B8960C) background with Black text. 8px border radius. High-impact.
- **Secondary:** Transparent background with 1px border (#1E1E1E). Text is Primary White.
- **Ghost:** No background or border. Used for tertiary actions.

### Input Fields
- **Default State:** Background (#111111), Border (#1E1E1E), Text (#F0EDE8).
- **Focus State:** Border changes to Gold (#B8960C). No outer glow/shadow.
- **Labels:** Use JetBrains Mono at 12px, Muted Text (#888888).

### Cards
- Flat surfaces (#111111) with a 1px solid border (#1E1E1E). 
- Use 24px internal padding for a spacious, luxury feel.
- Card headers should use Sora Medium (18-20px).

### Lists & Tables
- Table headers use JetBrains Mono, uppercase, with Muted Text.
- Row separators use 1px solid (#1E1E1E).
- Hovering a row should change the background to #161616.

### Chips & Badges
- Small, 8px radius.
- Backgrounds should be low-opacity versions of the status color (e.g., 10% Gold for "Pending") with solid text.

### Studio Specifics
- **Calendar Slots:** Use #111111 for empty slots, #B8960C for booked appointments.
- **Service Cards:** Use high-quality imagery with a subtle 20% black overlay to ensure typography remains legible.