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

/* tslint:disable:max-file-line-count */

import assert = require("power-assert");
import {
    atChannel,
    atEveryone,
    atHere,
    Attachment,
    bold,
    channel,
    codeBlock,
    codeLine,
    escape,
    italic,
    listItem,
    render,
    SlackMessage,
    strikethrough,
    url,
    user,
} from "../lib/SlackMessages";

describe("SlackMessages", () => {

    describe("Message rendering", () => {
        const issue = {
            number: 484,
            title: "This issue has <unsafe> characters & stuff",
            body: "This is a very important issue with <unsafe> characters & stuff",
            repo: {
                owner: "atomisthq",
                name: "bot-service",
            },
            url: "https://github.com/atomisthq/bot-service/issues/484",
        };

        describe("Given simple message", () => {
            const msg = { text: "This is some message" };

            it("should render JSON", () => {
                const rendered = render(msg);
                assert.strictEqual(rendered, "{\"text\":\"This is some message\"}");
            });

            it("should be able to parse JSON back", () => {
                const parsed = JSON.parse(render(msg));
                assert.deepEqual(parsed, msg);
            });
        });

        describe("Given simple message with quotes and slashes", () => {
            const msg = { text: "This is \"some\" \\message" };

            it("should render JSON with escaped quotes", () => {
                const rendered = render(msg);
                assert.strictEqual(rendered, "{\"text\":\"This is \\\"some\\\" \\\\message\"}");
            });

            it("should be able to parse JSON back", () => {
                const parsed = JSON.parse(render(msg));
                assert.deepEqual(parsed, msg);
            });
        });

        describe("Given message with attachments and actions", () => {
            const ghUser = {
                url: "https://github.com/tanya-coding",
                name: "tanya-coding",
            };
            const msg: SlackMessage = {
                text: `${url(ghUser.url, "@" + ghUser.name)} opened issue: ${url(issue.url, issue.title)}`,
                attachments: [
                    {
                        text: escape(issue.body),
                        fallback: escape(issue.title),
                        mrkdwn_in: ["text"], // eslint-disable-line @typescript-eslint/camelcase
                        actions: [
                            {
                                text: "Close issue",
                                type: "button",
                                name: "closeissue",
                                value: "somebuttonid",
                            },
                        ],
                    },
                ],
            };

            it("should render JSON", () => {
                assert.strictEqual(render(msg),
                    "{\"text\":\"<https://github.com/tanya-coding|@tanya-coding> opened issue: " +
                    "<https://github.com/atomisthq/bot-service/issues/484|This issue has &lt;unsafe&gt; " +
                    "characters &amp; stuff>\",\"attachments\":[{\"text\":\"This is a very important issue " +
                    "with &lt;unsafe&gt; characters &amp; stuff\",\"fallback\":\"This issue has &lt;unsafe&gt; " +
                    "characters &amp; stuff\",\"mrkdwn_in\":[\"text\"],\"actions\":" +
                    "[{\"text\":\"Close issue\",\"type\":\"button\",\"name\":\"closeissue\"," +
                    "\"value\":\"somebuttonid\"}],\"callback_id\":\"cllbck1\"}]}",
                );
            });

            it("should initialize callback_id when not provided", () => {
                const rendered = JSON.parse(render(msg));
                for (const att of rendered.attachments) {
                    assert(att.callback_id);
                }
            });

            it("should be able to parse JSON back", () => {
                JSON.parse(render(msg));
            });
        });

        describe("Given message with multiple attachments containing actions", () => {
            it("should assign unique callback_id to each attachment", () => {
                const attachments: Attachment[] = [];
                for (let i = 0; i++; i < 20) {
                    attachments.push({
                        text: "test",
                        fallback: "test",
                        actions: [
                            {
                                name: "test",
                                type: "button",
                                text: "Test",
                                value: "somebuttonid",
                            },
                        ],
                    });
                }
                const msg = { attachments };

                const rendered = JSON.parse(render(msg));
                const ids: string[] = [];
                for (const att of rendered.attachments) {
                    assert(att.callback_id);
                    if (ids.indexOf(att.callback_id) < 0) {
                        ids.push(att.callback_id);
                    }
                }
                assert.strictEqual(ids.length, rendered.attachments.length,
                    "All callback ids should be unique");
            });
        });

        describe("Given message with attachments containing actions and some having callback_id specified", () => {
            it("should leave specified callback_id as is when it is not undefined or null", () => {
                const msg = {
                    attachments: [
                        {
                            text: "test",
                            fallback: "test",
                            actions: [
                                {
                                    name: "test",
                                    type: "button",
                                    text: "Test",
                                    value: "somebuttonid",
                                },
                            ],
                        },
                        {
                            callback_id: "custom-id", // eslint-disable-line @typescript-eslint/camelcase
                            text: "test",
                            fallback: "test",
                            actions: [
                                {
                                    name: "test",
                                    type: "button",
                                    text: "Test",
                                    value: "somebuttonid",
                                },
                            ],
                        },
                        {
                            callback_id: undefined, // eslint-disable-line @typescript-eslint/camelcase
                            text: "test",
                            fallback: "test",
                            actions: [
                                {
                                    name: "test",
                                    type: "button",
                                    text: "Test",
                                    value: "somebuttonid",
                                },
                            ],
                        },
                        {
                            callback_id: undefined, // eslint-disable-line @typescript-eslint/camelcase
                            text: "test",
                            fallback: "test",
                            actions: [
                                {
                                    name: "test",
                                    type: "button",
                                    text: "Test",
                                    value: "somebuttonid",
                                },
                            ],
                        },
                        {
                            text: "test",
                            fallback: "test",
                        },
                    ],
                };

                const rendered = JSON.parse(render(msg as any));
                assert.strictEqual(rendered.attachments[1].callback_id, "custom-id",
                    "Will preserve callback_id specified by user");
                assert(rendered.attachments[0].callback_id,
                    "Will assign callback_id when not specified");
                assert(rendered.attachments[2].callback_id,
                    "Will assign callback_id when specified but set to undefined");
                assert(rendered.attachments[3].callback_id,
                    "Will assign callback_id when specified but set to null");
                assert(rendered.attachments[4].callback_id === undefined,
                    "Will not assign callback_id when attachment does not have any actions");
            });
        });

    });

    describe("Slack character escaping", () => {
        it("will escape <, >, &", () => {
            assert.strictEqual(escape("<this & that>"), "&lt;this &amp; that&gt;");
        });

        it("will escape all >", () => {
            assert.strictEqual(escape("this->and->that"), "this-&gt;and-&gt;that");
        });

        it("will return empty string when text is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(escape(null as any), "");
        });

        it("will return empty string when text is undefined", () => {
            assert.strictEqual(escape(undefined as any), "");
        });

        it("will return empty string when text is empty string", () => {
            assert.strictEqual(escape(""), "");
        });

        it("will escape characters in inline code", () => {
            const cs: Record<string, string> = { amp: "&", lt: "<", gt: ">" };
            for (const c of Object.keys(cs)) {
                const i = `Inline \`code ${cs[c]} whatnot\` should be safe`;
                const e = `Inline \`code &${c}; whatnot\` should be safe`;
                assert(escape(i) === e);
            }
        });

        it("will escape characters in code blocks", () => {
            const cs: Record<string, string> = { amp: "&", lt: "<", gt: ">" };
            for (const c of Object.keys(cs)) {
                const i = `Code blocks such as this:

\`\`\`
function first(s: string): string {
    if (s === "${cs[c]}") {
        return "${cs[c]}";
    } else {
        return \`not ${cs[c]}\`;
    }
}
\`\`\`

should be safe
`;
                const e = `Code blocks such as this:

\`\`\`
function first(s: string): string {
    if (s === "&${c};") {
        return "&${c};";
    } else {
        return \`not &${c};\`;
    }
}
\`\`\`

should be safe
`;
                assert(escape(i) === e);
            }
        });

        it("will not escape HTML entities", () => {
            const t = "&lt;this &amp; that&gt;";
            assert.strictEqual(escape(t), t);
        });

    });

    describe("Urls", () => {
        it("can render links label", () => {
            assert.strictEqual(url("http://someplace", "some place"), "<http://someplace|some place>");
        });

        it("can render links with undefined label", () => {
            assert.strictEqual(url("http://someplace", undefined), "<http://someplace>");
        });

        it("will return empty string when url is undefined", () => {
            assert.strictEqual(url(undefined as any), "");
        });

        it("will return empty string when url is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(url(null as any), "");
        });

        it("will return empty string when url is empty string", () => {
            assert.strictEqual(url(""), "");
        });
    });

    describe("User links", () => {
        it("can mention user by user ID", () => {
            assert.strictEqual(user("U123"), "<@U123>");
        });

        it("can mention user by user ID and name", () => {
            assert.strictEqual(user("U123", "anna"), "<@U123|anna>");
        });

        it("can mention user by user ID without name", () => {
            assert.strictEqual(user("U123", ""), "<@U123>");
        });

        it("will return empty string when userId is undefined", () => {
            assert.strictEqual(user(undefined as any), "");
        });

        it("will return empty string when userId is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(user(null as any), "");
        });

        it("will return empty string when userId is empty string", () => {
            assert.strictEqual(user(""), "");
        });
    });

    describe("Channel links", () => {
        it("can mention channel by channel ID", () => {
            assert.strictEqual(channel("C123"), "<#C123>");
        });

        it("can mention channel by channel ID and name", () => {
            assert.strictEqual(channel("C123", "general"), "<#C123|general>");
        });

        it("can mention channel by channel ID without name", () => {
            assert.strictEqual(channel("C123", ""), "<#C123>");
        });

        it("will return empty string when channelId is undefined", () => {
            assert.strictEqual(channel(undefined as any), "");
        });

        it("will return empty string when channelId is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(channel(null as any), "");
        });

        it("will return empty string when channelId is empty string", () => {
            assert.strictEqual(channel(""), "");
        });
    });

    describe("Slack variables", () => {
        it("can render @channel", () => {
            assert.strictEqual(atChannel(), "<!channel>");
        });

        it("can render @here", () => {
            assert.strictEqual(atHere(), "<!here>");
        });

        it("can render @everyone", () => {
            assert.strictEqual(atEveryone(), "<!everyone>");
        });
    });

    describe("Slack Markup", () => {
        it("can render bold text", () => {
            assert.strictEqual(bold("some text"), "*some text*");
        });

        it("bold will return empty string when text is undefined", () => {
            assert.strictEqual(bold(undefined as any), "");
        });

        it("bold will return empty string when text is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(bold(null as any), "");
        });

        it("bold will return empty string when text is empty string", () => {
            assert.strictEqual(bold(""), "");
        });

        it("can render italic text", () => {
            assert.strictEqual(italic("some text"), "_some text_");
        });

        it("italic will return empty string when text is undefined", () => {
            assert.strictEqual(italic(undefined as any), "");
        });

        it("italic will return empty string when text is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(italic(null as any), "");
        });

        it("italic will return empty string when text is empty string", () => {
            assert.strictEqual(italic(""), "");
        });

        it("can render strike-through text", () => {
            assert.strictEqual(strikethrough("some text"), "~some text~");
        });

        it("strikethrough will return empty string when text is undefined", () => {
            assert.strictEqual(strikethrough(undefined as any), "");
        });

        it("strikethrough will return empty string when text is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(strikethrough(null as any), "");
        });

        it("strikethrough will return empty string when text is empty string", () => {
            assert.strictEqual(strikethrough(""), "");
        });

        it("can render single line code block", () => {
            assert.strictEqual(codeLine("some text"), "`some text`");
        });

        it("codeLine will return empty string when text is undefined", () => {
            assert.strictEqual(codeLine(undefined as any), "");
        });

        it("codeLine will return empty string when text is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(codeLine(null as any), "");
        });

        it("codeLine will return empty string when text is empty string", () => {
            assert.strictEqual(codeLine(""), "");
        });

        it("can render multiline line code block", () => {
            assert.strictEqual(codeBlock("some text"), "```some text```");
        });

        it("codeBlock will return empty string when text is undefined", () => {
            assert.strictEqual(codeBlock(undefined as any), "");
        });

        it("codeBlock will return empty string when text is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(codeBlock(null as any), "");
        });

        it("codeBlock will return empty string when text is empty string", () => {
            assert.strictEqual(codeBlock(""), "");
        });

        it("can render list item", () => {
            assert.strictEqual(listItem("some text"), "• some text");
        });

        it("listItem will return empty string when text is undefined", () => {
            assert.strictEqual(listItem(undefined as any), "");
        });

        it("listItem will return empty string when text is null", () => {
            /* tslint:disable-next-line:no-null-keyword */
            assert.strictEqual(listItem(null as any), "");
        });

        it("listItem will return empty string when text is empty string", () => {
            assert.strictEqual(listItem(""), "");
        });
    });

});
