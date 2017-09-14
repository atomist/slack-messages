/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as _ from "lodash";

/**
 * Type defining the MIME types that the Slack message API accepts.
 */
export type MessageMimeType = "application/x-atomist-slack+json" | "text/plain";

/**
 * Helper constants for the MIME types the Slack message API accepts.
 */
export abstract class MessageMimeTypes {
    public static SlackJson: MessageMimeType = "application/x-atomist-slack+json";
    public static PlainText: MessageMimeType = "text/plain";
}

/**
 * Construct and render slack messages according to Slack message
 * formatting: https://api.slack.com/docs/message-formatting. Customize
 * messages with rug actions.
 */

/**
 * Escapes special Slack characters.
 */
export function escape(text: string): string {
    if (text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    } else {
        return "";
    }
}

/**
 * Constructs slack link.
 * Label is automatically escaped.
 */
export function url(fullUrl: string, label?: string) {
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
export function user(userId: string, userName?: string) {
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
export function channel(channelId: string, channelName?: string) {
    if (channelId && channelName) {
        return `<#${channelId}|${channelName}>`;
    } else if (channelId) {
        return `<#${channelId}>`;
    } else {
        return "";
    }
}

/** Mentions @channel */
export function atChannel() {
    return "<!channel>";
}

/** Mentions here (@here) */
export function atHere() {
    return "<!here>";
}

/** Mentions everyone (@everyone) */
export function atEveryone() {
    return "<!everyone>";
}

function hasItems(arr: any[] | undefined): boolean {
    return !!arr && arr.length > 0;
}

/** Renders JSON representation of slack message. */
export function render(message: SlackMessage, pretty: boolean = false): string {
    if (hasItems(message.attachments)) {
        let idx = 1;
        _.forIn(message.attachments, att => {
            if (hasItems(att.actions) && !att.callback_id) {
                att.callback_id = `cllbck${idx++}`;
            }
        });
    }
    return JSON.stringify(message, null, pretty ? 4 : 0);
}

/** Render emoji by name */
export function emoji(name: string) {
    return (name) ? `:${name}:` : "";
}

/** Render bold text */
export function bold(text: string) {
    return (text) ? `*${text}*` : "";
}

/** Render italic text */
export function italic(text: string) {
    return (text) ? `_${text}_` : "";
}

/** Render strike-through text */
export function strikethrough(text: string) {
    return (text) ? `~${text}~` : "";
}

/** Render single line code block */
export function codeLine(text: string) {
    return (text) ? "`" + text + "`" : "";
}

/** Render multiline code block */
export function codeBlock(text: string) {
    return (text) ? "```" + text + "```" : "";
}

/** Render bullet list item */
export function listItem(item: string) {
    return (item) ? `• ${item}` : "";
}

/** Represents slack message object. */
export interface SlackMessage {
    text?: string;
    attachments?: Attachment[];
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

export type DataSource = "static" | "users" | "channels" | "conversations" | "external";

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

export interface ButtonSpec {
    text: string;
    style?: string;
    confirm?: ActionConfirmation;
}

export interface IdentifiableInstruction {
    id: string;
}

export interface SelectableIdentifiableInstruction extends IdentifiableInstruction {
    id: string;
    parameterName: string;
}

export class ValidationError extends Error {
    constructor(public message: string) {
        super(message);
    }
}

/** Construct Slack button that will execute provided rug instruction. */
export function rugButtonFrom(action: ButtonSpec, command: IdentifiableInstruction): Action {
    if (!command.id) {
        throw new ValidationError(`Please provide a valid non-empty command id`);
    }
    const button: Action = {
        text: action.text,
        type: "button",
        name: "rug",
        value: command.id,
    };
    _.forOwn(action, (v, k) => {
        (button as any)[k] = v;
    });
    return button;
}

export interface SelectSpec {
    text: string;
    options: SelectOption[] | DataSource | OptionGroup[];
}

/** Construct Slack menu that will execute provided rug instruction. */
export function rugMenuFrom(action: SelectSpec, command: SelectableIdentifiableInstruction): Action {

    if (!command.id) {
        throw new ValidationError("SelectableIdentifiableInstruction must have id set");
    }

    if (!command.parameterName) {
        throw new ValidationError("SelectableIdentifiableInstruction must have parameterName set");
    }

    const select: Action = {
        text: action.text,
        type: "select",
        name: `rug::${command.id}`,
    };

    if (typeof action.options === "string") {
        select.data_source = action.options;
    } else if (action.options.length > 0) {
        const first = action.options[0] as any;
        if (first.value) {
            // then it's normal options
            select.options = action.options as SelectOption[];
        } else {
            // then it's option groups
            select.option_groups = action.options as OptionGroup[];
        }
    }

    _.forOwn(action, (v, k) => {
        if (k !== "options") {
            (select as any)[k] = v;
        }
    });
    return select;
}
