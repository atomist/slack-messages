import { renderError, renderSuccess } from "../src/RugMessages";

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
