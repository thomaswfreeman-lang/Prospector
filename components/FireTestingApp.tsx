"use client";
import { useState, useMemo } from 'react';
import { Search, Download, Plus, Copy, Calendar, Building2, MapPin, ExternalLink, AlertTriangle, Loader, Zap } from 'lucide-react';
import UnifiedSearchButton from './UnifiedSearchButton';
import EnhancedExternalToolsTab from './EnhancedExternalToolsTab';
import AIServiceButtons from './AIServiceButtons';

interface Prospect {
  id: string;
  date: string;
  publishedDate: string;
  bidDueDate: string;
  company: string;
  contact: string;
  location: string;
  catalyst: string;
  fit: string;
  reasoning: string;
  type: string;
  source: string;
  phone: string;
  email: string;
}

interface IndustrySource {
  id: string;
  name: string;
  url: string;
  category: string;
  lastScraped: string;
  prospectCount: number;
  status: string;
  monitorFrequency: string;
  nextCheck: string;
  monitorsFor: string;
  specificPages: string[];
  lastFindings: string;
  aiToolsUsing: string[];
  keySearchTerms: string;
}

const FireSafetyProspectsApp = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    industry: '',
    dateRange: '90',
    search: ''
  });

  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('prospects');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [expandedUrgent, setExpandedUrgent] = useState<Record<string, boolean>>({});
  const [dismissedUrgent, setDismissedUrgent] = useState<Set<string>>(new Set());
  const [removedProspects, setRemovedProspects] = useState<(Prospect & { removedDate: string })[]>([]);
  const [tempStandards, setTempStandards] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('north-america');
  const [selectedEuropeCountries, setSelectedEuropeCountries] = useState<string[]>([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const europeCountries = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'United Kingdom'];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };
  
  const [industrySources, setIndustrySources] = useState<IndustrySource[]>([
    {
      id: '1',
      name: 'Fire Safety Research Institute',
      url: 'https://fsri.org',
      category: 'Research Institute',
      lastScraped: '2025-09-15',
      prospectCount: 12,
      status: 'Active',
      monitorFrequency: 'Weekly',
      nextCheck: '2025-09-22',
      monitorsFor: 'New research grants, lab expansions, equipment procurement',
      specificPages: [
        'https://fsri.org/research/projects',
        'https://fsri.org/news'
      ],
      lastFindings: 'Found 2 new lab partnerships, 1 equipment RFP',
      aiToolsUsing: ['ChatGPT', 'Perplexity'],
      keySearchTerms: 'fire testing equipment, cone calorimeter, ASTM E1354'
    },
    {
      id: '2',
      name: 'NFPA Standards Development',
      url: 'https://nfpa.org/standards-development',
      category: 'Standards Organization',
      lastScraped: '2025-09-14',
      prospectCount: 8,
      status: 'Active',
      monitorFrequency: 'Monthly',
      nextCheck: '2025-10-14',
      monitorsFor: 'New standards, committee updates, implementation deadlines',
      specificPages: [
        'https://nfpa.org/news',
        'https://nfpa.org/codes-and-standards/all-codes-and-standards'
      ],
      lastFindings: 'NFPA 701 updates require new testing equipment',
      aiToolsUsing: ['Claude', 'Perplexity'],
      keySearchTerms: 'NFPA 701, fire testing standards, textile testing'
    },
    {
      id: '3',
      name: 'Grants.gov Fire Safety',
      url: 'https://grants.gov/search-grants.html?keywords=fire%20safety',
      category: 'Government Database',
      lastScraped: '2025-09-16',
      prospectCount: 25,
      status: 'Active',
      monitorFrequency: 'Daily',
      nextCheck: '2025-09-18',
      monitorsFor: 'New grant opportunities, SBIR solicitations, federal funding',
      specificPages: [
        'https://grants.gov/search-grants.html?keywords=fire%20safety',
        'https://grants.gov/search-grants.html?keywords=SBIR%20fire'
      ],
      lastFindings: 'DOE ARPA-E fire safety grants, NSF FIRE program expansion',
      aiToolsUsing: ['All AI Tools', 'Grok for breaking news'],
      keySearchTerms: 'fire safety, SBIR, ARPA-E, NSF FIRE'
    }
  ]);
  
  const [externalLinks] = useState([
    {
      id: '1',
      name: 'ChatGPT Fire Safety Query',
      url: 'https://chat.openai.com',
      description: 'Use GPT-4 to search for fire safety lab prospects',
      lastUsed: '2025-09-16'
    },
    {
      id: '2',
      name: 'Perplexity Research Assistant',
      url: 'https://perplexity.ai',
      description: 'AI-powered research for grant opportunities with real-time web access',
      lastUsed: '2025-09-15'
    },
    {
      id: '3',
      name: 'Claude Research Assistant',
      url: 'https://claude.ai',
      description: 'Advanced reasoning and document analysis for fire safety research',
      lastUsed: '2025-09-14'
    },
    {
      id: '4',
      name: 'Grok Real-time Research',
      url: 'https://x.com/i/grok',
      description: 'Real-time X/Twitter data and breaking news for fire safety opportunities',
      lastUsed: '2025-09-16'
    },
    {
      id: '5',
      name: 'Grants.gov Advanced Search',
      url: 'https://grants.gov/web/grants/search-grants.html',
      description: 'Federal grant database for fire safety research',
      lastUsed: '2025-09-14'
    }
  ]);

  const [queryParams, setQueryParams] = useState({
    entities: ['labs', 'universities', 'government entities'],
    industries: ['construction/building materials', 'aerospace', 'automotive/EV batteries', 'plastics/polymers/chemicals', 'textiles', 'electronics/consumer goods', 'furniture', 'healthcare', 'manufacturing'],
    testStandards: ['UL94', 'ASTM E1354', 'ISO 5660', 'ISO 9705', 'ISO 11341', 'ASTM E84', 'NFPA 701'],
    grantPrograms: ['NSF FIRE', 'UL Institutes', 'FEMA FP&S', 'DOE ARPA-E', 'NIH SBIR', 'NASA SBIR'],
    solicitations: ['RFBs', 'open contracts', 'university solicitations', 'government RFPs'],
    dateRange: '30-90',
    prospectCount: 10,
    typeBalance: { funding: 4, greenCert: 3, catalyst: 3 }
  });

  const entities = ['Labs', 'Universities', 'Government Entities'];
  const industries = ['Construction/Building Materials', 'Aerospace', 'Automotive/EV Batteries', 'Plastics/Polymers/Chemicals', 'Textiles', 'Electronics/Consumer Goods', 'Furniture', 'Healthcare', 'Manufacturing'];
  const testStandards = ['UL94', 'ASTM E1354', 'ISO 5660', 'ISO 9705', 'ISO 11341', 'ASTM E84', 'NFPA 701'];
  const grantPrograms = ['NSF FIRE', 'UL Institutes', 'FEMA FP&S', 'DOE ARPA-E', 'NIH SBIR', 'NASA SBIR', 'DHS SBIR', 'NIST SBIR'];
  const solicitations = ['RFBs', 'Open Contracts', 'University Solicitations', 'Government RFPs', 'Federal Grants', 'State Funding'];

  // Calculate urgent opportunities
  const urgentOpportunities = useMemo(() => {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    return prospects.filter(prospect => {
      if (!prospect.bidDueDate) return false;
      const dueDate = new Date(prospect.bidDueDate);
      const today = new Date();
      return dueDate >= today && dueDate <= twoWeeksFromNow;
    }).sort((a, b) => new Date(a.bidDueDate).getTime() - new Date(b.bidDueDate).getTime());
  }, [prospects]);

  // Sites needing check
  const sitesNeedingCheck = useMemo(() => {
    const today = new Date();
    return industrySources.filter(source => {
      const nextCheckDate = new Date(source.nextCheck);
      return nextCheckDate <= today;
    }).sort((a, b) => new Date(a.nextCheck).getTime() - new Date(b.nextCheck).getTime());
  }, [industrySources]);

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      const matchesType = !filters.type || prospect.type === filters.type;
      const matchesSearch = !filters.search || 
        prospect.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        prospect.contact.toLowerCase().includes(filters.search.toLowerCase()) ||
        prospect.location.toLowerCase().includes(filters.search.toLowerCase());
      
      const prospectDate = new Date(prospect.date);
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      const matchesDate = !filters.dateRange || prospectDate >= cutoffDate;
      
      return matchesType && matchesSearch && matchesDate;
    });
  }, [prospects, filters]);

  const generateQuery = (): string => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let regionText = '';
    if (selectedRegion === 'north-america') {
      regionText = 'North American';
    } else if (selectedRegion === 'europe') {
      if (selectedEuropeCountries.length === 0 || selectedEuropeCountries.length === europeCountries.length) {
        regionText = 'European';
      } else {
        regionText = selectedEuropeCountries.join(', ') + ' (European)';
      }
    } else if (selectedRegion === 'both') {
      regionText = 'North American and European';
    }
    
    const allStandards = [...queryParams.testStandards];
    if (tempStandards.trim()) {
      const additionalStandards = tempStandards.split(',').map(s => s.trim()).filter(s => s);
      allStandards.push(...additionalStandards);
    }
    
    return `Using the current date [${currentDate}], search for the latest ${regionText} ${queryParams.entities.join(', ')} in fire safety for sectors like ${queryParams.industries.join(', ')} using ${allStandards.join(', ')}. Include university research grants (e.g., ${queryParams.grantPrograms.join(', ')}) and university/government solicitations (${queryParams.solicitations.join(', ')}). Prioritize events from the last ${queryParams.dateRange} days. Find ${queryParams.prospectCount} unique prospects (no duplicates from prior lists) with contact names/titles, emails/phones, cities, catalysts (regs, market shifts, grants, solicitations) or funding/green certs, why they need our instruments (e.g., cone calorimeters for ASTM E1354, smoke chambers for NFPA 701, oxygen indexes/microcalorimeters/UL94 testers), announcement dates, source links, and type (Funding, Green Cert, or Catalyst). Output as a CSV file with columns: Date,Published Date,Bid Due Date,Company,Contact,Location,Catalyst/Funding (link at end),Fit,Reasoning,Type. Ensure thorough and detailed responses in the Reasoning column. Include notes on sources, verification, and format. Balance ~${queryParams.typeBalance.funding} Funding, ~${queryParams.typeBalance.greenCert} Green Cert, ~${queryParams.typeBalance.catalyst} Catalyst. Base on verifiable sources like company sites, press releases, federal registers, grant databases (grants.gov), university announcements, and journals (e.g., NFPA, FAA, ASTM, NSF). 

IMPORTANT: At the end of your response, please list all the specific websites and sources you used to find this information, formatted as:

SOURCES USED:
- Website Name: URL (what was found here)
- Website Name: URL (what was found here)

This helps track reliable sources for ongoing monitoring.`;
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(generateQuery());
    alert('Query copied to clipboard!');
  };

  const extractAndAddSources = (newProspects: Prospect[]): number => {
    const extractedSources: IndustrySource[] = [];
    const existingUrls = new Set(industrySources.map(s => s.url));
    
    newProspects.forEach(prospect => {
      if (prospect.source && prospect.source.startsWith('http')) {
        try {
          const url = new URL(prospect.source);
          const baseUrl = `${url.protocol}//${url.hostname}`;
          
          if (!existingUrls.has(baseUrl) && !extractedSources.some(s => s.url === baseUrl)) {
            const newSource: IndustrySource = {
              id: (Date.now() + Math.random()).toString(),
              name: url.hostname.replace('www.', '').split('.')[0].toUpperCase() + ' Source',
              url: baseUrl,
              category: 'Auto-Discovered',
              lastScraped: new Date().toISOString().split('T')[0],
              prospectCount: 1,
              status: 'Active',
              monitorFrequency: 'Weekly',
              nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              monitorsFor: 'Auto-discovered from prospect imports',
              specificPages: [prospect.source],
              lastFindings: `Found via prospect: ${prospect.company}`,
              aiToolsUsing: ['Auto-Discovery'],
              keySearchTerms: 'fire testing, fire safety'
            };
            extractedSources.push(newSource);
            existingUrls.add(baseUrl);
          }
        } catch (error) {
          console.log('Invalid URL:', prospect.source);
        }
      }
    });
    
    if (extractedSources.length > 0) {
      setIndustrySources(prev => [...prev, ...extractedSources]);
      return extractedSources.length;
    }
    return 0;
  };

  const quickImportWorkflow = () => {
    setShowImportModal(true);
    setImportData('');
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Published Date', 'Bid Due Date', 'Company', 'Contact', 'Location', 'Catalyst/Funding', 'Fit', 'Reasoning', 'Type'];
    const csvContent = [
      headers.join(','),
      ...filteredProspects.map(p => [
        p.date,
        p.publishedDate || '',
        p.bidDueDate || '',
        `"${p.company}"`,
        `"${p.contact}"`,
        `"${p.location}"`,
        `"${p.catalyst}"`,
        `"${p.fit}"`,
        `"${p.reasoning}"`,
        p.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fire-safety-prospects-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const parseCSVData = (csvText: string): Prospect[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      alert('CSV appears to be empty or only has headers. Please check your data.');
      return [];
    }

    const prospects: Prospect[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(val => val.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 4) {
        const prospect: Prospect = {
          id: (Date.now() + i).toString(),
          date: values[0] || new Date().toISOString().split('T')[0],
          publishedDate: values[1] || '',
          bidDueDate: values[2] || '',
          company: values[3] || `Unknown Company ${i}`,
          contact: values[4] || 'Unknown Contact',
          location: values[5] || 'Unknown Location',
          catalyst: values[6] || 'Unknown Catalyst',
          fit: values[7] || 'Equipment needed',
          reasoning: values[8] || 'Imported prospect',
          type: values[9] || 'Funding',
          source: 'Imported from CSV',
          phone: values[10] || '',
          email: values[11] || ''
        };
        
        if (values.length < 10) {
          prospect.company = values[1] || `Unknown Company ${i}`;
          prospect.contact = values[2] || 'Unknown Contact';
          prospect.location = values[3] || 'Unknown Location';
          prospect.catalyst = values[4] || 'Unknown Catalyst';
          prospect.fit = values[5] || 'Equipment needed';
          prospect.reasoning = values[6] || 'Imported prospect';
          prospect.type = values[7] || 'Funding';
          prospect.publishedDate = '';
          prospect.bidDueDate = '';
        }
        
        if (prospect.company !== `Unknown Company ${i}` && prospect.contact !== 'Unknown Contact') {
          prospects.push(prospect);
        }
      }
    }
    
    return prospects;
  };

  const importCSV = () => {
    if (!importData.trim()) {
      alert('Please paste CSV data first');
      return;
    }

    try {
      const newProspects = parseCSVData(importData);
      
      if (newProspects.length === 0) {
        alert('No valid prospects found in CSV data. Please check the format.');
        return;
      }

      const validProspects: Prospect[] = [];
      let duplicateCount = 0;
      let errorCount = 0;

      newProspects.forEach((prospectData, index) => {
        try {
          const isDuplicateOfExisting = prospects.some(existing => 
            existing.company.toLowerCase() === prospectData.company.toLowerCase() &&
            existing.contact.toLowerCase() === prospectData.contact.toLowerCase() &&
            existing.catalyst.toLowerCase() === prospectData.catalyst.toLowerCase()
          );
          
          const isDuplicateOfNew = validProspects.some(newOne => 
            newOne.company.toLowerCase() === prospectData.company.toLowerCase() &&
            newOne.contact.toLowerCase() === prospectData.contact.toLowerCase() &&
            newOne.catalyst.toLowerCase() === prospectData.catalyst.toLowerCase()
          );

          if (isDuplicateOfExisting || isDuplicateOfNew) {
            duplicateCount++;
          } else {
            const newProspect: Prospect = {
              ...prospectData,
              id: (Date.now() + index).toString(),
              date: prospectData.date || new Date().toISOString().split('T')[0]
            };
            validProspects.push(newProspect);
          }
        } catch (error) {
          console.error(`Error processing prospect ${index}:`, error);
          errorCount++;
        }
      });

      if (validProspects.length > 0) {
        setProspects(prevProspects => [...prevProspects, ...validProspects]);
      }

      const newSourcesCount = extractAndAddSources(validProspects);

      const message = `CSV Import Results:
      
Successfully imported: ${validProspects.length} prospects
Skipped duplicates: ${duplicateCount} prospects  
Errors: ${errorCount} prospects
Total processed: ${newProspects.length} lines
New sources discovered: ${newSourcesCount} websites added to monitoring

${errorCount > 0 ? '\nCheck browser console for error details.' : ''}`;

      alert(message);
      setImportData('');
      setShowImportModal(false);
      
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your CSV format and try again.`);
    }
  };

  const addNewProspect = () => {
    const newProspect: Prospect = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      publishedDate: '',
      bidDueDate: '',
      company: 'New Company',
      contact: 'Contact Name, Title',
      location: 'City, State',
      catalyst: 'Catalyst/Funding description',
      fit: 'Required instruments',
      reasoning: 'Detailed reasoning for why they need our instruments',
      type: 'Funding',
      source: 'https://source-link.com',
      phone: '',
      email: ''
    };
    setProspects([...prospects, newProspect]);
  };

  const recordSiteCheck = (sourceId: string, findings: string | null) => {
    setIndustrySources(prev => prev.map(source => {
      if (source.id === sourceId) {
        const today = new Date().toISOString().split('T')[0];
        let nextCheck = new Date();
        
        switch(source.monitorFrequency) {
          case 'Daily': nextCheck.setDate(nextCheck.getDate() + 1); break;
          case 'Weekly': nextCheck.setDate(nextCheck.getDate() + 7); break;
          case 'Bi-weekly': nextCheck.setDate(nextCheck.getDate() + 14); break;
          case 'Monthly': nextCheck.setMonth(nextCheck.getMonth() + 1); break;
        }
        
        return {
          ...source,
          lastScraped: today,
          nextCheck: nextCheck.toISOString().split('T')[0],
          lastFindings: findings || 'No new findings'
        };
      }
      return source;
    }));
  };

  const removeProspect = (prospectId: string) => {
    const prospectToRemove = prospects.find(p => p.id === prospectId);
    if (prospectToRemove) {
      setProspects(prev => prev.filter(p => p.id !== prospectId));
      setRemovedProspects(prev => [...prev, { ...prospectToRemove, removedDate: new Date().toISOString().split('T')[0] }]);
    }
  };

  const reinstateProspect = (prospectId: string) => {
    const prospectToReinstate = removedProspects.find(p => p.id === prospectId);
    if (prospectToReinstate) {
      const { removedDate, ...prospectData } = prospectToReinstate;
      setRemovedProspects(prev => prev.filter(p => p.id !== prospectId));
      setProspects(prev => [...prev, prospectData]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="text-red-600" />
              Fire Testing New Prospects
            </h1>
            <p className="text-gray-600 mt-2">Fire Testing New Prospects Manager</p>
            <div className="mt-3 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Quick Start Guide:</h4>
              <ol className="space-y-1">
                <li><strong>1. Search:</strong> Use the unified AI search button below</li>
                <li><strong>2. Import:</strong> Copy CSV results from AI tools and use Actions &gt; Quick Import</li>
                <li><strong>3. Manage:</strong> View prospects on the Prospects tab, remove or reinstate as needed</li>
                <li><strong>4. Configure:</strong> Use Actions &gt; Query Builder to customize search parameters</li>
                <li><strong>5. Export:</strong> Use Actions &gt; Export CSV to save your prospect data</li>
              </ol>
            </div>
          </div>
          
          {/* Right side header with AI buttons and Actions */}
          <div className="flex flex-col gap-3 items-end">
            {/* AI Service Buttons Row */}
            <AIServiceButtons className="flex-wrap justify-end" />
            
            {/* Actions Dropdown Row */}
            <div className="relative">
              <button
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actions
                <svg className={`w-4 h-4 transition-transform ${showActionsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {showActionsDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      quickImportWorkflow();
                      setShowActionsDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-green-600"
                  >
                    Quick Import
                  </button>
                  <button
                    onClick={() => {
                      setShowQueryBuilder(!showQueryBuilder);
                      setShowActionsDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-t border-gray-100"
                  >
                    <Search size={16} />
                    Query Builder
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV();
                      setShowActionsDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-t border-gray-100"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      addNewProspect();
                      setShowActionsDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-t border-gray-100"
                  >
                    <Plus size={16} />
                    Add Prospect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Urgent Opportunities Alert */}
        {urgentOpportunities.filter(opp => !dismissedUrgent.has(opp.id)).length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-red-800">
                    Urgent Opportunities - Due Within 2 Weeks!
                  </h3>
                  <p className="text-red-700 text-sm">
                    {urgentOpportunities.filter(opp => !dismissedUrgent.has(opp.id)).length} RFB/Solicitation{urgentOpportunities.filter(opp => !dismissedUrgent.has(opp.id)).length > 1 ? 's' : ''} with approaching deadlines
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedUrgent(prev => {
                    const allExpanded = urgentOpportunities.every(opp => prev[opp.id]);
                    const newState: Record<string, boolean> = {};
                    urgentOpportunities.forEach(opp => {
                      newState[opp.id] = !allExpanded;
                    });
                    return newState;
                  })}
                  className="text-red-600 hover:text-red-800 text-lg font-bold w-6 h-6 flex items-center justify-center"
                >
                  {urgentOpportunities.every(opp => expandedUrgent[opp.id]) ? '∑' : '+'}
                </button>
                <button
                  onClick={() => {
                    const newDismissed = new Set(dismissedUrgent);
                    urgentOpportunities.forEach(opp => newDismissed.add(opp.id));
                    setDismissedUrgent(newDismissed);
                  }}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {urgentOpportunities
                .filter(opp => !dismissedUrgent.has(opp.id))
                .map((opportunity) => {
                const daysLeft = Math.ceil((new Date(opportunity.bidDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpanded = expandedUrgent[opportunity.id];
                
                return (
                  <div key={opportunity.id} className="bg-white rounded-lg border border-red-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-red-900 text-lg">{opportunity.company}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          daysLeft <= 3 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </span>
                        <a 
                          href={opportunity.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Source
                        </a>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-900">Due: {formatDate(opportunity.bidDueDate)}</div>
                        {opportunity.publishedDate && (
                          <div className="text-xs text-gray-600">Published: {formatDate(opportunity.publishedDate)}</div>
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-t border-red-100 pt-3">
                        <p className="text-sm text-gray-700">{opportunity.catalyst}</p>
                        <p className="text-sm text-gray-700"><strong>Contact:</strong> {opportunity.contact}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
       
        <UnifiedSearchButton 
          onProspectsFound={(prospects, searchResults) => {
            setProspects(prevProspects => [...prevProspects, ...prospects]);
          }}
        />
          
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('prospects')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'prospects'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prospects ({prospects.length})
          </button>
          <button
            onClick={() => setActiveTab('removed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'removed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Removed ({removedProspects.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sources'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Industry Sources ({industrySources.length})
          </button>
          <button
            onClick={() => setActiveTab('external')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'external'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            External Tools ({externalLinks.length})
          </button>
        </div>

        {/* Prospects Tab */}
        {activeTab === 'prospects' && (
          <div>
            {/* Query Builder */}
            {showQueryBuilder && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-900">Advanced Search Configuration</h3>
                  <button
                    onClick={() => setShowQueryBuilder(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Hide Details
                  </button>
                </div>
                
                {/* Regional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-white rounded border">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region Selection</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        if (e.target.value !== 'europe') {
                          setSelectedEuropeCountries([]);
                        }
                      }}
                      className="w-full border rounded p-2 bg-white"
                    >
                      <option value="north-america">North America (Default)</option>
                      <option value="europe">Europe</option>
                      <option value="both">North America & Europe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Standards</label>
                    <input
                      type="text"
                      value={tempStandards}
                      onChange={(e) => setTempStandards(e.target.value)}
                      placeholder="e.g. EN 13501, DIN 4102"
                      className="w-full border rounded p-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      European standards: EN 13501, DIN 4102, BS 476
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prospect Count</label>
                    <select
                      value={queryParams.prospectCount}
                      onChange={(e) => setQueryParams(prev => ({
                        ...prev,
                        prospectCount: parseInt(e.target.value)
                      }))}
                      className="w-full border rounded p-2 bg-white"
                    >
                      <option value="5">5 prospects</option>
                      <option value="10">10 prospects</option>
                      <option value="15">15 prospects</option>
                      <option value="20">20 prospects</option>
                    </select>
                  </div>
                </div>

                {/* European Countries Selection */}
                {(selectedRegion === 'europe' || selectedRegion === 'both') && (
                  <div className="mb-4 p-4 bg-white rounded border">
                    <label className="block text-sm font-medium text-gray-700 mb-2">European Countries</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={selectedEuropeCountries.length === europeCountries.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEuropeCountries([...europeCountries]);
                            } else {
                              setSelectedEuropeCountries([]);
                            }
                          }}
                        />
                        All Countries
                      </label>
                      {europeCountries.map(country => (
                        <label key={country} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedEuropeCountries.includes(country)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEuropeCountries(prev => [...prev, country]);
                              } else {
                                setSelectedEuropeCountries(prev => prev.filter(c => c !== country));
                              }
                            }}
                          />
                          {country}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Generated AI Query</h4>
                    <button
                      onClick={copyQuery}
                      className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      <Copy size={14} />
                      Copy Query
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 max-h-40 overflow-y-auto">
                    {generateQuery()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-center mb-6">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search companies, contacts, locations..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                  className="border rounded-lg px-3 py-2 w-64"
                />
              </div>
              
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="Funding">Funding</option>
                <option value="Green Cert">Green Cert</option>
                <option value="Catalyst">Catalyst</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({...prev, dateRange: e.target.value}))}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">All Dates</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
              </select>

              <div className="ml-auto flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {filteredProspects.length} prospects found
                </div>
                <div className="text-xs text-gray-500">
                  Duplicate detection: Company + Contact + Catalyst
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredProspects.map((prospect) => (
                <div key={prospect.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{prospect.company}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prospect.type === 'Funding' ? 'bg-green-100 text-green-800' :
                          prospect.type === 'Green Cert' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {prospect.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {prospect.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {prospect.location}
                        </div>
                        {prospect.bidDueDate && (
                          <div className="flex items-center gap-1">
                            <span className="text-red-600">⏰</span>
                            <span className="text-red-600 font-medium">Due: {prospect.bidDueDate}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 mb-2"><strong>Contact:</strong> {prospect.contact}</p>
                      {prospect.email && <p className="text-sm text-gray-600">📧 {prospect.email}</p>}
                      {prospect.phone && <p className="text-sm text-gray-600">📞 {prospect.phone}</p>}
                    </div>
                    
                    <div className="flex gap-2">
                      <a 
                        href={prospect.source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink size={14} />
                        Source
                      </a>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove "${prospect.company}" from active prospects?`)) {
                            removeProspect(prospect.id);
                          }
                        }}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm bg-red-50 px-2 py-1 rounded"
                      >
                        ×
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Catalyst/Funding</h4>
                      <p className="text-gray-700 text-sm">{prospect.catalyst}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Equipment Fit</h4>
                      <p className="text-gray-700 text-sm">{prospect.fit}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Reasoning</h4>
                      <p className="text-gray-700 text-sm">{prospect.reasoning}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProspects.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No prospects found matching your criteria.</p>
                <p className="text-sm">Try using the unified AI search above.</p>
              </div>
            )}
          </div>
        )}

        {/* Removed Prospects Tab */}
        {activeTab === 'removed' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Removed Prospects</h2>
                <p className="text-gray-600 text-sm">Prospects that have been removed from the active list</p>
              </div>
              {removedProspects.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Reinstate all ${removedProspects.length} removed prospects?`)) {
                      removedProspects.forEach(prospect => reinstateProspect(prospect.id));
                    }
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reinstate All
                </button>
              )}
            </div>

            {removedProspects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No removed prospects.</p>
                <p className="text-sm">Prospects you remove from the active list will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {removedProspects.map((prospect) => (
                  <div key={prospect.id} className="bg-gray-50 border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-700">{prospect.company}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prospect.type === 'Funding' ? 'bg-green-100 text-green-700' :
                            prospect.type === 'Green Cert' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {prospect.type}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Removed
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {prospect.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {prospect.location}
                          </div>
                          <div>Removed: {prospect.removedDate}</div>
                        </div>

                        <p className="text-gray-600 mb-2"><strong>Contact:</strong> {prospect.contact}</p>
                        <p className="text-gray-600 text-sm">{prospect.catalyst}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <a 
                          href={prospect.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink size={14} />
                          Source
                        </a>
                        <button
                          onClick={() => {
                            if (window.confirm(`Reinstate "${prospect.company}" to active prospects?`)) {
                              reinstateProspect(prospect.id);
                            }
                          }}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm bg-green-50 px-2 py-1 rounded"
                        >
                          ↻
                          Reinstate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Industry Sources Tab */}
        {activeTab === 'sources' && (
          <div>
            {sitesNeedingCheck.length > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-orange-800">
                      📅 Sites Ready for Monitoring Check
                    </h3>
                    <p className="text-orange-700 text-sm">
                      {sitesNeedingCheck.length} source{sitesNeedingCheck.length > 1 ? 's' : ''} scheduled for review
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sitesNeedingCheck.map((site) => (
                    <div key={site.id} className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-orange-900">{site.name}</h4>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {site.monitorFrequency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Monitor for: {site.monitorsFor}</p>
                      <div className="flex gap-2">
                        <a 
                          href={site.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink size={12} />
                          Check Site
                        </a>
                        <button
                          onClick={() => {
                            const findings = prompt(`What did you find on ${site.name}?`);
                            if (findings !== null) recordSiteCheck(site.id, findings);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          ✓ Mark Checked
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {industrySources.map((source) => (
                <div key={source.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{source.name}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {source.monitorFrequency}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-gray-800 mb-2">Monitoring Details</h4>
                        <p className="text-sm text-gray-700 mb-2"><strong>Monitors for:</strong> {source.monitorsFor}</p>
                        <p className="text-sm text-gray-700 mb-2"><strong>Key terms:</strong> {source.keySearchTerms}</p>
                        <p className="text-sm text-gray-700"><strong>Last findings:</strong> {source.lastFindings}</p>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-800 mb-2">AI Tools Using This Source</h4>
                        <div className="flex flex-wrap gap-2">
                          {source.aiToolsUsing.map((tool, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-800 mb-2">Specific Pages to Monitor</h4>
                        <div className="space-y-1">
                          {source.specificPages.map((page, index) => (
                            <a 
                              key={index}
                              href={page} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <ExternalLink size={12} />
                              {page}
                            </a>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div>Last Checked: {source.lastScraped}</div>
                        <div>Next Check: {source.nextCheck}</div>
                        <div>Prospects Found: {source.prospectCount}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const findings = prompt(`What did you find on ${source.name}?`);
                        if (findings !== null) recordSiteCheck(source.id, findings);
                      }}
                      className="flex items-center gap-2 bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                    >
                      ✓ Check Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Tools Tab */}
        {activeTab === 'external' && <EnhancedExternalToolsTab />}

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Import - AI Results</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                    <h4 className="font-medium text-green-800">Ready for AI Results!</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Copy the CSV results from AI tools and paste below. Auto-detects duplicates and tracks sources.
                  </p>
                </div>
                
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your CSV results here..."
                  className="w-full h-64 border rounded-lg p-3 text-sm font-mono"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Expected format: Date,Published Date,Bid Due Date,Company,Contact,Location,Catalyst/Funding,Fit,Reasoning,Type
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={importCSV}
                    className="px-6 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                  >
                    Import Prospects
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FireSafetyProspectsApp;
