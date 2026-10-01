import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitGraph, Search, ArrowRight, Loader2, ArrowLeft, RefreshCcw } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { analyzeRepo } from './api'

const COLORS = ['#E17062', '#E6AE3C', '#7BA2C3', '#3C5A4D', '#1A1A1A'];

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [wrappedData, setWrappedData] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!repoUrl.trim()) return

    // Client-side rate limiting (3 requests per minute)
    const now = Date.now();
    const limits = JSON.parse(localStorage.getItem('repoLimits') || '[]');
    const validLimits = limits.filter(timestamp => now - timestamp < 60000);
    
    if (validLimits.length >= 3) {
      setError("Whoa there, speed racer! You've hit the rate limit. Please wait 60 seconds.");
      return;
    }
    
    validLimits.push(now);
    localStorage.setItem('repoLimits', JSON.stringify(validLimits));

    setIsLoading(true)
    setError('')
    try {
      const data = await analyzeRepo(repoUrl)
      setWrappedData(data)
      setCurrentSlide(0)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Prepare chart data if available
  let langChartData = [];
  if (wrappedData && wrappedData.github.languages) {
    const langs = wrappedData.github.languages;
    langChartData = Object.keys(langs).map(key => ({
      name: key,
      value: langs[key]
    })).sort((a,b) => b.value - a.value).slice(0, 5); // top 5
  }

  const slides = wrappedData ? [
    {
      title: "Project Overview",
      content: (
        <div className="flex flex-col justify-center h-full space-y-6">
          <div className="bg-white p-6 neo-border neo-shadow text-center">
            <h2 className="text-3xl text-pine font-bold mb-4 uppercase">AI's Verdict</h2>
            <p className="text-xl font-medium">{wrappedData.ai.project_overview.what_it_does}</p>
          </div>
          <div className="bg-coral p-4 neo-border neo-shadow text-white text-center">
            <p className="text-lg font-bold">Tech Stack Vibe: {wrappedData.ai.project_overview.core_tools_highlight}</p>
          </div>
          <div className="flex justify-between gap-4">
            <div className="bg-mustard p-4 neo-border neo-shadow flex-1 text-center">
              <h3 className="text-sm font-bold uppercase">Stars</h3>
              <p className="text-3xl font-black">{wrappedData.github.stars}</p>
            </div>
            <div className="bg-softblue p-4 neo-border neo-shadow flex-1 text-center text-white">
              <h3 className="text-sm font-bold uppercase">Open Issues</h3>
              <p className="text-3xl font-black">{wrappedData.github.open_issues}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tech Stack & Languages",
      content: (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <h2 className="text-2xl font-bold uppercase text-pine mb-6 bg-white px-4 py-2 neo-border">Language Distribution</h2>
          {langChartData.length > 0 ? (
            <div className="w-full h-64 bg-white p-4 neo-border neo-shadow">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={langChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {langChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white p-8 neo-border neo-shadow">No language data found.</div>
          )}
        </div>
      )
    },
    {
      title: "The Developer Persona",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <h2 className="text-4xl md:text-5xl text-coral font-bold tracking-tight bg-white px-4 py-2 neo-border neo-shadow inline-block">
            {wrappedData.ai.developer_persona.title}
          </h2>
          <p className="text-xl md:text-2xl font-medium opacity-90 max-w-md bg-cream p-4 border-l-4 border-pine text-left">
            {wrappedData.ai.developer_persona.description}
          </p>
        </div>
      )
    },
    {
      title: "The Most Cursed Commit",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="bg-pine text-cream p-6 w-full neo-border neo-shadow relative">
            <div className="absolute -top-4 -left-4 bg-mustard text-ink text-sm font-bold py-1 px-3 neo-border rotate-[-5deg]">
              ACTUAL COMMIT
            </div>
            <p className="text-2xl font-mono mt-4">"{wrappedData.ai.most_cursed_commit.commit_message}"</p>
          </div>
          <p className="text-xl font-medium max-w-md italic opacity-80">
            {wrappedData.ai.most_cursed_commit.commentary}
          </p>
        </div>
      )
    },
    {
      title: "The Roast",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed bg-white p-8 neo-border neo-shadow rotate-1 hover:rotate-0 transition-transform">
            "{wrappedData.ai.the_roast}"
          </h2>
        </div>
      )
    },
    {
      title: "Constructive Feedback",
      content: (
        <div className="flex flex-col h-full justify-center space-y-6 text-left">
          <div className="flex items-center gap-4 mb-4 bg-white p-4 neo-border neo-shadow">
            <div className="w-16 h-16 rounded-full border-4 border-ink flex items-center justify-center text-2xl font-black bg-coral text-white">
              {wrappedData.ai.serious_review.readme_score}
            </div>
            <h3 className="text-2xl font-bold text-pine uppercase">README Score</h3>
          </div>
          <ul className="space-y-4">
            {wrappedData.ai.serious_review.constructive_feedback.map((tip, idx) => (
              <li key={idx} className="bg-mustard p-4 neo-border neo-shadow flex gap-3 items-start">
                <ArrowRight className="text-ink shrink-0 mt-1" />
                <span className="text-lg font-medium">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
  ] : []

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Main Container */}
      <motion.div 
        layout
        className="w-full max-w-2xl min-h-[600px] bg-cream neo-border neo-shadow p-8 flex flex-col relative overflow-hidden"
      >
        {/* Decorative blocks */}
        <div className="absolute top-0 left-0 flex z-10">
          <div className="w-6 h-6 bg-coral"></div>
          <div className="w-6 h-6 bg-softblue"></div>
          <div className="w-6 h-6 bg-mustard"></div>
          <div className="w-6 h-6 bg-pine"></div>
        </div>
        <div className="absolute bottom-0 right-0 flex z-10">
          <div className="w-6 h-6 bg-pine"></div>
          <div className="w-6 h-6 bg-mustard"></div>
          <div className="w-6 h-6 bg-softblue"></div>
          <div className="w-6 h-6 bg-coral"></div>
        </div>

        {!wrappedData ? (
          <div className="flex flex-col items-center text-center h-full justify-center">
            <div className="mb-8 mt-4">
              <GitGraph className="w-16 h-16 mx-auto mb-4 text-pine" />
              <h1 className="text-5xl md:text-6xl text-pine tracking-tight leading-tight font-display font-bold">
                REPO WRAPPED <span className="text-coral border-2 border-coral px-2 pb-1 inline-block rotate-3">2026</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl font-semibold opacity-80">
                Brutal, AI-powered insights & metrics for your codebase.
              </p>
            </div>

            <form 
              onSubmit={handleSubmit}
              className="w-full max-w-md flex flex-col gap-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink opacity-50 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-white neo-border p-3 pl-10 text-lg focus:outline-none focus:ring-4 focus:ring-coral/20 font-body placeholder:opacity-50 transition-shadow"
                  disabled={isLoading}
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-coral text-cream text-xl py-3 px-6 flex items-center justify-center gap-2 neo-border neo-shadow neo-button-active hover:bg-[#d85e50] transition-colors uppercase font-display tracking-wide disabled:opacity-50"
              >
                {isLoading ? (
                  <>Analysing... <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  <>Unwrap My Repo <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold w-full max-w-md">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full relative pt-24 pb-16">
            <div className="absolute top-6 left-6 z-20">
              <h2 className="text-3xl md:text-4xl font-display font-black uppercase text-cream bg-pine px-4 py-1 neo-border shadow-[4px_4px_0px_#E17062] -rotate-2">
                {slides[currentSlide].title}
              </h2>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-full flex flex-col"
              >
                {slides[currentSlide].content}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-4 left-0 w-full flex justify-between px-4 items-center z-20">
              <button 
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="p-2 bg-white neo-border neo-shadow neo-button-active disabled:opacity-30 transition-all cursor-pointer z-20"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-2 w-2 rounded-full border-2 border-ink transition-colors ${idx === currentSlide ? 'bg-coral' : 'bg-transparent'}`} 
                  />
                ))}
              </div>

              {currentSlide < slides.length - 1 ? (
                <button 
                  onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                  className="p-2 bg-white neo-border neo-shadow neo-button-active transition-all cursor-pointer z-20"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              ) : (
                <button 
                  onClick={() => setWrappedData(null)}
                  className="p-2 bg-coral text-white neo-border neo-shadow neo-button-active transition-all flex items-center gap-2 font-bold px-4 cursor-pointer z-20"
                >
                  <RefreshCcw className="w-5 h-5" /> Restart
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default App
