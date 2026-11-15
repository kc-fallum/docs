import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';

import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'KC Fallum Dokumentation',
  tagline: 'Dokumentation KC Fallum Umgebungen',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  // future: {
  //   v4: true,
  // },

  // Set the production url of your site here
  url: 'https://kc-fallum.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'kc-fallum', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/kc-fallum/docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function rawLoaderPlugin() {
      return {
        name: 'raw-loader-plugin',
        configureWebpack(config) {
          config.module = config.module || { rules: [] };
          config.module.rules = config.module.rules || [];
          config.module.rules.forEach((rule: any) => {
            if (rule.test && /\[jt\]sx\?/i.test(rule.test.toString())) {
              rule.resourceQuery = { not: [/raw/] };
            }
          });
          config.module.rules.unshift({
            resourceQuery: /raw/,
            type: 'asset/source',
          });
          return {};
        },
      };
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'KC Fallum Docs',
      logo: {
        alt: 'KC Fallum Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/architecture',
          label: 'Systemarchitektur',
          position: 'left',
        },
        {
          to: '/standards',
          label: 'Standards & Blueprints',
          position: 'left',
        },
        {
          to: '/dependencies',
          label: 'Infrastruktur',
          position: 'left',
        },
        {
          href: 'pathname:///docs/javadoc/kcfallum-api/index.html',
          label: 'JavaDoc API ↗',
          position: 'left',
          target: '_blank',
        },
        {
          href: 'https://github.com/kc-fallum',
          label: 'GitHub ↗',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'System & Architektur',
          items: [
            {
              label: 'Systemarchitektur',
              to: '/architecture',
            },
            {
              label: 'Infrastruktur & Externe Abhängigkeiten',
              to: '/dependencies',
            },
            {
              label: 'Setup & Deployment',
              to: '/setup',
            },
            {
              label: 'Architektur- & Design-Standards',
              to: '/standards',
            },
            {
              label: 'API Gateway & Routing',
              to: '/backend/gateway/overview',
            },
          ],
        },
        {
          title: 'Submodule',
          items: [
            {
              label: 'Shared Packages',
              to: '/packages/shared',
            },
            {
              label: 'Frontends',
              to: '/frontends/frontend-guide',
            },
            {
              label: 'Backend Services',
              to: '/backend/backend-guide',
            },
            {
              label: 'Minecraft Plugins',
              to: '/minecraft/plugins',
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'GitHub Organization',
              href: 'https://github.com/kc-fallum',
            },
            {
              label: 'Status Monitor',
              href: 'https://status.kcfallum.de',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} KC Fallum. Dokumentation erstellt mit Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
