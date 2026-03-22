import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY ?? "";
const repoName = repository.split("/")[1] ?? "";
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrgPagesSite = repoName.endsWith(".github.io");
const basePath = isGitHubActions && repoName && !isUserOrOrgPagesSite ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined
};

export default nextConfig;
