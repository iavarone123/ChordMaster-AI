import React, { useState, useEffect } from 'react';
import { COMMON_CHORDS, MOODS, KEYS, SCALES } from './constants';
import { ChordData, Progression, AppSection, ChordSlot } from './types';
import ChordChart from './components/ChordChart';
import { generateProgression, fetchChordByName } from './services/geminiService';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.Library);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<ChordSlot[]>([]);
  const [aiVoicingIndices, setAiVoicingIndices] = useState<number[]>([]);
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  
  const [currentProgression, setCurrentProgression] = useState<Progression | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentProgressions, setRecentProgressions] = useState<Progression[]>([]);
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [selectedKey, setSelectedKey] = useState(KEYS[0]);
  const [selectedScale, setSelectedScale] = useState(SCALES[0]);
  
  const [voicingIndices, setVoicingIndices] = useState<number[]>([]);

  useEffect(() => {
    if (currentProgression) {
      setVoicingIndices(new Array(currentProgression.chordSlots.length).fill(0));
    }
  }, [currentProgression]);

  const localFilteredChords = COMMON_CHORDS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingAi(true);
    setError(null);
    setActiveSection(AppSection.Library);
    try {
      const slot = await fetchChordByName(searchQuery);
      setAiSearchResults(prev => {
        const next = [slot, ...prev.filter(s => s.name !== slot.name)].slice(0, 5);
        setAiVoicingIndices(new Array(next.length).fill(0));
        return next;
      });
    } catch (err: any) {
      console.error("AI Search failed", err);
      setError(err.message || "Failed to find chord variations. Check API key.");
    } finally {
      setIsSearchingAi(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const prog = await generateProgression(selectedMood, selectedKey, selectedScale);
      setCurrentProgression(prog);
      setRecentProgressions(prev => [prog, ...prev.slice(0, 4)]);
      setActiveSection(AppSection.Generator);
    } catch (err: any) {
      console.error("Generation failed", err);
      setError(err.message || "Failed to generate progression. Make sure your API key is correctly set in Vercel environment variables.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoicing = (slotIndex: number) => {
    if (!currentProgression) return;
    setVoicingIndices(prev => {
      const next = [...prev];
      const max = currentProgression.chordSlots[slotIndex].voicings.length;
      next[slotIndex] = (next[slotIndex] + 1) % max;
      return next;
    });
  };

  const toggleAiVoicing = (resultIndex: number) => {
    setAiVoicingIndices(prev => {
      const next = [...prev];
      const max = aiSearchResults[resultIndex].voicings.length;
      next[resultIndex] = (next[resultIndex] + 1) % max;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
            <i className="fa-solid fa-guitar text-xl"></i>
          </div>
          <h1 className="text-2xl font-serif italic text-amber-500">ChordMaster <span className="text-slate-100 not-italic font-bold tracking-tight">AI</span></h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setActiveSection(AppSection.Library)}
            className={`transition-all hover:scale-105 ${activeSection === AppSection.Library ? 'text-amber-500 font-bold border-b-2 border-amber-500 pb-1' : 'text-slate-400 hover:text-slate-100 pb-1'}`}
          >
            Explore Library
          </button>
          <button 
            onClick={() => setActiveSection(AppSection.Generator)}
            className={`transition-all hover:scale-105 ${activeSection === AppSection.Generator ? 'text-amber-500 font-bold border-b-2 border-amber-500 pb-1' : 'text-slate-400 hover:text-slate-100 pb-1'}`}
          >
            AI Generator
          </button>
        </nav>

        <div className="relative group flex gap-2">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search any chord (e.g. Amaj7#11)..." 
                    className="bg-slate-800 border border-slate-700 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-48 md:w-80 transition-all focus:w-96"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                />
                <i className="fa-solid fa-magnifying-glass absolute right-4 top-3.5 text-slate-500"></i>
            </div>
            {searchQuery && (
                <button 
                    onClick={handleAiSearch}
                    disabled={isSearchingAi}
                    className="bg-slate-700 hover:bg-slate-600 px-4 rounded-full text-xs font-bold text-amber-400 transition-colors disabled:opacity-50"
                >
                    {isSearchingAi ? <i className="fa-solid fa-spinner animate-spin"></i> : 'AI Search'}
                </button>
            )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-12">
        {/* Hero Generator Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[120px] rounded-full -mr-20 -mt-20"></div>
            
            <div className="max-w-3xl relative z-10">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Creative AI Composer</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
                    Define your sonic landscape. Our AI generates musical progressions with multiple fingerings for every chord.
                </p>

                <div className="space-y-8">
                    <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Select the Vibe</div>
                        <div className="flex flex-wrap gap-3">
                            {MOODS.map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => setSelectedMood(mood)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${selectedMood === mood ? 'bg-amber-500 text-slate-950 scale-105 shadow-xl shadow-amber-500/30' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Musical Key</div>
                            <div className="grid grid-cols-6 gap-2">
                                {KEYS.map(key => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedKey(key)}
                                        className={`h-11 rounded-xl text-sm font-bold transition-all border ${selectedKey === key ? 'bg-amber-500 text-slate-950 border-amber-400 scale-110 shadow-lg shadow-amber-500/20' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Harmonic Scale</div>
                            <div className="flex flex-wrap gap-2">
                                {SCALES.map(scale => (
                                    <button
                                        key={scale}
                                        onClick={() => setSelectedScale(scale)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedScale === scale ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-lg shadow-amber-500/20' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        {scale}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 space-y-4">
                    <button 
                        disabled={isLoading}
                        onClick={handleGenerate}
                        className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black px-10 py-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95 shadow-2xl shadow-amber-500/20"
                    >
                        {isLoading ? (
                            <><i className="fa-solid fa-spinner animate-spin"></i> Arranging...</>
                        ) : (
                            <><i className="fa-solid fa-wand-magic-sparkles"></i> Build Progression</>
                        )}
                    </button>
                    {error && (
                        <p className="text-red-400 text-sm font-medium flex items-center gap-2 animate-pulse">
                            <i className="fa-solid fa-circle-exclamation"></i> {error}
                        </p>
                    )}
                </div>
            </div>
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar - Recent */}
            <aside className="lg:col-span-3 space-y-8">
                <div>
                    <h3 className="text-slate-100 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
                        <i className="fa-solid fa-history text-amber-500"></i> Recently Composed
                    </h3>
                    <div className="space-y-4">
                        {recentProgressions.length === 0 ? (
                            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500 text-sm text-center">
                                Your past sessions will appear here.
                            </div>
                        ) : (
                            recentProgressions.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => {
                                        setCurrentProgression(p);
                                        setActiveSection(AppSection.Generator);
                                    }}
                                    className="w-full text-left p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group"
                                >
                                    <div className="text-amber-400 font-bold text-sm mb-1 group-hover:translate-x-1 transition-transform">{p.title}</div>
                                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex gap-3">
                                        <span>{p.key} {p.scale}</span>
                                        <span>•</span>
                                        <span>{p.chordSlots.length} Chords</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </aside>

            {/* Main View */}
            <div className="lg:col-span-9">
                {activeSection === AppSection.Library ? (
                    <div className="space-y-10">
                        {aiSearchResults.length > 0 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h3 className="text-amber-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                    <i className="fa-solid fa-robot"></i> AI Discovered Chords
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {aiSearchResults.map((slot, idx) => {
                                        const voicingIdx = aiVoicingIndices[idx] || 0;
                                        const activeVoicing = slot.voicings[voicingIdx];
                                        return (
                                            <div key={`ai-slot-${idx}`} className="flex flex-col items-center gap-4">
                                                <div className="relative group/chart w-full">
                                                    <ChordChart chord={activeVoicing} />
                                                    
                                                    {/* Switcher overlay for library search */}
                                                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/chart:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 rounded-[2.5rem] backdrop-blur-[4px]">
                                                        <button 
                                                            onClick={() => toggleAiVoicing(idx)}
                                                            className="bg-amber-500 text-slate-950 rounded-full h-10 w-10 flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all"
                                                        >
                                                            <i className="fa-solid fa-repeat text-lg"></i>
                                                        </button>
                                                        <span className="text-[9px] font-black text-amber-400">POS {voicingIdx + 1}/{slot.voicings.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <hr className="border-slate-800" />
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    {searchQuery ? 'Search Results' : 'Core Chord Library'}
                                    <span className="text-slate-600 font-normal text-sm bg-slate-900 px-3 py-1 rounded-full">{localFilteredChords.length} options</span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {localFilteredChords.map((chord, idx) => (
                                    <ChordChart key={idx} chord={chord} />
                                ))}
                            </div>
                            {localFilteredChords.length === 0 && !isSearchingAi && aiSearchResults.length === 0 && (
                                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                                    <i className="fa-solid fa-guitar-electric text-4xl text-slate-800 mb-4 block"></i>
                                    <p className="text-slate-500">Could not find a local match for "{searchQuery}"</p>
                                    <button onClick={handleAiSearch} className="mt-4 bg-amber-500/10 text-amber-500 px-6 py-2 rounded-full font-bold hover:bg-amber-500/20 transition-colors">
                                        Search Global AI Database
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {currentProgression ? (
                            <>
                                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[3rem] p-10 shadow-3xl">
                                    <div className="mb-12">
                                        <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                                            <div className="h-[2px] w-8 bg-amber-500"></div>
                                            {currentProgression.mood} • {currentProgression.key} {selectedScale}
                                        </div>
                                        <h2 className="text-5xl font-serif italic mb-6 leading-tight">{currentProgression.title}</h2>
                                        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl font-light">
                                            {currentProgression.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                                        {currentProgression.chordSlots.map((slot, idx) => {
                                            const voicingIdx = voicingIndices[idx] || 0;
                                            const activeVoicing = slot.voicings[voicingIdx];
                                            
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-5 p-6 rounded-[2.5rem] bg-slate-950/60 border border-slate-800/50 hover:border-amber-500/40 transition-all group/slot">
                                                    <div className="w-full flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black text-slate-600 bg-slate-900 h-6 w-6 flex items-center justify-center rounded-lg">{idx + 1}</span>
                                                        <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">{voicingIdx + 1}/{slot.voicings.length}</span>
                                                    </div>
                                                    
                                                    <div className="relative group/chart">
                                                        <ChordChart chord={activeVoicing} size="lg" />
                                                        
                                                        {/* Switcher overlay */}
                                                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/chart:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 rounded-[2rem] backdrop-blur-[4px]">
                                                            <button 
                                                                onClick={() => toggleVoicing(idx)}
                                                                className="bg-amber-500 text-slate-950 rounded-full h-14 w-14 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all"
                                                                title="Switch to next position"
                                                            >
                                                                <i className="fa-solid fa-repeat text-2xl"></i>
                                                            </button>
                                                            <span className="text-[10px] font-black text-amber-400">CHANGE POSITION</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-center w-full min-h-[50px] flex flex-col justify-center">
                                                        <h4 className="text-slate-100 font-black text-xl leading-tight mb-1">{slot.name}</h4>
                                                        <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest opacity-80">
                                                            {activeVoicing.name.split(' - ')[1] || 'Standard'}
                                                        </p>
                                                    </div>

                                                    <button 
                                                        onClick={() => toggleVoicing(idx)}
                                                        className="mt-2 text-[9px] font-black text-slate-500 hover:text-amber-500 uppercase tracking-widest flex items-center gap-2 transition-colors border border-slate-800 px-4 py-1.5 rounded-full"
                                                    >
                                                        <i className="fa-solid fa-arrows-left-right text-[8px]"></i> Cycle Voicings
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10 flex items-start gap-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                        <i className="fa-solid fa-guitar text-8xl text-amber-500"></i>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                                        <i className="fa-solid fa-lightbulb text-2xl"></i>
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-amber-500 font-black text-xs uppercase tracking-[0.3em] mb-3">Composer's Insight</h4>
                                        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl font-light">
                                            The <span className="text-amber-400 font-medium">{currentProgression.mood}</span> essence of this <span className="text-amber-400 font-medium">{currentProgression.key} {selectedScale}</span> piece is defined by the voice leading. 
                                            Hover over any chord to cycle through alternative positions and see how changing from an open shape to a high-fret barre chord dramatically shifts the harmonic texture.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-[35rem] flex flex-col items-center justify-center text-slate-700 space-y-8">
                                <div className="w-40 h-40 rounded-full border-4 border-slate-900 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                    <i className="fa-solid fa-music text-7xl opacity-5"></i>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-light mb-2">Ready to explore new harmonies?</p>
                                    <p className="text-sm text-slate-800 font-bold uppercase tracking-[0.4em]">Select parameters and generate</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-800/50 p-6 sticky bottom-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Workspace</span>
                      <span className="text-slate-200 font-bold text-sm">{activeSection === AppSection.Library ? 'Chord Library' : 'Composition Engine'}</span>
                  </div>
              </div>
              
              <div className="flex items-center gap-6 bg-slate-950/80 px-10 py-3 rounded-3xl border border-slate-800/50 shadow-2xl">
                  <button className="w-10 h-10 rounded-full text-slate-500 flex items-center justify-center hover:text-amber-500 transition-colors">
                      <i className="fa-solid fa-backward-step"></i>
                  </button>
                  <button 
                    disabled={isLoading}
                    onClick={() => { if (!isLoading) handleGenerate(); }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-3xl active:scale-90 ring-4 ring-amber-500/10 ${isLoading ? 'bg-slate-700 text-amber-500' : 'bg-amber-500 text-slate-950 hover:scale-110 shadow-amber-500/30'}`}>
                      {isLoading ? <i className="fa-solid fa-spinner animate-spin text-2xl"></i> : <i className="fa-solid fa-play ml-1 text-2xl"></i>}
                  </button>
                  <button className="w-10 h-10 rounded-full text-slate-500 flex items-center justify-center hover:text-amber-500 transition-colors">
                      <i className="fa-solid fa-forward-step"></i>
                  </button>
              </div>

              <div className="flex items-center gap-10">
                  <div className="flex items-center gap-4 text-slate-600">
                      <i className="fa-solid fa-volume-low text-sm"></i>
                      <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                      </div>
                  </div>
                  <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] hidden xl:block">
                      PRO ENGINE 3.0
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default App;