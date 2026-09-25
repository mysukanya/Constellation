# Constellation — Advanced Intelligence Operations Board

Constellation is a state-of-the-art web application designed for forensic analysts, intelligence officers, and criminal investigators. Built with a highly responsive React frontend and a robust backend connection architecture, it provides an aggressive, neobrutalist UI/UX heavily inspired by modern IDEs (like VS Code). 

## 🚀 Features

* **Global Intelligence Grid:** A real-time dashboard tracking ongoing investigations, sealed evidence artifacts, and cross-case correlations.
* **VS Code-Style Layout Architecture:**
  * **Compact Activity Bar:** Clean, vertically aligned primary navigation to switch contexts.
  * **Persistent File Explorer:** An interactive side-drawer for dragging and dropping entities, suspects, and case files directly into your workspace.
* **Interactive Investigation Canvas:** 
  * Free-form graph workspace for correlating evidence.
  * Drag and drop entities to map relationships.
  * *Neo-brutalist* visual feedback for selections, connections, and hover states.
* **Byomkesh AI Co-Pilot:** An integrated, docked AI assistant that synthesizes graph correlations and provides deep insights across all your active case data.
* **Dynamic Theming:** Seamless support for Light and Dark modes with highly stylized contrast borders, hard shadows, and bold typography.

## 📦 Project Structure

* `/frontend` - Vite + React application containing all UI components, state contexts, and the workspace canvas.
* `/backend` - (Expected) The API layer handling actual database queries and Byomkesh AI inference.

## 🛠️ How to Run Locally

### Prerequisites
* Node.js (v18+)
* npm or yarn

### 1. Start the Frontend
Navigate into the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:5173.

### 2. Connect the Backend
Ensure that the backend server is running and the `api.js` file in the frontend is properly configured to point to your local or remote backend endpoints. (The application is wired to pull factual data from the backend).

## 🎨 UI/UX Philosophy

The interface utilizes **Aggressive Neobrutalism**:
* **Borders:** Thick, high-contrast strokes (`var(--nb-border)`).
* **Shadows:** Hard, un-blurred offset shadows (`var(--nb-black)`).
* **Palette:** Vibrant accent colors (Cyan, Yellow, Pink) against stark monochrome backgrounds.
* **Interactions:** Cards physically depress (`translate(-2px, -2px)`) when interacted with, providing tactile, responsive feedback.

Enjoy investigating with Constellation!
