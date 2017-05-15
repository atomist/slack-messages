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
                "[{\"text\":\"Close issue\",\"type\":\"button\",\"name\":\"rug\",\"value\":\"somebuttonid\"}]}]}",
            );
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
        assert.equal(url(undefined, undefined), "");
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
        assert.equal(user(undefined, undefined), "");
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

    it("Will return empty string when userId is undefined", () => {
        assert.equal(channel(undefined, undefined), "");
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

    it("Can render italic text", () => {
        assert.equal(italic("some text"), "_some text_");
    });

    it("Can render strike-through text", () => {
        assert.equal(strikethrough("some text"), "~some text~");
    });

    it("Can render single line code block", () => {
        assert.equal(codeLine("some text"), "`some text`");
    });

    it("Can render multiline line code block", () => {
        assert.equal(codeBlock("some text"), "```some text```");
    });
});
