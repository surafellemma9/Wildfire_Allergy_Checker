# Wildfire Allergy Checker - Premium Design System

**Version:** 2.0
**Created:** 2026-01-23
**Design Philosophy:** Apple-level polish with trust, safety, and professionalism

---

## 🎨 Color Palette

### Primary Gradient (Background)
```
Black (#000000) → Dark Gray (#1a1a1a) → Medium Gray (#2a2a2a)
```

- **Usage:** Main app background, creates depth and premium feel
- **Implementation:** `background: linear-gradient(180deg, #000000 0%, #1a1a1a 50%, #2a2a2a 100%)`

### Accent Colors
```
Gold:       #D4AF37  (premium accent, highlights)
Emerald:    #10B981  (safe status)
Ruby:       #DC2626  (unsafe status)
Amber:      #F59E0B  (modify status)
Slate:      #64748B  (unknown/neutral)
```

### Glassmorphism Surfaces
```
Card Background:     rgba(255, 255, 255, 0.03)
Card Border:         rgba(255, 255, 255, 0.08)
Hover State:         rgba(255, 255, 255, 0.06)
Active State:        rgba(255, 255, 255, 0.10)
```

### Text Hierarchy
```
Primary Text:        #FFFFFF  (high contrast)
Secondary Text:      #A0A0A0  (medium contrast)
Tertiary Text:       #6B6B6B  (low contrast)
Disabled Text:       #404040  (very low contrast)
```

---

## 📐 Typography

### Font Families
```css
Primary:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Mono:      'JetBrains Mono', 'Fira Code', 'Consolas', monospace
```

### Font Scales
```
Heading 1:   32px / 40px (2rem / 2.5rem) - Bold
Heading 2:   24px / 32px (1.5rem / 2rem) - Semibold
Heading 3:   20px / 28px (1.25rem / 1.75rem) - Semibold
Heading 4:   18px / 24px (1.125rem / 1.5rem) - Medium
Body:        16px / 24px (1rem / 1.5rem) - Regular
Small:       14px / 20px (0.875rem / 1.25rem) - Regular
Caption:     12px / 16px (0.75rem / 1rem) - Regular
```

### Font Weights
```
Regular:     400
Medium:      500
Semibold:    600
Bold:        700
```

---

## 📏 Spacing System

### Base Unit: 4px (0.25rem)

```
Space 0:   0px     (0rem)
Space 1:   4px     (0.25rem)
Space 2:   8px     (0.5rem)
Space 3:   12px    (0.75rem)
Space 4:   16px    (1rem)
Space 5:   20px    (1.25rem)
Space 6:   24px    (1.5rem)
Space 8:   32px    (2rem)
Space 10:  40px    (2.5rem)
Space 12:  48px    (3rem)
Space 16:  64px    (4rem)
Space 20:  80px    (5rem)
Space 24:  96px    (6rem)
```

### Component Spacing
```
Card Padding:        Space 6 (24px)
Button Padding:      Space 3 Space 6 (12px 24px)
Input Padding:       Space 3 Space 4 (12px 16px)
Section Gap:         Space 8 (32px)
Item Gap:            Space 4 (16px)
```

---

## 🔲 Border Radius

```
Small:      4px   (0.25rem) - Tags, badges
Medium:     8px   (0.5rem)  - Buttons, inputs
Large:      12px  (0.75rem) - Cards
XLarge:     16px  (1rem)    - Modals, large surfaces
Full:       9999px          - Pills, avatars
```

---

## 🌟 Shadows & Effects

### Glassmorphism Cards
```css
box-shadow:
  0 4px 6px rgba(0, 0, 0, 0.1),
  0 1px 3px rgba(0, 0, 0, 0.08),
  inset 0 0 0 1px rgba(255, 255, 255, 0.05);

backdrop-filter: blur(12px);
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### Elevation Levels
```
Level 0 (flat):     none
Level 1 (subtle):   0 2px 4px rgba(0, 0, 0, 0.1)
Level 2 (raised):   0 4px 6px rgba(0, 0, 0, 0.15)
Level 3 (floating): 0 10px 20px rgba(0, 0, 0, 0.2)
Level 4 (modal):    0 20px 40px rgba(0, 0, 0, 0.3)
```

### Glow Effects (for status)
```css
Safe Glow:    0 0 20px rgba(16, 185, 129, 0.3)
Unsafe Glow:  0 0 20px rgba(220, 38, 38, 0.3)
Accent Glow:  0 0 20px rgba(212, 175, 55, 0.3)
```

---

## 🎭 Component Styles

### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
color: #000000;
font-weight: 600;
padding: 12px 24px;
border-radius: 8px;
box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
transition: all 0.2s ease;

&:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
}
```

**Secondary Button:**
```css
background: rgba(255, 255, 255, 0.05);
color: #FFFFFF;
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(12px);
```

**Danger Button:**
```css
background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
color: #FFFFFF;
```

### Cards

**Glassmorphism Card:**
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
padding: 24px;
box-shadow:
  0 4px 6px rgba(0, 0, 0, 0.1),
  inset 0 0 0 1px rgba(255, 255, 255, 0.05);
```

### Status Badges

**Safe:**
```css
background: rgba(16, 185, 129, 0.15);
color: #10B981;
border: 1px solid rgba(16, 185, 129, 0.3);
```

**Unsafe:**
```css
background: rgba(220, 38, 38, 0.15);
color: #DC2626;
border: 1px solid rgba(220, 38, 38, 0.3);
```

**Modify:**
```css
background: rgba(245, 158, 11, 0.15);
color: #F59E0B;
border: 1px solid rgba(245, 158, 11, 0.3);
```

---

## ♿ Accessibility

### Contrast Ratios (WCAG AAA)
```
Primary Text:      7:1  (white on black)
Secondary Text:    4.5:1 (gray on black)
Button Text:       7:1
Interactive:       3:1 (minimum)
```

### Focus States
```css
outline: 2px solid #D4AF37;
outline-offset: 2px;
```

### Touch Targets
```
Minimum:  44px × 44px  (iOS/Android standard)
Ideal:    48px × 48px
```

---

## 🎬 Animations

### Timing Functions
```
Ease Out Cubic:  cubic-bezier(0.33, 1, 0.68, 1)
Ease In Cubic:   cubic-bezier(0.32, 0, 0.67, 0)
Spring:          cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

### Durations
```
Instant:   0ms
Fast:      150ms  (micro-interactions)
Medium:    250ms  (most transitions)
Slow:      400ms  (page transitions)
```

### Transitions
```css
Default:         all 200ms ease
Transform:       transform 200ms cubic-bezier(0.33, 1, 0.68, 1)
Opacity:         opacity 150ms ease
Background:      background-color 200ms ease
```

---

## 📱 Responsive Breakpoints

```
Mobile:      < 640px   (sm)
Tablet:      640-1024px (sm-lg)
Desktop:     > 1024px  (lg+)
```

### Responsive Spacing
```
Mobile:      Space 4 (16px)
Tablet:      Space 6 (24px)
Desktop:     Space 8 (32px)
```

---

## 🚀 Implementation Checklist

- [ ] Update `tailwind.config.js` with new color palette
- [ ] Update `index.css` with custom properties
- [ ] Create reusable button components with new styles
- [ ] Update card components with glassmorphism
- [ ] Add gradient background to App.tsx
- [ ] Update status badges with new colors
- [ ] Add glow effects to interactive elements
- [ ] Test contrast ratios with accessibility tools
- [ ] Add focus states to all interactive elements
- [ ] Test on mobile devices for touch targets

---

**This design system ensures:**
- Premium, trustworthy appearance
- Excellent readability in low-light restaurant environments
- Accessible to all users (WCAG AAA compliance)
- Scalable for future features and components
- Consistent brand identity across all platforms
