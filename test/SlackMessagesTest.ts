import {
    atChannel,
    atEveryone,
    atHere,
    atUser,
    escape,
    render,
    rugButtonFrom,
    url,
} from "../src/SlackMessages";

import assert = require("power-assert");

describe("SlackMessageBuilder", () => {
    // Imagine these coming from model or otherwise built inside the handler;
    // We might need additional modules for GitHub users & links
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
        id: "somebuttonid", // This can be calculated automatically during construction
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

    describe("Given message with attachments and actions", () => {
        // Now you would construct a more complicated message with attachments and actions
        // & render it like this:
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
                "{\"text\":\"<https://github.com/tanya-coding|@tanya-coding> opened issue: <https://github.com/atomisthq/bot-service/issues/484|This issue has &lt;unsafe&gt; characters &amp; stuff>\",\"attachments\":[{\"text\":\"This is a very important issue with &lt;unsafe&gt; characters &amp; stuff\",\"fallback\":\"This issue has &lt;unsafe&gt; characters &amp; stuff\",\"mrkdwn_in\":[\"text\"],\"actions\":[{\"text\":\"Close issue\",\"type\":\"button\",\"name\":\"rug\",\"value\":\"somebuttonid\"}]}]}",
            );
        });

        it("should be able to parse JSON back", () => {
            JSON.parse(render(msg));
        });
    });
});

describe("Slack character escaping", () => {
    it("Will escape <, >, &", () => {
        assert.equal("&lt;this &amp; that&gt;", escape("<this & that>"));
    });
});

describe("User links", () => {
    it("Can mention user by user ID", () => {
        assert.equal("<@U123>", atUser("U123"));
    });

    it("Can mention user by user ID and name", () => {
        assert.equal("<@U123|anna>", atUser("U123", "anna"));
    });

    describe("Given blank user name", () => {
        it("Can mention user by user ID", () => {
            assert.equal("<@U123>", atUser("U123", ""));
        });
    });
});

describe("Channel links", () => {
    it("Can mention channel by channel ID", () => {
        assert.equal("<#C123>", atChannel("C123"));
    });

    it("Can mention channel by channel ID and name", () => {
        assert.equal("<#C123|general>", atChannel("C123", "general"));
    });

    describe("Given blank channel name", () => {
        it("Can mention channel by channel ID", () => {
            assert.equal("<#C123>", atChannel("C123", ""));
        });
    });
});

describe("Slack variables", () => {
    it("Can render @channel", () => {
        assert.equal("<!channel>", atChannel());
    });

    it("Can render @here", () => {
        assert.equal("<!here>", atHere());
    });

    it("Can render @everyone", () => {
        assert.equal("<!everyone>", atEveryone());
    });
});
