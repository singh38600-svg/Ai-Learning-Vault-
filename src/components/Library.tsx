/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FormEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem, Experiment } from '../types';
import {
  Library as LibraryIcon,
  Search,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  Sparkles,
  Link as LinkIcon,
  Phone,
  Code,
  DollarSign,
  Award,
  ArrowUpDown,
  Layers,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ItemDetails from './ItemDetails';

interface LibraryProps {
  userId: string;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  onCompareTrigger: (items: KnowledgeItem[]) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function Library({
  userId,
  selectedItemId,
  setSelectedItemId,
  onCompareTrigger,
  activeTab,
  setActiveTab
}: LibraryProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [exps, setExps] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [keyword, setKeyword] = useState('');
  const [nlQuery, setNlQuery] = useState('');
  const [nlActiveMessage, setNlActiveMessage] = useState<string | null>(null);

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterPricing, setFilterPricing] = useState('All');
  const [filterCoding, setFilterCoding] = useState('All');
  const [filterPhone, setFilterPhone] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  // Compare selection
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [list, tests] = await Promise.all([
          dbService.getKnowledgeItems(userId),
          dbService.getExperiments(userId)
        ]);
        setItems(list);
        setExps(tests);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId, selectedItemId]);

  // Handle item selection
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
  };

  const handleBackToLibrary = () => {
    setSelectedItemId(null);
  };

  // Turn natural language query into filter state
  const handleNLSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) {
      setNlActiveMessage(null);
      return;
    }

    const q = nlQuery.toLowerCase();
    let explanation = '';

    // Reset standard filters when running NL
    setFilterCategory('All');
    setFilterDifficulty('All');
    setFilterPricing('All');
    setFilterCoding('All');
    setFilterPhone('All');
    setFilterStatus('All');

    if (q.includes('free') && q.includes('research')) {
      setFilterPricing('Free');
      setFilterCategory('Research');
      explanation = 'Showing: Free AI tools matched to Research category.';
    } else if (q.includes('phone') || q.includes('smartphone')) {
      setFilterPhone('Yes');
      explanation = 'Showing: Phone-friendly tools (usable from your mobile phone).';
    } else if (q.includes('agent')) {
      setFilterCategory('AI agents');
      explanation = 'Showing: AI agents and automated robotic helpers.';
    } else if (q.includes('not tested') || q.includes('untested')) {
      explanation = 'Showing: Saved items with no logged completed tests.';
    } else if (q.includes('recruitment')) {
      setFilterCategory('Recruitment');
      explanation = 'Showing: Automation and AI tools useful for Recruitment.';
    } else if (q.includes('reject')) {
      explanation = 'Showing: Saved tools that you previously rejected.';
    } else if (q.includes('adopt')) {
      explanation = 'Showing: AI tools that you successfully adopted.';
    } else if (q.includes('hard')) {
      setFilterDifficulty('Hard');
      explanation = 'Showing: Advanced difficulty tools (requires deeper study).';
    } else {
      explanation = `Searching your notes and summaries for: "${nlQuery}"`;
    }

    setNlActiveMessage(explanation);
  };

  const clearNLSearch = () => {
    setNlQuery('');
    setNlActiveMessage(null);
  };

  // Filtering Logic
  const filteredItems = items.filter((item) => {
    // 1. Keyword search (title, summaries, tool, notes)
    if (keyword.trim() !== '') {
      const k = keyword.toLowerCase();
      const matchWord =
        item.title.toLowerCase().includes(k) ||
        item.tool_name.toLowerCase().includes(k) ||
        item.simple_summary.toLowerCase().includes(k) ||
        (item.personal_notes && item.personal_notes.toLowerCase().includes(k));
      if (!matchWord) return false;
    }

    // 2. Natural language additional matching criteria
    if (nlActiveMessage) {
      const q = nlQuery.toLowerCase();
      
      // "not tested" criteria
      if (q.includes('not tested') || q.includes('untested')) {
        const hasTest = exps.some(x => x.knowledge_item_id === item.id && (x.status === 'Completed' || x.status === 'Adopted' || x.status === 'Rejected'));
        if (hasTest) return false;
      }

      // "reject" criteria
      if (q.includes('reject')) {
        const hasReject = exps.some(x => x.knowledge_item_id === item.id && (x.status === 'Rejected' || x.final_decision === 'Rejected'));
        if (!hasReject) return false;
      }

      // "adopt" criteria
      if (q.includes('adopt')) {
        const hasAdopt = exps.some(x => x.knowledge_item_id === item.id && (x.status === 'Adopted' || x.final_decision === 'Adopted'));
        if (!hasAdopt) return false;
      }

      // If no matching key filters but custom query, do global check
      if (!q.includes('free') && !q.includes('phone') && !q.includes('agent') && !q.includes('not tested') && !q.includes('recruitment') && !q.includes('reject') && !q.includes('adopt')) {
        const textToSearch = `${item.title} ${item.tool_name} ${item.simple_summary} ${item.personal_notes || ''} ${item.main_topic}`.toLowerCase();
        if (!textToSearch.includes(q)) return false;
      }
    }

    // 3. Dropdown Filters
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    if (filterDifficulty !== 'All' && item.difficulty !== filterDifficulty) return false;
    if (filterPricing !== 'All' && item.pricing_type !== filterPricing) return false;
    if (filterCoding !== 'All' && item.coding_required !== filterCoding) return false;
    if (filterPhone !== 'All' && item.phone_friendly !== filterPhone) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;

    return true;
  });

  // Sorting logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'score') {
      return b.relevance_score - a.relevance_score;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Compare selection handler
  const handleCompareCheckbox = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(x => x !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can select a maximum of 4 tools for side-by-side comparison.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const triggerComparison = () => {
    const selectedObjects = items.filter(x => selectedForCompare.includes(x.id));
    onCompareTrigger(selectedObjects);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Cataloguing your saved history...</p>
      </div>
    );
  }

  // Render detail view if selected
  if (selectedItemId) {
    const currentObject = items.find(x => x.id === selectedItemId);
    return (
      <ItemDetails
        userId={userId}
        item={currentObject!}
        onBack={handleBackToLibrary}
        setActiveTab={setActiveTab}
      />
    );
  }

  return (
    <div id="library-view" className="space-y-6">
      
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LibraryIcon className="w-6 h-6 text-emerald-600" />
            <span>Saved Lessons ({sortedItems.length})</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Access your entire processed saved collection. Filter, search with natural language, or trigger a side-by-side comparison.
          </p>
        </div>

        {selectedForCompare.length >= 2 && (
          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={triggerComparison}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-slate-950/20 shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Compare Selected ({selectedForCompare.length})</span>
          </motion.button>
        )}
      </div>

      {/* Dual Search Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Natural Language Query Box */}
        <form onSubmit={handleNLSearch} className="bg-slate-900 p-4 rounded-2xl text-white space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Natural Language Assistant
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" title="Try: 'Show me free AI tools for research.'" />
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="e.g. Show me free AI tools for research"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base md:text-xs focus:outline-none focus:border-emerald-500 transition-all text-slate-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-bold hover:bg-emerald-400 transition-colors"
            >
              Ask
            </button>
          </div>

          {nlActiveMessage && (
            <div className="flex items-center justify-between bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-emerald-400 font-medium font-mono">{nlActiveMessage}</span>
              <button type="button" onClick={clearNLSearch} className="text-[10px] text-rose-400 hover:underline">Clear Filter</button>
            </div>
          )}
        </form>

        {/* Standard Keyword & Sorting Box */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest">Standard Search & Sort</span>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search keywords, tools, or summaries..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-xl transition-all ${showFilters ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'}`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
            <span>Sort by:</span>
            <button
              onClick={() => setSortBy('date')}
              className={`flex items-center gap-1 ${sortBy === 'date' ? 'text-slate-900' : 'hover:text-slate-800'}`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Date Added</span>
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`flex items-center gap-1 ${sortBy === 'score' ? 'text-slate-900' : 'hover:text-slate-800'}`}
            >
              <Award className="w-3 h-3" />
              <span>Match Score</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Dropdowns */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 overflow-hidden"
          >
            {/* Category Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-[11px] focus:outline-none font-semibold"
              >
                <option value="All">All</option>
                <option value="AI tools">AI tools</option>
                <option value="AI agents">AI agents</option>
                <option value="Automation">Automation</option>
                <option value="Coding">Coding</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-[11px] focus:outline-none font-semibold"
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Pricing Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">Pricing</label>
              <select
                value={filterPricing}
                onChange={(e) => setFilterPricing(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-[11px] focus:outline-none font-semibold"
              >
                <option value="All">All</option>
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Coding Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">Coding Required</label>
              <select
                value={filterCoding}
                onChange={(e) => setFilterCoding(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-[11px] focus:outline-none font-semibold"
              >
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Phone friendly Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">Phone friendly</label>
              <select
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-[11px] focus:outline-none font-semibold"
              >
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-[11px] focus:outline-none font-semibold"
              >
                <option value="All">All</option>
                <option value="Waiting for review">Inbox (Pending)</option>
                <option value="Test now">Ready to test</option>
                <option value="Learn later">Learn later</option>
                <option value="Save as reference">Reference</option>
                <option value="Compare">Compare queue</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library Grid */}
      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Your Saved Lessons is empty</h4>
          <p className="text-slate-500 text-sm leading-relaxed font-semibold">
            There are no lessons saved yet. Paste a transcript from any AI video or article, and the AI will simplify it for you.
          </p>
          <button
            onClick={() => setActiveTab('add')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Paste Transcript Now
          </button>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No matching items found</h4>
          <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto leading-relaxed">
            We couldn't locate any saves corresponding to your active filters or search keywords. Please clear search terms or reset filters!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedItems.map((item) => {
            const isComparing = selectedForCompare.includes(item.id);
            const isTested = exps.some(x => x.knowledge_item_id === item.id && (x.status === 'Completed' || x.status === 'Adopted' || x.status === 'Rejected'));

            return (
              <motion.div
                layoutId={`card-${item.id}`}
                key={item.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                  isComparing ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/5' : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Checkbox Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase font-mono tracking-wide leading-none">
                        {item.category}
                      </span>
                      {isTested && (
                        <span className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md uppercase font-mono tracking-wide leading-none">
                          ✓ Tested
                        </span>
                      )}
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-400 select-none">
                      <input
                        type="checkbox"
                        checked={isComparing}
                        onChange={() => handleCompareCheckbox(item.id)}
                        className="rounded border-slate-300 accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className={isComparing ? 'text-emerald-600' : 'hover:text-slate-600'}>Compare</span>
                    </label>
                  </div>

                  {/* Title & Tool Name */}
                  <div className="space-y-1">
                    <h3
                      onClick={() => handleSelectItem(item.id)}
                      className="text-sm font-bold text-slate-950 hover:text-emerald-600 cursor-pointer transition-colors leading-snug"
                    >
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 font-mono">
                      Tool: <span className="text-slate-600">{item.tool_name || 'Generic Lesson'}</span>
                    </p>
                  </div>

                  {/* Simple summary sentence */}
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {item.simple_summary}
                  </p>

                  {/* Attribute badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>Phone: {item.phone_friendly}</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <Code className="w-3 h-3 shrink-0" />
                      <span>Coding: {item.coding_required}</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3 shrink-0" />
                      <span>{item.pricing_type}</span>
                    </span>
                  </div>
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-semibold text-slate-400 font-mono">
                    Match: <strong className="text-emerald-600 font-bold">{item.relevance_score}%</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.original_link && (
                      <a
                        href={item.original_link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg transition-colors"
                        title="Original Link"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleSelectItem(item.id)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-0.5 transition-all"
                    >
                      <span>Study</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
