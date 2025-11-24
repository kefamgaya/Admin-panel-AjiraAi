"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Briefcase, Users, FileText, Building2, Calendar, Wallet } from "lucide-react";
import { TextInput } from "@tremor/react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  href: string;
  icon: any;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Quick navigation shortcuts
  const quickLinks: SearchResult[] = [
    { type: "page", title: "Dashboard", subtitle: "Overview and analytics", href: "/admin/dashboard", icon: Briefcase },
    { type: "page", title: "Job Seekers", subtitle: "Manage job seekers", href: "/admin/users/seekers", icon: Users },
    { type: "page", title: "Companies", subtitle: "Manage companies", href: "/admin/users/companies", icon: Building2 },
    { type: "page", title: "All Jobs", subtitle: "View all job listings", href: "/admin/jobs", icon: Briefcase },
    { type: "page", title: "Applications", subtitle: "Job applications", href: "/admin/applications", icon: FileText },
    { type: "page", title: "Interviews", subtitle: "Interview management", href: "/admin/interviews", icon: Calendar },
    { type: "page", title: "Finance", subtitle: "Credits and subscriptions", href: "/admin/finance/credits", icon: Wallet },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSearch = useDebouncedCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = quickLinks.filter(link =>
      link.title.toLowerCase().includes(lowerQuery) ||
      link.subtitle.toLowerCase().includes(lowerQuery)
    );

    setResults(filtered);
    setIsOpen(filtered.length > 0);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (href: string) => {
    router.push(href);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-64" ref={searchRef}>
      <TextInput
        icon={Search}
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (query) {
            handleSearch(query);
          } else {
            setResults(quickLinks);
            setIsOpen(true);
          }
        }}
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 max-h-96 overflow-y-auto">
          {query ? (
            results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <result.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
              </div>
            )
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Quick Links
              </div>
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(link.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <link.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {link.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {link.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

