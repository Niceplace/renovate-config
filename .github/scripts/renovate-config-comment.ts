#!/usr/bin/env bun

/**
 * Post or update a PR comment with Renovate config validation results
 * Uses Bun runtime with native fetch (GitHub API)
 * Usage: bun renovate-config-comment.ts <validation_output> <pr_number>
 */

interface Comment {
  id: number;
  body: string;
}

if (Bun.argv.length !== 4) {
  console.error("Error: Invalid number of arguments");
  console.error(`Usage: ${Bun.argv[1]} <validation_output> <pr_number>`);
  process.exit(1);
}

const validationOutput = Bun.argv[2];
const prNumber = Bun.argv[3];

if (!validationOutput) {
  console.error("Error: Validation output cannot be empty");
  process.exit(1);
}

if (!prNumber) {
  console.error("Error: PR number cannot be empty");
  process.exit(1);
}

if (!/^\d+$/.test(prNumber)) {
  console.error("Error: PR number must be a positive integer");
  process.exit(1);
}

const githubToken = Bun.env.GITHUB_TOKEN;
const githubRepo = Bun.env.GITHUB_REPOSITORY;

if (!githubToken) {
  console.error("Error: GITHUB_TOKEN environment variable not set");
  process.exit(1);
}

if (!githubRepo) {
  console.error("Error: GITHUB_REPOSITORY environment variable not set");
  process.exit(1);
}

const COMMENT_MARKER = "<!-- renovate-config-workflow-comment -->";

const buildCommentBody = (): string => {
  const isSuccessful = validationOutput.includes(
    "Config validated successfully",
  );
  const body = `${COMMENT_MARKER}
## Renovate Config Validation Results

\`\`\`
${isSuccessful ? "✅ Configuration is valid !" : validationOutput}
\`\`\`
---
${!isSuccessful ? "💡 **Tip:** Run \`bunx --yes --package renovate -- renovate-config-validator renovate-config.js renovate-presets/default.json5\` locally to test your config before pushing!" : ""}

`;

  return body;
};

const main = async (): Promise<void> => {
  try {
    const commentsResponse = await fetch(
      `https://api.github.com/repos/${githubRepo}/issues/${prNumber}/comments`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!commentsResponse.ok) {
      throw new Error(
        `Failed to fetch comments: ${commentsResponse.statusText}`,
      );
    }

    const comments: Comment[] = (await commentsResponse.json()) as Comment[];

    const existingComment = comments.find((comment: Comment) =>
      comment.body?.includes(COMMENT_MARKER),
    );

    if (existingComment) {
      const updateResponse = await fetch(
        `https://api.github.com/repos/${githubRepo}/issues/comments/${existingComment.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${githubToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: buildCommentBody() }),
        },
      );

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to update comment: ${updateResponse.statusText}`,
        );
      }

      console.log(`Updated existing PR comment #${existingComment.id}`);
    } else {
      const createResponse = await fetch(
        `https://api.github.com/repos/${githubRepo}/issues/${prNumber}/comments`,
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${githubToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: buildCommentBody() }),
        },
      );

      if (!createResponse.ok) {
        throw new Error(
          `Failed to create comment: ${createResponse.statusText}`,
        );
      }

      console.log("Created new PR comment");
    }
  } catch (error: unknown) {
    console.error(
      "Error posting PR comment:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
};

main();
