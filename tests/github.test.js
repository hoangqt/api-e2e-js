import Configuration from "../src/app/configuration.js";
import { base_url, repo } from "../src/app/github.js";
import { logger } from "../src/app/logger.js";

import axios from "axios";
import axiosRetry from "axios-retry";

describe("GitHub API Tests", () => {
  let headers;
  let owner;
  let issueNumber;

  beforeAll(() => {
    const configuration = new Configuration();
    owner = configuration.getOwner();
    const token = configuration.getToken();

    headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  });

  it("should fetch user repositories", async () => {
    const url = `${base_url}/repos/${owner}/${repo}`;
    logger.debug(`Fetching repository from ${url}`);
    const response = await axios.get(url, {
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("name", `${repo}`);
    expect(response.data).toHaveProperty("owner.login", `${owner}`);
  });

  it("should create a new issue", async () => {
    const bodyText = "This is a test issue created by automation";

    const body = {
      title: "Found a bug",
      body: bodyText,
      assignees: [`${owner}`],
      labels: ["bug"],
    };
    const url = `${base_url}/repos/${owner}/${repo}/issues`;
    logger.debug(`Creating issue at ${url}`);
    const response = await axios.post(url, body, { headers });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("title", "Found a bug");
    expect(response.data).toHaveProperty("body", bodyText);
    expect(response.data).toHaveProperty("state", "open");
  });

  it("should get issue number from new issue", async () => {
    const url = `${base_url}/repos/${owner}/${repo}/issues`;
    logger.debug(`Fetching issues from ${url}`);
    const response = await axios.get(url, { headers });
    expect(response.status).toBe(200);

    const issueList = response.data;
    if (Array.isArray(issueList) && issueList.length > 0) {
      for (const issue of issueList) {
        if (issue.title === "Found a bug") {
          expect(issue).toHaveProperty("number");
          issueNumber = issue.number;
          logger.debug(`Issue number: ${issueNumber}`);
          return;
        }
      }
    }

    const timeoutMs = 15_000;
    const pollIntervalMs = 500;
    const deadline = Date.now() + timeoutMs;

    let found = false;
    while (Date.now() < deadline) {
      const pollUrl = `${base_url}/repos/${owner}/${repo}/issues`;
      logger.debug(`Polling issues from ${pollUrl}`);
      const response = await axios.get(pollUrl, { headers });
      expect(response.status).toBe(200);
      const issueList = response.data;

      if (Array.isArray(issueList) && issueList.length > 0) {
        for (const issue of issueList) {
          if (issue.title === "Found a bug") {
            expect(issue).toHaveProperty("number");
            issueNumber = issue.number;
            logger.debug(`Issue number: ${issueNumber}`);
            found = true;
            break;
          }
        }
      }
      if (found) break;
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  });

  it("should update an existing issue", async () => {
    const body = {
      title: "Found a bug",
      body: "This is a test issue created by automation",
      assignees: [`${owner}`],
      labels: ["bug", "invalid"],
    };

    axiosRetry(axios, {
      retries: 5,
      retryDelay: (retryCount, error) => {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s...
        const jitter = Math.random() * 1000; // Add 0-1s jitter

        return delay + jitter;
      },
    });

    const url = `${base_url}/repos/${owner}/${repo}/issues/${issueNumber}`;
    logger.debug(`Updating issue at ${url}`);
    const response = await axios.patch(url, body, { headers });
    expect(response.status).toBe(200);
    expect(response.data.labels.map((label) => label.name)).toEqual([
      "bug",
      "invalid",
    ]);
  });

  it("should get a list of repo commits", async () => {
    const url = `${base_url}/repos/${owner}/${repo}/commits`;
    logger.debug(`Fetching commits from ${url}`);
    const response = await axios.get(url, { headers });
    expect(response.status).toBe(200);
    expect(response.data[0]).toHaveProperty("committer.login", `${owner}`);
  });
});
