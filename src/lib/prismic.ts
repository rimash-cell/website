import * as prismic from '@prismicio/client';

export const repositoryName = import.meta.env.PRISMIC_REPOSITORY || 'rima';

export const client = prismic.createClient(repositoryName, {
  // If your repository is private, add an access token
  accessToken: import.meta.env.PRISMIC_ACCESS_TOKEN,

  // This provides descriptions for your routes
  routes: [
    {
      type: 'homepage',
      path: '/',
    },
    {
      type: 'work',
      path: '/projects/:uid',
    },
    {
      type: 'about',
      path: '/about',
    },
  ],
});
