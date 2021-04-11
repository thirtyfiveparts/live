module.exports = ({getRepoRootDocsNavBarItem, packagesDropDownItems}) => {
  return {
    navbar: {
      title: 'ThirtyFive Monorepo Docs',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        getRepoRootDocsNavBarItem(),
        //{
        //  to: 'docs/',
        //  activeBasePath: 'docs',
        //  label: 'Docs',
        //  position: 'left',
        //},
        {to: 'thirtyfive_blog', label: 'Blog', position: 'left'},
        packagesDropDownItems,
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    algolia: {
      applicationId: process.env.ALGOLIA_APPLICATION_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/thirtyfiveparts',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'thirtyfive_blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/thirtyfiveparts/thirtyfive',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ThirtyFive. Built with Docusaurus.`,
    }
  }
}
