import { githubToSlack } from "../src/Markdown";
import assert = require("power-assert");

describe("GitHub to Slack markdown conversion with code block", () => {
    describe("Given text with triple tick code blocks", () => {
        it("should leave markdown inside code blocks as is", () => {
            assert.equal(githubToSlack("```* list item```"), "```* list item```");
        });

        it("should convert markdown outside of code blocks", () => {
            assert.equal(githubToSlack("* list item ```* list item```"), "• list item ```* list item```");
        });
    });

    describe("Given text with triple and single tick blocks", () => {
        it("should convert markdown outside of blocks and leave each block as is", () => {
            assert.equal(githubToSlack(
                "Some text ```block *of `code``` **some bold text** `another ```line``` of code`"),
                "Some text ```block *of `code``` *some bold text* `another ```line``` of code`");
        });
    });
});

describe("Just GitHub to Slack markdown conversion", () => {
    it("should convert list item expressed with -", () => {
        assert.equal(githubToSlack("- list item 1\n - list item 2"),
            "• list item 1\n • list item 2");
    });

    it("should convert list item expressed with *", () => {
        assert.equal(githubToSlack("* list item 1\n * list item 2"),
            "• list item 1\n • list item 2");
    });

    it("should not confuse italic with list item", () => {
        assert.equal(githubToSlack("*list item* 1\n * list item 2"),
            "_list item_ 1\n • list item 2");
    });

    it("should convert bold and italic", () => {
        assert.equal(githubToSlack("*italic* Some text *not italic **bold**"),
            "_italic_ Some text *not italic *bold*");
    });

    it("given simple image link should leave URL", () => {
        assert.equal(githubToSlack("<img  width=\"345\" src=\"http://someplace.com\">"),
            "http://someplace.com");
    });

    it("given image link with other attributes should leave URL", () => {
        assert.equal(githubToSlack("<img  width=\"345\" src=\"http://someplace.com\" alt=\"screen shot\">"),
            "http://someplace.com");
    });

    it("given encoded image link should leave URL", () => {
        assert.equal(githubToSlack("&lt;img  width=\"345\" src=\"http://someplace.com\"&gt;"),
            "http://someplace.com");
    });

    it("given link will convert it", () => {
        assert.equal(githubToSlack("[click here](http://someplace.com)"),
            "<http://someplace.com|click here>");
    });
});
