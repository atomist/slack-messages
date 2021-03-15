/*
 * Copyright © 2021 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { splitProcessor } from "./splitProcessor";

/**
 * Try to handle adjacent HTML and Markdown elements that cannot be
 * adjacent in Slack markup.  Used as the function argument of
 * replace.
 *
 * @param match the full match
 * @param url the URL
 * @param space trailing space, if it exists
 * @return properly padded replacement string
 */
function trailingSpace(
	match: string,
	url: string,
	space: string,
	offset: number,
	full: string,
): string {
	const pad = offset + match.length === full.length ? "" : " ";
	return space ? url + space : url + pad;
}

/**
 * Replace named Markdown links with parenthesized links.
 *
 * @param text string which may have named Markdown links
 * @return string with explicit links
 */
export function convertNamedLinks(text: string): string {
	const namedLinksRegExp = /^\[(.+?)\]:\s*(https?:\/\/\S+).*\n/gm;
	let matches: string[] | null;
	const links: any = {};
	while ((matches = namedLinksRegExp.exec(text))) {
		// eslint-disable-line no-cond-assign
		const name = matches[1];
		const url = matches[2];
		links[name] = url;
	}
	let linked: string = text;
	for (const n of Object.keys(links)) {
		const u = links[n];
		const nameRegExp = new RegExp(
			`\\[(.+?)\\]\\[${n}\\]|\\[${n}\\]\\[\\]`,
			"g",
		);
		linked = linked.replace(nameRegExp, (m, ln) => {
			const linkName = ln ? ln : n;
			return `[${linkName}](${u})`;
		});
	}
	return linked.replace(namedLinksRegExp, "");
}

/**
 * Replace <img> tags with just the image URL.
 *
 * @param text string which may have img tags
 * @return string with img tags replaced
 */
export function convertInlineImages(text: string): string {
	const regex = /(?:&lt;|<)img\s[\S\s]*?\bsrc="(\S+?)"[\S\s]*?(?:&gt;|>)(\s?)/g;
	return text.replace(regex, trailingSpace);
}

/**
 * Replace Markdown image links with just the image URL.
 *
 * @param text string with Markdown
 * @return string with image URLs
 */
export function convertImageLinks(text: string): string {
	return text.replace(/!\[.*?\]\((.+?)\)(\s?)/g, trailingSpace);
}

/**
 * Replace Markdown links with Slack markup links.
 *
 * @param text string with Markdown
 * @return string with Slack markup
 */
export function convertLinks(text: string): string {
	return text.replace(/\[([^\]]+?)\]\((.+?)\)/g, "<$2|$1>");
}

/**
 * Replace Markdown bold, italic, and unordered lists with their Slack
 * markup equivalent.
 *
 * @param text string with Markdown
 * @return string with Slack markup
 */
export function convertFormat(text: string): string {
	return text
		.replace(/^(\s*)[-*](\s+)/gm, "$1•$2")
		.replace(/(\*|_)\1(\S|\S.*?\S)\1\1(?!\1)/g, "<bdmkd>$2<bdmkd>")
		.replace(/(\*|_)(?!\1)(\S|\S.*?\S)\1(?!\1)/g, "<itmkd>$2<itmkd>")
		.replace(/<bdmkd>/g, "*")
		.replace(/<itmkd>/g, "_")
		.replace(/^([#]+)\s+([\S ]+)$/gm, `*$2*`);
}

/**
 * Convert sections of text from GitHub-flavored Markdown to Slack
 * message markup.  This function should not be passed inline code or
 * code blocks.  The ordering of the functions called is significant.
 *
 * @param text string containing Markdown
 * @return string converted to Slack markup
 */
function convertMarkdown(text: string): string {
	const relinked = convertLinks(
		convertImageLinks(convertInlineImages(convertNamedLinks(text))),
	);
	const urlSplitter = /(<.*>|https?:\/\/\S+)/g;
	return splitProcessor(relinked, convertFormat, urlSplitter);
}

/** Provide a unique identifier for later replacement. */
function codeTag(i: number): string {
	return `%.%CODE_PROCESSOR_CODE${i}%.%`;
}

/**
 * Transform everything but the interior of inline code segments,
 * i.e., \`code\`, but still be able to process elements that wrap
 * around inlide code formatting.
 *
 * @param text input string
 * @param transform function that takes the whole string with inline
 *                  code segments "hidden" and performs transformation
 * @return transformed string with unchanged inline code segments
 */
function codeProcessor(text: string): string {
	const hunks = text.split(/(`.*?`)/);
	const codes = new Array<string>(hunks.length);
	for (let i = 1; i < hunks.length; i += 2) {
		codes[i] = hunks[i];
		hunks[i] = codeTag(i);
	}
	const transformed = convertMarkdown(hunks.join(""));
	let restored = transformed;
	for (let i = 1; i < hunks.length; i += 2) {
		restored = restored.replace(codeTag(i), codes[i]);
	}
	return restored;
}

/**
 * Convert GitHub-flavored Markdown to Slack message markup.  This is
 * not a complete implementation of a Markdown parser, but it does its
 * level best.
 *
 * @param text string containing markdown
 * @return string with Slack markup
 */
export function githubToSlack(text: string): string {
	const codeBlock = /(```[\S\s]*?```(?!`))/g;
	return splitProcessor(text, codeProcessor, codeBlock);
}
