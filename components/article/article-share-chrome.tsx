"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BiSearch } from "react-icons/bi";

export function ArticleShareChrome() {
	const [query, setQuery] = useState("");
	const router = useRouter();

	const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const value = query.trim();
		router.push(value ? `/?q=${encodeURIComponent(value)}` : "/");
	};

	return (
		<>
			<form className="article-share-search" onSubmit={submitSearch} role="search">
				<BiSearch aria-hidden="true" />
				<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索站内内容" aria-label="搜索站内内容" />
				<button type="submit">搜索</button>
			</form>
		</>
	);
}
