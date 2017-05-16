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
    rugButtonFrom,
    strikethrough,
    url,
    user,
} from "../src/SlackMessages";

import assert = require("power-assert");

describe("Message rendering", () => {
    const user = {
        url: "https://github.com/tanya-coding",
        name: "tanya-coding",
    };
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
        const msg = {
            text: `${url(user.url, "@" + user.name)} opened issue: ${url(issue.url, issue.title)}`,
            attachments: [
                {
                    text: escape(issue.body),
                    fallback: escape(issue.title),
                    mrkdwn_in: ["text"],
                    actions: [
                        rugButtonFrom({ text: "Close issue" }, action),
                    ],
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
                "[{\"text\":\"Close issue\",\"type\":\"button\",\"name\":\"rug\",\"value\":\"somebuttonid\"}]" +
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

    describe("Given message with multiple attachments containing actions", () => {
        it("should assign unique callback_id to each attachment", () => {
            const attachments: Attachment[] = [];
            for (let i = 0; i++; i < 20) {
                attachments.push({
                    text: "test",
                    fallback: "test",
                    actions: [
                        rugButtonFrom({ text: "Test" }, action),
                    ],
                });
            }
            const msg = { attachments };

            const rendered = JSON.parse(render(msg));
            const ids: string[] = [];
            for (const att of rendered.attachments) {
                assert(att.callback_id != null && att.callback_id !== "");
                if (ids.indexOf(att.callback_id) < 0) {
                    ids.push(att.callback_id);
                }
            }
            assert.equal(ids.length, rendered.attachments.length,
                "All callback ids should be unique");
        });
    });

    describe("Given message with multiple attachments containing actions and some having callback_id specified", () => {
        it("should leave specified callback_id as is when it is not undefined or null", () => {
            const msg = {
                attachments: [
                    {
                        text: "test",
                        fallback: "test",
                        actions: [
                            rugButtonFrom({ text: "Test" }, action),
                        ],
                    },
                    {
                        callback_id: "custom-id",
                        text: "test",
                        fallback: "test",
                        actions: [
                            rugButtonFrom({ text: "Test" }, action),
                        ],
                    },
                    {
                        callback_id: undefined,
                        text: "test",
                        fallback: "test",
                        actions: [
                            rugButtonFrom({ text: "Test" }, action),
                        ],
                    },
                    {
                        callback_id: null,
                        text: "test",
                        fallback: "test",
                        actions: [
                            rugButtonFrom({ text: "Test" }, action),
                        ],
                    },
                    {
                        text: "test",
                        fallback: "test",
                    },
                ],
            };

            const rendered = JSON.parse(render(msg));
            assert.equal(rendered.attachments[1].callback_id, "custom-id",
                "Will preserve callback_id specified by user");
            assert(rendered.attachments[0].callback_id != null,
                "Will assign callback_id when not specified");
            assert(rendered.attachments[2].callback_id != null,
                "Will assign callback_id when specified but set to undefined");
            assert(rendered.attachments[3].callback_id != null,
                "Will assign callback_id when specified but set to null");
            assert(rendered.attachments[4].callback_id == null,
                "Will not assign callback_id when attachment does not have any actions");
        });
    });

    describe("Given invalid command id", () => {
        it("should refuse to render message", () => {
            try {
                render({
                    attachments: [{
                        fallback: "test",
                        actions: [
                            rugButtonFrom({ text: "Test" }, { id: undefined }),
                        ],
                    }],
                });
                assert.fail("Should fail to render");
            } catch (error) {
                assert(error.message != null && error.message !== "");
            }
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
        assert.equal(escape(null), "");
    });

    it("Will return empty string when text is undefined", () => {
        assert.equal(escape(undefined), "");
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
        assert.equal(url(undefined), "");
    });

    it("Will return empty string when url is null", () => {
        assert.equal(url(null), "");
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
        assert.equal(user(undefined), "");
    });

    it("Will return empty string when userId is null", () => {
        assert.equal(user(null), "");
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
        assert.equal(channel(undefined), "");
    });

    it("Will return empty string when channelId is null", () => {
        assert.equal(channel(null), "");
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
        assert.equal(bold(undefined), "");
    });

    it("bold will return empty string when text is null", () => {
        assert.equal(bold(null), "");
    });

    it("Can render italic text", () => {
        assert.equal(italic("some text"), "_some text_");
    });

    it("italic will return empty string when text is undefined", () => {
        assert.equal(italic(undefined), "");
    });

    it("italic will return empty string when text is null", () => {
        assert.equal(italic(null), "");
    });

    it("Can render strike-through text", () => {
        assert.equal(strikethrough("some text"), "~some text~");
    });

    it("strikethrough will return empty string when text is undefined", () => {
        assert.equal(strikethrough(undefined), "");
    });

    it("strikethrough will return empty string when text is null", () => {
        assert.equal(strikethrough(null), "");
    });

    it("Can render single line code block", () => {
        assert.equal(codeLine("some text"), "`some text`");
    });

    it("codeLine will return empty string when text is undefined", () => {
        assert.equal(codeLine(undefined), "");
    });

    it("codeLine will return empty string when text is null", () => {
        assert.equal(codeLine(null), "");
    });

    it("Can render multiline line code block", () => {
        assert.equal(codeBlock("some text"), "```some text```");
    });

    it("codeBlock will return empty string when text is undefined", () => {
        assert.equal(codeBlock(undefined), "");
    });

    it("codeBlock will return empty string when text is null", () => {
        assert.equal(codeBlock(null), "");
    });

    it("Can render list item", () => {
        assert.equal(listItem("some text"), "• some text");
    });

    it("listItem will return empty string when text is undefined", () => {
        assert.equal(listItem(undefined), "");
    });

    it("listItem will return empty string when text is null", () => {
        assert.equal(listItem(null), "");
    });
});
