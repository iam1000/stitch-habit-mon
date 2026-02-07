# HABITMONS - Design System & Guide

> **Project ID:** 15928787484542863912  
> **Concept:** Gamified Habit Tracker ("Turn Workouts into Monster Evolutions")  
> **Tone:** Playful, Cute, Encouraging, Game-like  

---

## 🎨 Color Palette (Pastel & Vivid)

We use a joyful pastel palette with vibrant accents for the game elements.

| Role | Color | Hex | Usage |
|:--- |:--- |:--- |:--- |
| **Primary (Mint)** | ![#42f05f](https://via.placeholder.com/15/42f05f/000000?text=+) `#42f05f` | Hero Buttons, Success States, Progress Bars |
| **Secondary (Lavender)** | ![#8c36e2](https://via.placeholder.com/15/8c36e2/000000?text=+) `#8c36e2` | Dashboard Accents, XP Bars, Magic Effects |
| **Highlight (Sunny)** | ![#f49d25](https://via.placeholder.com/15/f49d25/000000?text=+) `#f49d25` | Evolution Sparks, Notifications, Important CTA |
| **Background** | ![#f8f9fa](https://via.placeholder.com/15/f8f9fa/000000?text=+) `#f8f9fa` | Main Background (Off-white/Soft Gray) |
| **Surface** | ![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) `#ffffff` | Cards, Modals, Panels |

---

## 🔤 Typography

We mix rounded sans-serifs for a friendly, approachable feel.

*   **Headings:** `Be Vietnam Pro` (Rounded, Bold, Bubbly)
*   **UI / Body:** `Plus Jakarta Sans` (Clean, Modern, Legible)
*   **Game Text:** `Spline Sans` (Techy / Game HUD feel)

---

## 🧱 Component Styles

### 1. Cards & Containers
*   **Border Radius:** `24px` (Large rounded corners for "cute" feel)
*   **Shadow:** `0 10px 30px -10px rgba(0,0,0,0.1)` (Soft, floating elevation)
*   **Border:** `2px solid transparent` (or soft pastel borders on hover)

### 2. Buttons
*   **Shape:** Pill-shaped (`border-radius: 999px`)
*   **Interaction:** Scale up slightly on hover (`transform: scale(1.05)`)
*   **Primary:** Mint gradient background + White text
*   **Secondary:** White background + Pastel text + Border

### 3. Visual Elemets
*   **Avatars:** 3D rendered style (Blob -> Dino-Mon)
*   **Progress Bars:** Thick, rounded caps, glowing gradient fills
*   **Icons:** Filled, colorful, rounded edges

---

## 📱 Core Screens & Flow

1.  **Landing Page (Home)**
    *   *Goal:* Convert visitors to players.
    *   *Key Visual:* Large 3D Monster interacting with headline.
    *   *Action:* "Start Playing" -> Goes to Dashboard.

2.  **Dashboard (Game HUD)**
    *   *Goal:* Daily management.
    *   *Key Visual:* Sidebar Nav + Central "My Monster" Setup + Habit Checklist.
    *   *Interaction:* Checking a habit item triggers +XP animation.

3.  **Evolution (Celebration)**
    *   *Goal:* Reward milestone.
    *   *Key Visual:* Overlay/Modal. "Before" vs "After" comparison.
    *   *Action:* Social Share -> Back to Dashboard.
