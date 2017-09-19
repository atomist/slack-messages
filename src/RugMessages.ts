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

import { deprecated } from "deprecated-decorator";

import {
    Attachment,
    MessageMimeType,
    MessageMimeTypes,
    render,
    SlackMessage,
    url,
} from "./SlackMessages";

export const ErrorColor = "#D94649";
export const SuccessColor = "#45B254";
export const WarningColor = "#FFCC00";

export interface RugCoordinate {
    readonly name: string;
    readonly group: string;
    readonly artifact: string;
}

export type InstructionKind = "generate" | "edit" | "execute" | "respond" | "command";

export interface Instruction<T extends InstructionKind> {
    readonly name: string | RugCoordinate;
    readonly parameters?: {};
    readonly kind: T;
}

// because in a message, we may not know project name yet
export interface PresentableGenerate extends Instruction<"generate"> {
    project?: string;
}

// because in a message, we may not know project name yet
export interface PresentableEdit extends Instruction<"edit"> {
    project?: string;
}

export class Identifiable<T extends InstructionKind> {
    public instruction: Instruction<T> | PresentableGenerate | PresentableEdit;
    public parameterName?: string;
    public id?: string;
}

export type MessageKind = "response" | "directed";

export interface Message<T extends MessageKind> {
    kind: T;
}

export class UserAddress {
    constructor(public username: string) { }
}

export class ChannelAddress {
    constructor(public channelName: string) { }
}

export type MessageAddress = UserAddress | ChannelAddress;

/**
 * A Rug message parent class for response and direct messages.
 */
export abstract class LocallyRenderedMessage<T extends MessageKind> implements Message<T> {
    public kind: T;

    public contentType: MessageMimeType = MessageMimeTypes.PlainText;
    public body: string;
    public instructions: Array<Identifiable<any>> = [];
}

/**
 * Represents the response to the bot from a command.
 */
export class ResponseMessage extends LocallyRenderedMessage<"response"> {
    public kind: "response" = "response";

    constructor(body: string, contentType?: MessageMimeType) {
        super();
        this.body = body;
        if (contentType) {
            this.contentType = contentType;
        }
    }
}

/**
 * Message unrelated to extant communications with the bot.
 */
export class DirectedMessage extends LocallyRenderedMessage<"directed"> {

    public kind: "directed" = "directed";

    public usernames: string[] = [];
    public channelNames: string[] = [];

    constructor(body: string, address: MessageAddress, contentType?: MessageMimeType) {
        super();
        this.body = body;
        if (contentType) {
            this.contentType = contentType;
        }
        this.addAddress(address);
    }

    public addAddress(address: MessageAddress): this {
        if (address instanceof UserAddress) {
            this.usernames.push(address.username);
        } else {
            this.channelNames.push(address.channelName);
        }
        return this;
    }

    public addAction(instruction: Identifiable<any>): this {
        this.instructions.push(instruction);
        return this;
    }
}

interface StandardAttachmentDefaults {
    kind: string;
    image: string;
    color: string;
}

/**
 * Populate standard message attachment with defaults if value not set.
 *
 * @param a attachment to ensure populated, possibly modified by this function
 * @param sm default values
 * @return populated attachment
 */
function standardAttachment(a: Attachment, sm: StandardAttachmentDefaults): Attachment {
    a.fallback = a.fallback || `${sm.kind}!`;
    a.text = a.text || a.fallback;
    a.author_name = a.author_name || `${sm.kind}: ${a.fallback}`;
    a.author_icon = a.author_icon || sm.image;
    a.color = a.color || sm.color;
    a.mrkdwn_in = a.mrkdwn_in || ["text"];
    return a;
}

/**
 * Create a standard Slack error message.  The attachment should
 * contain at least a non-empty fallback property.  The text property
 * will be augmented with information about getting help.  If the text
 * property is not provided, the fallback is used as a base for the
 * fallback.  Title icons and message will be added if they are not
 * present.
 *
 * @param attachment  message content
 * @param correlationId correlation ID for transaction that failed,
 *                      which will appear in the footer if it is not already set
 * @return a Slack error message using attachments which will need to be `render`ed
 */
export function errorMessage(attachment: Attachment, correlationId?: string): SlackMessage {
    const defaults: StandardAttachmentDefaults = {
        kind: "Error",
        image: "https://images.atomist.com/rug/error-circle.png",
        color: ErrorColor,
    };
    attachment = standardAttachment(attachment, defaults);
    const supportUrl = "https://atomist-community.slack.com/messages/C29GYTYDC/";
    attachment.text += `\nPlease contact ${url(supportUrl, "Atomist support")}`;
    if (!attachment.footer && correlationId) {
        attachment.text += `, providing the correlation ID below`;
        attachment.footer = `Correlation ID: ${correlationId}`;
    }
    attachment.text += `. Sorry for the inconvenience.`;
    const message: SlackMessage = { attachments: [attachment] };
    return message;
}

/**
 * Create a standard Slack success message.  The attachment should
 * contain at least a non-empty fallback property.  If the text
 * property is not provided, the fallback is used.  Title icons and
 * message will be added if they are not present.
 *
 * @param attachment  message content
 * @return a Slack success message using attachments which will need to be `render`ed
 */
export function successMessage(attachment: Attachment): SlackMessage {
    const defaults: StandardAttachmentDefaults = {
        kind: "Success",
        image: "https://images.atomist.com/rug/check-circle.png",
        color: SuccessColor,
    };
    attachment = standardAttachment(attachment, defaults);
    const message: SlackMessage = { attachments: [attachment] };
    return message;
}

/**
 * Create a standard Slack warning message.  The attachment should
 * contain at least a non-empty fallback property.  If the text
 * property is not provided, the fallback is used.  Title icons and
 * message will be added if they are not present.
 *
 * @param attachment  message content
 * @return a Slack warning message using attachments which will need to be `render`ed
 */
export function warningMessage(attachment: Attachment): SlackMessage {
    const defaults: StandardAttachmentDefaults = {
        kind: "Warning",
        image: "https://images.atomist.com/rug/error-square.png",
        color: WarningColor,
    };
    attachment = standardAttachment(attachment, defaults);
    const message: SlackMessage = { attachments: [attachment] };
    return message;
}

/**
 * Create a Rug error ResponseMessage.  If rendering fails, a text
 * response message of attachment.fallback is returned.
 *
 * @param msg text of Slack message
 * @param correlationId correlation ID of transaction that failed
 * @return Rug error ResponseMessage
 */
export function errorResponse(attachment: Attachment, correlationId?: string): ResponseMessage {
    try {
        const slackMessage = errorMessage(attachment, correlationId);
        return new ResponseMessage(render(slackMessage), MessageMimeTypes.SlackJson);
    } catch (e) {
        const err = e as Error;
        console.error(`failed to render message '${attachment}':${err.name}:${err.message}:${err.stack}`);
        return new ResponseMessage(attachment.fallback);
    }
}

/**
 * Create a Rug success ResponseMessage.  If rendering fails, a text
 * response message of attachment.fallback is returned.
 *
 * @param msg text of Slack message
 * @return Rug success ResponseMessage
 */
export function successResponse(attachment: Attachment): ResponseMessage {
    try {
        const slackMessage = successMessage(attachment);
        return new ResponseMessage(render(slackMessage), MessageMimeTypes.SlackJson);
    } catch (e) {
        const err = e as Error;
        console.error(`failed to render message '${attachment}':${err.name}:${err.message}:${err.stack}`);
        return new ResponseMessage(attachment.fallback);
    }
}

/**
 * Create a Rug warning ResponseMessage.  If rendering fails, a text
 * response message of attachment.fallback is returned.
 *
 * @param msg text of Slack message
 * @return Rug warning ResponseMessage
 */
export function warningResponse(attachment: Attachment): ResponseMessage {
    try {
        const slackMessage = warningMessage(attachment);
        return new ResponseMessage(render(slackMessage), MessageMimeTypes.SlackJson);
    } catch (e) {
        const err = e as Error;
        console.error(`failed to render message '${attachment}':${err.name}:${err.message}:${err.stack}`);
        return new ResponseMessage(attachment.fallback);
    }
}

/* tslint:disable:no-shadowed-variable */
export const renderError = deprecated({
    alternative: "errorResponse",
    version: "0.8.0",
}, function renderError(msg: string, correlationId?: string): ResponseMessage {
    try {
        const error: Attachment = {
            text: msg,
            author_name: "Unable to run command",
            author_icon: "https://images.atomist.com/rug/error-circle.png",
            fallback: "Unable to run command",
            mrkdwn_in: ["text"],
            color: "#D94649",
        };
        if (correlationId) {
            error.footer = `Correlation ID: ${correlationId}`;
        }
        const slackMessage = {
            attachments: [error],
        };
        return new ResponseMessage(render(slackMessage), MessageMimeTypes.SlackJson);
    } catch (ex) {
        return new ResponseMessage(`Error rendering error message ${ex}`);
    }
});

export const renderSuccess = deprecated({
    alternative: "successResponse",
    version: "0.8.0",
}, function renderSuccess(msg: string): ResponseMessage {
    try {
        const slackMessage = { text: msg };
        return new ResponseMessage(render(slackMessage), MessageMimeTypes.SlackJson);
    } catch (ex) {
        return renderError(`Error rendering success message ${ex}`);
    }
});
