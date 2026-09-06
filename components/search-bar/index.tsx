"use client";

import type { Key } from "@heroui/react";
import { Label, SearchField } from "@heroui/react";
import { useState, type CSSProperties } from "react";
import { recordVisit } from "@/hooks/use-recent-visits";
import { openSiteWithPreference } from "@/lib/client/site-link";
import { withAuthorBaiduTracking } from "@/lib/external-url";
import type { HeaderEngineState, HeaderSearchConfig } from "../header.types";
import { SearchBarEngineSelect } from "./search-bar-engine-select";
import { SearchLocalResultsPanel } from "./search-local-results-panel";
import { SearchSuggestionsPanel } from "./search-suggestions-panel";
import { useLocalSearch } from "./use-local-search";
import { useSearchEngineState } from "./use-search-engine-state";
import { useSearchInteractions } from "./use-search-interactions";
import { useSearchSuggestions } from "./use-search-suggestions";

export function SearchBar({
	config,
	engineState,
}: {
	config: HeaderSearchConfig;
	engineState?: HeaderEngineState;
}) {
	const {
		engines,
		keywords,
		keywordColor,
		keywordHoverColor,
		defaultEngine,
		enableLocal,
		enableSuggestion = false,
		enableTabFocus = true,
		placeholder,
		sites,
		showEngineSelector = true,
		layout,
	} = config;
	const searchBarStyle = layout?.searchBarStyle ?? "default";
	const [query, setQuery] = useState("");
	const { engineId, engineOptions, isLocal, setEngineId } = useSearchEngineState({
		engines,
		defaultEngine,
		enableLocal,
		engineState,
	});
	const { markSearchIndexReady, results } = useLocalSearch({
		enableLocal,
		isLocal,
		query,
		sites,
	});
	const { suggestions, clearSuggestions } = useSearchSuggestions({
		enableSuggestion,
		isLocal,
		query,
	});

	const keyboardItemCount = isLocal ? results.length : suggestions.length;
	const {
		containerRef,
		inputRef,
		inputWrapRef,
		activeIndex,
		isOpen,
		setIsOpen,
		handleInputKeyDown,
		handleInputKeyDownCapture,
		activateSearch,
	} = useSearchInteractions({
		enableTabFocus,
		engineId,
		engineOptions,
		setEngineId,
		keyboardItemCount,
		query,
		onActivateSearchIndex: markSearchIndexReady,
	});
	const showLocalResults = isLocal && isOpen && query.trim().length > 0;
	const showSuggestions =
		!isLocal &&
		enableSuggestion &&
		isOpen &&
		suggestions.length > 0 &&
		query.trim().length > 0;

	const runExternalSearch = (q: string) => {
		const engine = engines.find((item) => item.id === engineId);
		if (!engine) return;
		const url = withAuthorBaiduTracking(
			engine.url.replace("{query}", encodeURIComponent(q)),
		);
		if (layout?.linkTarget === "current") {
			window.location.href = url;
		} else {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	const openLocalResult = (site: (typeof results)[number]) => {
		recordVisit(site);
		void openSiteWithPreference(site, {
			linkTarget: layout?.linkTarget,
			autoUseIntranet: layout?.autoUseIntranet,
		});
		setIsOpen(false);
	};

	const openSuggestion = (label: string) => {
		setQuery(label);
		runExternalSearch(label);
		setIsOpen(false);
	};

	const handleSubmit = (value: string) => {
		const normalizedQuery = value.trim();
		if (!normalizedQuery) return;

		if (isLocal) {
			if (results.length > 0) {
				openLocalResult(results[Math.max(activeIndex, 0)] ?? results[0]);
			}
			return;
		}

		if (showSuggestions && activeIndex >= 0) {
			const selectedSuggestion = suggestions[activeIndex];
			if (selectedSuggestion) {
				openSuggestion(selectedSuggestion.label);
				return;
			}
		}

		runExternalSearch(normalizedQuery);
		setIsOpen(false);
	};

	return (
		<div ref={inputWrapRef} className={`search-bar search-bar--${searchBarStyle} flex w-full items-start gap-2`}>
			{showEngineSelector ? (
				<SearchBarEngineSelect
					engineId={engineId}
					engineOptions={engineOptions}
					onEngineChange={setEngineId}
				/>
			) : null}

			<div ref={containerRef} className="relative min-w-0 flex-1">
				<SearchField
					className="w-full"
					value={query}
					onChange={setQuery}
					onSubmit={handleSubmit}
					onClear={() => {
						setQuery("");
						clearSuggestions();
					}}
					onFocus={activateSearch}
				>
					<Label className="sr-only">搜索</Label>
					<SearchField.Group className="min-h-11">
						<SearchField.SearchIcon />
						<SearchField.Input
							className="w-0"
							ref={inputRef}
							placeholder={placeholder}
							onKeyDownCapture={handleInputKeyDownCapture}
							onKeyDown={handleInputKeyDown}
						/>
						<SearchField.ClearButton />
					</SearchField.Group>
				</SearchField>

				{keywords.length > 0 ? (
					<div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 text-sm">
						{keywords.map((keyword, index) => (
							<button
								key={`${keyword.label}-${index}`}
								type="button"
								className="search-keyword font-medium transition-colors hover:underline"
								style={{
									"--keyword-color": keyword.color || keywordColor || "var(--primary)",
									"--keyword-hover-color": keyword.hoverColor || keywordHoverColor || keyword.color || keywordColor || "var(--primary)",
								} as CSSProperties}
								onClick={() => {
									const label = keyword.label.trim();
									if (!label) return;
									if (keyword.url?.trim()) {
										const url = keyword.url.replace("{query}", encodeURIComponent(label));
										if (layout?.linkTarget === "current") window.location.href = url;
										else window.open(url, "_blank", "noopener,noreferrer");
										return;
									}
									handleSubmit(label);
								}}
							>
								{keyword.label}
							</button>
						))}
					</div>
				) : null}

				{showLocalResults ? (
					<SearchLocalResultsPanel
						activeIndex={activeIndex}
						layout={layout}
						onAction={(id: Key) => {
							const result = results.find(
								(item) => `${item.categoryId}-${item.url}` === id,
							);
							if (result) openLocalResult(result);
						}}
						results={results}
					/>
				) : null}

				{showSuggestions ? (
					<SearchSuggestionsPanel
						activeIndex={activeIndex}
						onAction={(id: Key) => {
							const item = suggestions.find(
								(suggestion) => String(suggestion.key) === String(id),
							);
							if (item) openSuggestion(item.label);
						}}
						suggestions={suggestions}
					/>
				) : null}
			</div>
		</div>
	);
}
