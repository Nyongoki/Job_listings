# Homeland Jobs — React Client

This directory contains the React frontend for the Homeland Jobs listing platform built with Vite and Tailwind CSS.

## Features

- **Header Component:** Sticky navigation bar (`position: sticky`) containing logo, nav links, and shadow overlay styles.
- **Dynamic Search & Filters:**
  - Case-insensitive text search filtering both job titles and job descriptions.
  - Dropdown selectors for Categories and Locations compiled dynamically from the active job database.
  - Budget range filtering with min KES and max KES numeric input blocks.
- **Result Counter:** Live counter that updates as filters are dynamically modified (e.g., `Showing 6 of 10 jobs`).
- **Filter-Aware Sorting:** 
  - Option to sort the filtered results by Newest (`postedDate` desc), Budget High–Low, and Budget Low–High.
  - Re-applies automatically whenever filters or search terms change.
- **Skeleton Loaders:** Simulates a 1.5-second async delay on load, displaying 6 animated pulsing placeholder cards.
- **Accessibility & Focus Trapping:** 
  - Job details modal dialog contains semantic ARIA properties (`role="dialog"`, `aria-modal="true"`).
  - Implements keyboard focus trapping allowing cycling through interactive form fields using Tab / Shift+Tab only.
  - Closes on Escape key down or clicking the background backdrop overlay.
- **Proposal Form & Inline Validation:**
  - Input elements include visible, accessible `<label>` descriptors.
  - Validates inputs on form submit (required cover letter with min 100 character check, timeline between 1 and 365, proposed budget > 0, optional valid portfolio URL).
  - Displays inline red error validation blocks without alert popups.
  - Renders a confirmation success pane after a mock asynchronous delay (800ms).

## Tech Stack

- **Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin for maximum performance)
- **Icons:** SVG vector iconography & emojis

## Setup Instructions

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Build the production application bundle:
   ```bash
   npm run build
   ```

## AI Tools Declaration

In accordance with the project guidelines, I declare the use of AI tools during development:
- **Antigravity AI (Google Deepmind):** I utilized this assistant to scaffold the project structure, construct the initial React component files, and set up the Tailwind CSS v4 design system.
- **Usage Details:** I co-authored the keyboard focus-trapping logic for modal accessibility and the multi-stage sorting/filtering pipeline functions with the AI's assistance.

## Known Limitations

- **State Persistence:** Filter settings and proposal details are kept in memory and reset upon page reload.
- **Static Assets:** Logo and employer avatars use placeholder emojis instead of external high-resolution graphics.
