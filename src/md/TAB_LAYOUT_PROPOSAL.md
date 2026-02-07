# Proposal: Implementing Tab-Based Navigation Layout

## 1. Goal
The user wants a "Tab Interface" similar to an IDE or Web Browser.
- Clicking a Sidebar menu item -> Opens a **Tab** at the top.
- Tabs remain open for quick switching.
- Sidebar is always visible.

## 2. Current Status
- **Dashboard**: Has a Sidebar.
- **Shop/Leaderboard/MyMonster**: Have a "Back" button (Sub-page style).
- **Navigation**: Jumping separate routes.

## 3. Proposed Changes (Refactoring)

### Step 1: Create `MainLayout.jsx` (New Wrapper)
This component will hold the persistent UI elements:
1.  **Sidebar**: Always visible on the left.
2.  **Tab Bar**: New component at the top of the main area.
3.  **Content Area**: Changes based on the active tab (using `<Outlet />`).

### Step 2: Tab Logic (State)
- We need to track: `openTabs` (list) and `activeTab` (current).
- **Logic**:
    - Click Sidebar -> Check if tab exists.
        - If yes: Switch to it.
        - If no: Add to list, then switch.
    - Click Tab -> Switch view.
    - Click 'X' -> Close tab (Route to neighbor if active).

### Step 3: Refactor Pages
- **Dashboard**: Remove the internal Sidebar code. Keep only the widgets/content.
- **Shop/Leaderboard/MyMonster**: Remove the "Back button" header. They now live inside the Layout, so they don't need back buttons.

### Step 4: Update Routing (`App.jsx`)
Wrap the authenticated routes under `MainLayout`.
```jsx
<Route element={<MainLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/shop" element={<Shop />} />
  <Route path="/leaderboard" element={<Leaderboard />} />
  <Route path="/my-monster" element={<MyMonster />} />
</Route>
```

## 4. Visual Concept
```
+----------------+---------------------------------------------------+
|  HABITMONS     | [ Dashboard x ] [ Shop x ] [ My Monster x ]       |  <-- Tabs
|                |---------------------------------------------------|
|  [Home]        |                                                   |
|  [My Monster]  |             (Content Area)                        |
|  [Leaderboard] |         Shows Dashboard widgets                   |
|  [Shop]        |             OR Shop Grid                          |
|  [Settings]    |             OR Leaderboard                        |
|                |                                                   |
+----------------+---------------------------------------------------+
```

## 5. Decision
This transforms the app from a "Website" (Page to Page) to a "Web App" (Persistent Workspace).
Shall I proceed with this refactoring?
