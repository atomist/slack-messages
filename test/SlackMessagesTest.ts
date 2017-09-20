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
    atChannel,
    atEveryone,
    atHere,
    bold,
    channel,
    codeBlock,
    codeLine,
    escape,
    italic,
    listItem,
    render, SlackMessage,
    strikethrough,
    url,
    user,
} from "../src/SlackMessages";

import assert = require("power-assert");

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
    const action = {
        id: "somebuttonid",
        instruction: {
            kind: "command",
            name: "CloseGitHubIssue",
            parameters: {
                issue: issue.number,
                owner: issue.repo.owner,
                repo: issue.repo.name,
            },
        },
    };

    describe("Given simple message", () => {
        const msg = { text: "This is some message" };

        it("should render JSON", () => {
            const rendered = render(msg);
            assert.equal(rendered, "{\"text\":\"This is some message\"}");
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
            assert.equal(rendered, "{\"text\":\"This is \\\"some\\\" \\\\message\"}");
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
                    mrkdwn_in: ["text"],
                    actions: [
                        {
                            text: "Close issue",
                            type: "button",
                            name: "closeissue",
                            value: "somebuttonid",
                        },
                    ],
                    callback_id: "cllbck1",
                },
            ],
        };

        it("should render JSON", () => {
            assert.equal(render(msg),
                "{\"text\":\"<https://github.com/tanya-coding|@tanya-coding> opened issue: " +
                "<https://github.com/atomisthq/bot-service/issues/484|This issue has &lt;unsafe&gt; " +
                "characters &amp; stuff>\",\"attachments\":[{\"text\":\"This is a very important issue " +
                "with &lt;unsafe&gt; characters &amp; stuff\",\"fallback\":\"This issue has &lt;unsafe&gt; " +
                "characters &amp; stuff\",\"mrkdwn_in\":[\"text\"],\"actions\":" +
                "[{\"text\":\"Close issue\",\"type\":\"button\",\"name\":\"closeissue\",\"value\":\"somebuttonid\"}]" +
                ",\"callback_id\":\"cllbck1\"}]}",
            );
        });

        it("should initialize callback_id when not provided", () => {
            const rendered = JSON.parse(render(msg));
            for (const att of rendered.attachments) {
                assert(att.callback_id != null && att.callback_id !== "");
            }
        });

        it("should be able to parse JSON back", () => {
            JSON.parse(render(msg));
        });
    });
});

describe("Slack character escaping", () => {
    it("Will escape <, >, &", () => {
        assert.equal(escape("<this & that>"), "&lt;this &amp; that&gt;");
    });

    it("Will escape all >", () => {
        assert.equal(escape("this->and->that"), "this-&gt;and-&gt;that");
    });

    it("Will return empty string when text is null", () => {
        assert.equal(escape(null as any), "");
    });

    it("Will return empty string when text is undefined", () => {
        assert.equal(escape(undefined as any), "");
    });

    it("Will return empty string when text is empty string", () => {
        assert.equal(escape(""), "");
    });
});

describe("Urls", () => {
    it("Can render links label", () => {
        assert.equal(url("http://someplace", "some place"), "<http://someplace|some place>");
    });

    it("Can render links with undefined label", () => {
        assert.equal(url("http://someplace", undefined), "<http://someplace>");
    });

    it("Will return empty string when url is undefined", () => {
        assert.equal(url(undefined as any), "");
    });

    it("Will return empty string when url is null", () => {
        assert.equal(url(null as any), "");
    });

    it("Will return empty string when url is empty string", () => {
        assert.equal(url(""), "");
    });
});

describe("User links", () => {
    it("Can mention user by user ID", () => {
        assert.equal(user("U123"), "<@U123>");
    });

    it("Can mention user by user ID and name", () => {
        assert.equal(user("U123", "anna"), "<@U123|anna>");
    });

    describe("Given blank user name", () => {
        it("Can mention user by user ID", () => {
            assert.equal(user("U123", ""), "<@U123>");
        });
    });

    it("Will return empty string when userId is undefined", () => {
        assert.equal(user(undefined as any), "");
    });

    it("Will return empty string when userId is null", () => {
        assert.equal(user(null as any), "");
    });

    it("Will return empty string when userId is empty string", () => {
        assert.equal(user(""), "");
    });
});

describe("Channel links", () => {
    it("Can mention channel by channel ID", () => {
        assert.equal(channel("C123"), "<#C123>");
    });

    it("Can mention channel by channel ID and name", () => {
        assert.equal(channel("C123", "general"), "<#C123|general>");
    });

    describe("Given blank channel name", () => {
        it("Can mention channel by channel ID", () => {
            assert.equal(channel("C123", ""), "<#C123>");
        });
    });

    it("Will return empty string when channelId is undefined", () => {
        assert.equal(channel(undefined as any), "");
    });

    it("Will return empty string when channelId is null", () => {
        assert.equal(channel(null as any), "");
    });

    it("Will return empty string when channelId is empty string", () => {
        assert.equal(channel(""), "");
    });
});

describe("Slack variables", () => {
    it("Can render @channel", () => {
        assert.equal(atChannel(), "<!channel>");
    });

    it("Can render @here", () => {
        assert.equal(atHere(), "<!here>");
    });

    it("Can render @everyone", () => {
        assert.equal(atEveryone(), "<!everyone>");
    });
});

describe("Markdown", () => {
    it("Can render bold text", () => {
        assert.equal(bold("some text"), "*some text*");
    });

    it("bold will return empty string when text is undefined", () => {
        assert.equal(bold(undefined as any), "");
    });

    it("bold will return empty string when text is null", () => {
        assert.equal(bold(null as any), "");
    });

    it("bold will return empty string when text is empty string", () => {
        assert.equal(bold(""), "");
    });

    it("Can render italic text", () => {
        assert.equal(italic("some text"), "_some text_");
    });

    it("italic will return empty string when text is undefined", () => {
        assert.equal(italic(undefined as any), "");
    });

    it("italic will return empty string when text is null", () => {
        assert.equal(italic(null as any), "");
    });

    it("italic will return empty string when text is empty string", () => {
        assert.equal(italic(""), "");
    });

    it("Can render strike-through text", () => {
        assert.equal(strikethrough("some text"), "~some text~");
    });

    it("strikethrough will return empty string when text is undefined", () => {
        assert.equal(strikethrough(undefined as any), "");
    });

    it("strikethrough will return empty string when text is null", () => {
        assert.equal(strikethrough(null as any), "");
    });

    it("strikethrough will return empty string when text is empty string", () => {
        assert.equal(strikethrough(""), "");
    });

    it("Can render single line code block", () => {
        assert.equal(codeLine("some text"), "`some text`");
    });

    it("codeLine will return empty string when text is undefined", () => {
        assert.equal(codeLine(undefined as any), "");
    });

    it("codeLine will return empty string when text is null", () => {
        assert.equal(codeLine(null as any), "");
    });

    it("codeLine will return empty string when text is empty string", () => {
        assert.equal(codeLine(""), "");
    });

    it("Can render multiline line code block", () => {
        assert.equal(codeBlock("some text"), "```some text```");
    });

    it("codeBlock will return empty string when text is undefined", () => {
        assert.equal(codeBlock(undefined as any), "");
    });

    it("codeBlock will return empty string when text is null", () => {
        assert.equal(codeBlock(null as any), "");
    });

    it("codeBlock will return empty string when text is empty string", () => {
        assert.equal(codeBlock(""), "");
    });

    it("Can render list item", () => {
        assert.equal(listItem("some text"), "• some text");
    });

    it("listItem will return empty string when text is undefined", () => {
        assert.equal(listItem(undefined as any), "");
    });

    it("listItem will return empty string when text is null", () => {
        assert.equal(listItem(null as any), "");
    });

    it("listItem will return empty string when text is empty string", () => {
        assert.equal(listItem(""), "");
    });
});
