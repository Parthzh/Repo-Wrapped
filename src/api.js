const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const SYSTEM_PROMPT = `You are a brilliant, brutally honest senior engineer reviewing a GitHub repository for a "Repo Wrapped" presentation. 

You will be provided with a JSON payload of the repository's statistics, file tree, languages used, and commit messages.

Your objective is to generate an engaging, highly insightful, and visually appealing JSON response.

### EXPECTED OUTPUT FORMAT
You must return a valid JSON object with the EXACT following schema. Do NOT wrap the JSON in markdown blocks. Return ONLY the raw JSON string.

{
  "project_overview": {
    "what_it_does": "[String] A 2-sentence highly accurate summary of what this project actually is and does, based on the README and files.",
    "core_tools_highlight": "[String] A 1-sentence highlight of their tech stack choices (e.g., 'Heavy reliance on React and Tailwind with a Python backend.')."
  },
  "developer_persona": {
    "title": "[String] Create a 2-5 word archetype based on their data (e.g., 'The 4AM Code-Slinger').",
    "description": "[String] A 2-sentence explanation of WHY they earned this title."
  },
  "the_roast": "[String] A 3-sentence, savage, witty roast. Attack their specific language choices or commit message hygiene.",
  "most_cursed_commit": {
    "commit_message": "[String] Quote the exact commit message from the data that is the most chaotic.",
    "commentary": "[String] A 1-sentence hilarious commentary on it."
  },
  "serious_review": {
    "readme_score": "[Integer] A strict score from 0-100 evaluating the README.",
    "constructive_feedback": [
      "[String] The most important architectural improvement.",
      "[String] A secondary, highly specific piece of advice."
    ]
  }
}`;

export async function analyzeRepo(repoUrl) {
  try {
    // 1. Extract owner and repo from URL
    let urlString = repoUrl.trim();
    if (!urlString.startsWith('http')) {
      urlString = 'https://' + urlString;
    }
    const url = new URL(urlString);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      throw new Error("Invalid GitHub URL. Must be formatted like github.com/username/repo");
    }
    
    const owner = pathParts[0];
    const repoName = pathParts[1];

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // 2. Fetch data from GitHub API in parallel
    const [repoRes, commitsRes, languagesRes, readmeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=30`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, { headers }).catch(() => null)
    ]);

    if (!repoRes.ok) throw new Error("Could not fetch repository. Is it private or typed incorrectly?");
    
    const repoData = await repoRes.json();
    const commitsData = await commitsRes.json();
    const languagesData = await languagesRes.json();
    
    let readmeText = "No README found.";
    if (readmeRes && readmeRes.ok) {
      const readmeJson = await readmeRes.json();
      readmeText = atob(readmeJson.content).substring(0, 2000); // 2000 chars max
    }

    const recentCommits = commitsData.map(c => ({
      message: c.commit.message,
      date: c.commit.author.date
    }));

    const repoPayload = {
      name: repoData.full_name,
      description: repoData.description,
      size_kb: repoData.size,
      languages: languagesData,
      recent_commits: recentCommits,
      readme_snippet: readmeText
    };

    const userMessage = JSON.stringify(repoPayload, null, 2);

    // 3. Call Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.8
      })
    });

    if (!groqRes.ok) {
        const err = await groqRes.json();
        throw new Error(err.error?.message || "Error calling Groq API");
    }

    const groqData = await groqRes.json();
    const resultString = groqData.choices[0].message.content;
    
    // Clean potential markdown blocks
    const cleanJsonString = resultString.replace(/```json/gi, '').replace(/```/g, '').trim();
    const aiInsights = JSON.parse(cleanJsonString);

    // Return both AI insights AND raw GitHub data for our charts
    return {
      ai: aiInsights,
      github: {
        stars: repoData.stargazers_count,
        open_issues: repoData.open_issues_count,
        size_kb: repoData.size,
        languages: languagesData,
        commit_count: commitsData.length // just the ones we fetched
      }
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}
