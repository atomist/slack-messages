/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Perform transformations on input string, skipping sections that match
 * the regular expression.
 *
 * @param text input string
 * @param splitter a regular expression to split the string
 * @param transform function that takes non-skipped sections as input
 *                  and performs transformation
 * @return transformed string, stitched back together
 */
export function splitProcessor(text: string, transform: (i: string) => string, splitter: RegExp): string {
    const hunks = text.split(splitter);
    for (let i = 0; i < hunks.length; i += 2) {
        hunks[i] = transform(hunks[i]);
    }
    return hunks.join("");
}
