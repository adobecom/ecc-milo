export const SUPPORTED_REPOS = [
  {
    label: 'da-events',
    org: 'adobecom',
    repo: 'da-events',
    initialPath: '/events/events-shared/fragments',
    isFloodgate: false,
    promotesTo: null,
  },
  {
    label: 'da-events-fg-pink',
    org: 'adobecom',
    repo: 'da-events-fg-pink',
    initialPath: '/events/events-shared/fragments',
    isFloodgate: true,
    promotesTo: 'da-events',
  },
];

export const DEFAULT_REPO_NAME = 'da-events';

export function getRepoConfig(repoName) {
  return SUPPORTED_REPOS.find((r) => r.repo === repoName) ?? SUPPORTED_REPOS[0];
}
