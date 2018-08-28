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

import {
    ErrorColor,
    errorMessage,
    errorResponse,
    renderError,
    renderSuccess,
    SuccessColor,
    successMessage,
    successResponse,
    WarningColor,
    warningMessage,
    warningResponse,
} from "../lib/RugMessages";
import {
    Attachment,
    MessageMimeTypes,
    SlackMessage,
} from "../lib/SlackMessages";

import assert = require("power-assert");

describe("renderError", () => {
    describe("Given error message with special characters", () => {
        it("will render it as attachment with text unescaped", () => {
            const message = renderError("Something <bad> happened");
            assert.equal(message.body,
                // tslint:disable-next-line:max-line-length
                "{\"attachments\":[{\"text\":\"Something <bad> happened\",\"author_name\":\"Unable to run command\",\"author_icon\":\"https://images.atomist.com/rug/error-circle.png\",\"fallback\":\"Unable to run command\",\"mrkdwn_in\":[\"text\"],\"color\":\"#D94649\"}]}");
        });
    });
});

describe("renderSuccess", () => {
    describe("Given success message", () => {
        it("will render it as plain message with text unescaped", () => {
            const message = renderSuccess("Successfully ran command");
            assert.equal(message.body, "{\"text\":\"Successfully ran command\"}");
        });
    });
});

describe("Standard Messages", () => {

    it("should create an error message", () => {
        const a: Attachment = {
            fallback: "fail",
            text: "real bad",
        };
        const c = "1234567890-0987654321";
        const help = "\nPlease contact <https://atomist-community.slack.com/messages/C29GYTYDC/|Atomist support>, "
            + "providing the correlation ID below. Sorry for the inconvenience.";
        const e = {
            attachments: [{
                author_name: `Error: ${a.fallback}`,
                author_icon: "https://images.atomist.com/rug/error-circle.png",
                color: ErrorColor,
                fallback: a.fallback,
                footer: `Correlation ID: ${c}`,
                text: a.text + help,
                mrkdwn_in: ["text"],
            }],
        };
        assert.deepEqual(errorMessage(a, c), e);
    });

    it("should create an error message without correlation ID", () => {
        const a: Attachment = {
            fallback: "fail",
            text: "real bad",
        };
        const help = "\nPlease contact <https://atomist-community.slack.com/messages/C29GYTYDC/|Atomist support>. "
            + "Sorry for the inconvenience.";
        const e = {
            attachments: [{
                author_name: `Error: ${a.fallback}`,
                author_icon: "https://images.atomist.com/rug/error-circle.png",
                color: ErrorColor,
                fallback: a.fallback,
                text: a.text + help,
                mrkdwn_in: ["text"],
            }],
        };
        assert.deepEqual(errorMessage(a), e);
    });

    it("should create an error message with overrides", () => {
        const a: Attachment = {
            fallback: "fail",
            text: "real bad",
            color: "#000000",
            author_name: "Me",
            author_icon: "http://me.com/me.png",
            footer: "shoe",
        };
        const c = "1234567890-0987654321";
        const help = "\nPlease contact <https://atomist-community.slack.com/messages/C29GYTYDC/|Atomist support>. "
            + "Sorry for the inconvenience.";
        const e = {
            attachments: [{
                author_name: a.author_name,
                author_icon: a.author_icon,
                color: a.color,
                fallback: a.fallback,
                footer: a.footer,
                text: a.text + help,
                mrkdwn_in: ["text"],
            }],
        };
        assert.deepEqual(errorMessage(a, c), e);
    });

    it("should create a success message", () => {
        const a: Attachment = {
            fallback: "good",
            text: "nice",
        };
        const e = {
            attachments: [{
                author_name: `Success: ${a.fallback}`,
                author_icon: "https://images.atomist.com/rug/check-circle.png",
                color: SuccessColor,
                fallback: a.fallback,
                text: a.text,
                mrkdwn_in: ["text"],
            }],
        };
        assert.deepEqual(successMessage(a), e);
    });

    it("should create a success message with overrides", () => {
        const a: Attachment = {
            fallback: "good",
            text: "nice",
            color: "#BBBBBB",
            author_name: "You",
            author_icon: "http://you.com/you.png",
            footer: "shoe",
        };
        const e = {
            attachments: [{
                author_name: a.author_name,
                author_icon: a.author_icon,
                color: a.color,
                fallback: a.fallback,
                footer: a.footer,
                text: a.text,
                mrkdwn_in: ["text"],
            }],
        };
        assert.deepEqual(successMessage(a), e);
    });

    it("should create a warning message", () => {
        const a: Attachment = {
            fallback: "danger!",
            text: "not terrible, but not great",
        };
        const e = {
            attachments: [{
                author_name: `Warning: ${a.fallback}`,
                author_icon: "https://images.atomist.com/rug/error-square.png",
                color: WarningColor,
                fallback: a.fallback,
                text: a.text,
                mrkdwn_in: ["text"],
            }],
        };
        assert.deepEqual(warningMessage(a), e);
    });

    it("should create a warning message with overrides", () => {
        const a: Attachment = {
            fallback: "Ahhhh",
            text: "not rock bottom yet",
            color: "#123456",
            author_name: "We",
            author_icon: "http://we.com/we.png",
            footer: "shoe",
        };
        const e = {
            attachments: [{
                author_name: a.author_name,
                author_icon: a.author_icon,
                color: a.color,
                fallback: a.fallback,
                footer: a.footer,
                text: a.text,
                mrkdwn_in: ["text"],
            }],
        };
        assert.deepEqual(warningMessage(a), e);
    });

});

describe("Standard Responses", () => {

    it("should create an error response message", () => {
        const a: Attachment = {
            fallback: "fail",
            text: "real bad",
        };
        const c = "1234567890-0987654321";
        const help = "\nPlease contact <https://atomist-community.slack.com/messages/C29GYTYDC/|Atomist support>, "
            + "providing the correlation ID below. Sorry for the inconvenience.";
        const e = {
            attachments: [{
                author_name: `Error: ${a.fallback}`,
                author_icon: "https://images.atomist.com/rug/error-circle.png",
                color: ErrorColor,
                fallback: a.fallback,
                footer: `Correlation ID: ${c}`,
                text: a.text + help,
                mrkdwn_in: ["text"],
            }],
        };
        const response = errorResponse(a, c);
        assert(response.contentType === MessageMimeTypes.SlackJson);
        const body = JSON.parse(response.body) as SlackMessage;
        assert.deepEqual(body, e);
    });

    it("should create a success response message", () => {
        const a: Attachment = {
            fallback: "good",
            text: "nice",
        };
        const e = {
            attachments: [{
                author_name: `Success: ${a.fallback}`,
                author_icon: "https://images.atomist.com/rug/check-circle.png",
                color: SuccessColor,
                fallback: a.fallback,
                text: a.text,
                mrkdwn_in: ["text"],
            }],
        };
        const response = successResponse(a);
        assert(response.contentType === MessageMimeTypes.SlackJson);
        const body = JSON.parse(response.body) as SlackMessage;
        assert.deepEqual(body, e);
    });

    it("should create a warning response message", () => {
        const a: Attachment = {
            fallback: "good",
            text: "nice",
        };
        const e = {
            attachments: [{
                author_name: `Warning: ${a.fallback}`,
                author_icon: "https://images.atomist.com/rug/error-square.png",
                color: WarningColor,
                fallback: a.fallback,
                text: a.text,
                mrkdwn_in: ["text"],
            }],
        };
        const response = warningResponse(a);
        assert(response.contentType === MessageMimeTypes.SlackJson);
        const body = JSON.parse(response.body) as SlackMessage;
        assert.deepEqual(body, e);
    });

});
