<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/git-graph.svg" width="100" height="100" alt="Repo Wrapped Logo" />
  
  # 🎧 Repo Wrapped 2026
  
  **Brutal, AI-powered insights & metrics for your codebase.**  
  *Built for the Open Source AI Hackathon.*

  ### 🌐 [Live Demo: repo-wrapped.onrender.com](https://repo-wrapped.onrender.com/)

  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Powered by Groq](https://img.shields.io/badge/Powered_by-Groq-f55036?style=for-the-badge)](https://groq.com/)
  [![Model: Qwen](https://img.shields.io/badge/Model-Qwen_3.8_27B-black?style=for-the-badge)](https://qwenlm.github.io/)
</div>

<br />

## 🚀 What is Repo Wrapped?
Ever wondered what a senior developer *really* thinks of your code at 3 AM? **Repo Wrapped** is a web app that generates a "Spotify Wrapped" style recap of any public GitHub repository. 

Instead of just showing you boring charts, we feed your repository's raw data (commits, languages, file sizes, and README) into a highly cynical, top-tier open-weight LLM. The AI psychoanalyzes your commit habits, roasts your architecture, and gives you actionable feedback—all wrapped in a stunning Neo-Brutalist UI.

### ✨ Features
*   **The Vibe Check:** AI figures out exactly what your tech stack says about you.
*   **Language Distribution:** Beautiful, animated Pie Charts powered by `recharts`.
*   **The Developer Persona:** Are you "The 3AM Gremlin" or "The Copy-Paste Shaman"? The AI knows.
*   **Invented Metrics:** Mathematically absurd but conceptually accurate estimates of "Coffee Cups Consumed" and "Desk Smashes".
*   **The Most Cursed Commit:** We find your most chaotic commit message and roast it.
*   **Constructive Feedback:** You get a hard 0-100 score on your README and real architectural advice.

---

## 🛠️ Built With Open-Weight AI
This project heavily utilizes Open-Source AI. We use **Qwen 3.8 (27B)** via the blazing fast **Groq API**.
*   **Why Qwen?** It's a top-tier open-weight model capable of incredibly nuanced humor, JSON generation, and code analysis.
*   **Why Groq?** Because nobody wants to wait 45 seconds for a roast. Groq gives us instant inference, making the web app feel incredibly snappy.

---

## 💻 Local Setup

Want to roast your own repos locally? It takes less than 2 minutes.

1. **Clone the repo**
   ```bash
   git clone https://github.com/Parthzh/Repo-Wrapped.git
   cd Repo-Wrapped
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_GITHUB_TOKEN=your_github_pat_here
   ```
   *(Note: The GitHub token is technically optional, but highly recommended to avoid rate limits when fetching repo data).*

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` and get roasting!

---

## 🎨 UI/UX Design
The app is built using a **Light Neo-Brutalism** design system. 
*   **Colors**: A carefully curated palette of Pine Green, Coral, Mustard Yellow, and Soft Blue over a textured Cream background.
*   **Styling**: Hard shadows, bold borders, and punchy typography (`Oswald` and `IBM Plex Mono`).

<div align="center">
  <i>Made with ❤️ (and a lot of coffee) for the Open Source AI Hackathon.</i>
</div>
