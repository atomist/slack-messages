/*
 * Copyright © 2020 Atomist, Inc.
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
 * Type defining the MIME types that the Slack message API accepts.
 */
export type MessageMimeType =
	| "application/x-atomist-slack+json"
	| "application/x-atomist-slack-file+json"
	| "text/plain"
	| "application/json";

/**
 * Helper constants for the MIME types the Slack message API accepts.
 */
export const MessageMimeTypes: { [key: string]: MessageMimeType } = {
	SlackJson: "application/x-atomist-slack+json",
	SlackFileJson: "application/x-atomist-slack-file+json",
	PlainText: "text/plain",
	ApplicationJson: "application/json",
};

/**
 * Construct and render slack messages according to Slack message
 * formatting: https://api.slack.com/docs/message-formatting. Customize
 * messages with rug actions.
 */

/**
 * Encode special Slack characters and HTML entities.
 */
export function escape(text: string): string {
	if (text) {
		const entify = (i: string): string =>
			i
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");
		const htmlEntities = /(&(?:\w+|#\d+);)/;
		return splitProcessor(text, entify, htmlEntities);
	} else {
		return "";
	}
}

/**
 * Constructs slack link.
 * Label is automatically escaped.
 */
export function url(fullUrl: string, label?: string): string {
	if (fullUrl && label) {
		return `<${fullUrl}|${escape(label)}>`;
	} else if (fullUrl) {
		return `<${fullUrl}>`;
	} else {
		return "";
	}
}

/**
 * Mentions user (e.g. @anna).
 * When userName is provided will add readable user name.
 *
 * @param userId Slack user ID
 * @param userName alternative user name, which Slack seems to ignore
 * @return properly formatted Slack user mention
 */
export function user(userId: string, userName?: string): string {
	if (userId && userName) {
		return `<@${userId}|${userName}>`;
	} else if (userId) {
		return `<@${userId}>`;
	} else {
		return "";
	}
}

/**
 * Mentions channel (e.g. #general).
 * Will mention specific channel by channelId.
 * When channelName is provided will add readable channel name.
 */
export function channel(channelId: string, channelName?: string): string {
	if (channelId && channelName) {
		return `<#${channelId}|${channelName}>`;
	} else if (channelId) {
		return `<#${channelId}>`;
	} else {
		return "";
	}
}

/** Mentions @channel */
export function atChannel(): string {
	return "<!channel>";
}

/** Mentions here (@here) */
export function atHere(): string {
	return "<!here>";
}

/** Mentions everyone (@everyone) */
export function atEveryone(): string {
	return "<!everyone>";
}

/** Renders JSON representation of slack message. */
export function render(message: SlackMessage, pretty = false): string {
	if (message.attachments && message.attachments.length > 0) {
		let idx = 1;
		message.attachments.forEach(att => {
			if (att.actions && att.actions.length > 0 && !att.callback_id) {
				att.callback_id = `cllbck${idx++}`;
			}
		});
	}
	if (message.blocks && message.blocks.length > 0) {
		if (!message.text) {
			message.text = "fallback";
		}
		(message as any).blocks = JSON.stringify(message.blocks);
	}
	return JSON.stringify(message, undefined, pretty ? 2 : 0);
}

/** Render emoji by name */
export function emoji(name: string): string {
	return name ? `:${name}:` : "";
}

/** Render bold text */
export function bold(text: string): string {
	return text ? `*${text}*` : "";
}

/** Render italic text */
export function italic(text: string): string {
	return text ? `_${text}_` : "";
}

/** Render strike-through text */
export function strikethrough(text: string): string {
	return text ? `~${text}~` : "";
}

/** Render single line code block */
export function codeLine(text: string): string {
	return text ? "`" + text + "`" : "";
}

/** Render multiline code block */
export function codeBlock(text: string): string {
	return text ? "```" + text + "```" : "";
}

/** Render bullet list item */
export function listItem(item: string): string {
	return item ? `• ${item}` : "";
}

/** Represents slack message object. */
export interface SlackMessage {
	text?: string;
	attachments?: Attachment[];
	blocks?: Block[];
	unfurl_links?: boolean;
	unfurl_media?: boolean;
}

/**
 * Represent slack attachment.
 * https://api.slack.com/docs/interactive-message-field-guide#attachment_fields
 */
export interface Attachment {
	text?: string;
	fallback: string;
	mrkdwn_in?: string[];
	color?: string;
	pretext?: string;
	author_name?: string;
	author_link?: string;
	author_icon?: string;
	title?: string;
	title_link?: string;
	fields?: Field[];
	image_url?: string;
	thumb_url?: string;
	footer?: string;
	footer_icon?: string;
	ts?: number;
	actions?: Action[];
	callback_id?: string;
	attachment_type?: string;
}

/** Represents slack attachment field. */
export interface Field {
	title?: string;
	value?: string;
	short?: boolean;
}

export interface SelectOption {
	text: string;
	value: string;
}

export interface OptionGroup {
	text: string;
	options: SelectOption[];
}

export type DataSource =
	| "static"
	| "users"
	| "channels"
	| "conversations"
	| "external";

/**
 * Represents Slack action.
 * Only button is currently supported.
 */
export interface Action {
	text: string;
	name: string;
	type: ActionType;
	value?: string;
	style?: string;
	confirm?: ActionConfirmation;
	options?: SelectOption[];
	option_groups?: OptionGroup[];
	data_source?: DataSource;
}

/** Represents Slack action confirmation. */
export interface ActionConfirmation {
	title?: string;
	text: string;
	ok_text?: string;
	dismiss_text?: string;
}

export type ActionType = "button" | "select";

export interface Block {
	type:
		| "actions"
		| "context"
		| "divider"
		| "file"
		| "header"
		| "image"
		| "section";
	block_id?: string;
}

export interface ActionsBlock extends Block {
	type: "actions";
	elements: Array<
		| ButtonElement
		| CheckboxesElement
		| PlainTextElement
		| RadioButtonsElement
		| StaticOptionElement
		| UserOptionElement
		| ConversationOptionElement
		| ChannelOptionElement
		| DatePickerElement
		| OverflowElement
	>;
}

export interface ContextBlock extends Block {
	type: "context";
	elements: Array<TextObject | ImageElement>;
}

export interface DividerBlock {
	type: "divider";
}

export interface FileBlock {
	type: "file";
	external_id: string;
	source: string;
}

export interface HeaderBlock {
	type: "header";
	text: PlainTextObject;
}

export interface ImageBlock {
	type: "image";
	image_url: string;
	alt_text: string;
	title?: PlainTextObject;
}

export interface SectionBlock {
	type: "section";
	text: TextObject;
	fields?: TextObject[];
	accessory?: Element;
}

export interface Element {
	type:
		| "button"
		| "checkboxes"
		| "datepicker"
		| "image"
		| "multi_static_select"
		| "multi_users_select"
		| "multi_conversations_select"
		| "multi_channels_select"
		| "overflow"
		| "plain_text_input"
		| "radio_buttons"
		| "static_select"
		| "users_select"
		| "conversations_select"
		| "channels_select";
}

export interface TextObject {
	type: "plain_text" | "mrkdwn";
	text: string; // max 75 characters
	emoji?: boolean;
	verbatim?: boolean;
}

export interface ConfirmObject {
	title: string;
	text: string;
	confirm: string;
	deny: string;
	style: "primary" | "danger";
}

export interface PlainTextObject extends TextObject {
	type: "plain_text";
}

export interface ButtonElement extends Element {
	type: "button";
	text: PlainTextObject;
	url?: string;
	value?: string;
	style?: "primary" | "danger";
	confirm?: ConfirmObject;
}

export interface CheckboxesElement extends Element {
	type: "checkboxes";
	options: OptionObject[];
	initial_option?: OptionObject;
	confirm?: ConfirmObject;
}

export interface DatePickerElement extends Element {
	type: "datepicker";
	placeholder: PlainTextObject;
	initial_date?: string;
	confirm?: ConfirmObject;
}

export interface ImageElement extends Element {
	type: "image";
	image_url: string;
	alt_text: string;
}

export interface OverflowElement extends Element {
	type: "overflow";
	options: OptionObject[];
	confirm?: ConfirmObject;
}

export interface PlainTextElement extends Element {
	type: "plain_text_input";
	placeholder?: PlainTextObject;
	initial_value?: string;
	multiline?: boolean;
	min_length?: number;
	max_length?: number;
}

export interface RadioButtonsElement extends Element {
	type: "radio_buttons";
	options: OptionObject[];
	initial_option?: OptionObject;
	confirm?: ConfirmObject;
}

export interface OptionObject {
	text: PlainTextObject;
	value: string;
	description?: string;
	url?: string;
}

export interface StaticOptionElement extends Element {
	type: "static_select";
	placeholder: PlainTextObject;
	options?: OptionObject[];
	option_groups?: Array<{
		label: PlainTextObject;
		options: OptionObject[];
	}>;
	initial_option?: OptionObject;
	confirm?: ConfirmObject;
}

export interface UserOptionElement extends Element {
	type: "users_select";
	placeholder: PlainTextObject;
	initial_user?: string;
	confirm?: ConfirmObject;
}

export interface ConversationOptionElement extends Element {
	type: "conversations_select";
	placeholder: PlainTextObject;
	initial_conversation?: string;
	default_to_current_conversation?: boolean;
	confirm?: ConfirmObject;
	response_url_enabled?: boolean;
	filter?: {
		include?: string[];
		exclude_external_shared_channels?: boolean;
		exclude_bot_users?: boolean;
	};
}

export interface ChannelOptionElement extends Element {
	type: "channels_select";
	placeholder: PlainTextObject;
	initial_channel?: string;
	confirm?: ConfirmObject;
	response_url_enabled?: boolean;
}
