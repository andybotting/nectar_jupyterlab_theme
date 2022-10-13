import {
//  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import React from 'react';
import {
  Dialog,
  ISplashScreen,
//  IThemeManager,
  ReactWidget
} from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';
import { 
  jupyterFaviconIcon,
//  jupyterIcon,
//  jupyterlabWordmarkIcon
 } from '@jupyterlab/ui-components';
import { DisposableDelegate } from '@lumino/disposable';
import { Throttler } from '@lumino/polling';
//import { Widget } from '@lumino/widgets';
import { Header } from './header';

/**
 * The interval in milliseconds before recover options appear during splash.
 */
const SPLASH_RECOVER_TIMEOUT = 12000;

/**
 * The command IDs used by the apputils plugin.
 */
namespace CommandIDs {
  export const loadState = 'apputils:load-statedb';
  export const print = 'apputils:print';
  export const reset = 'apputils:reset';
  export const resetOnLoad = 'apputils:reset-on-load';
  export const runFirstEnabled = 'apputils:run-first-enabled';
  export const runAllEnabled = 'apputils:run-all-enabled';
  export const toggleHeader = 'apputils:toggle-header';
}

/**
 * The Nectar splash screen provider.
 */
const splash: JupyterFrontEndPlugin<ISplashScreen> = {
  id: '@nectar/jupyterlab-theme:splash',
  autoStart: true,
  requires: [ITranslator],
  provides: ISplashScreen,
  activate: (app: JupyterFrontEnd, translator: ITranslator) => {
    const trans = translator.load('jupyterlab');
    const { commands, restored } = app;

    // Create splash element and populate it.
    const splash = document.createElement('div');
    const logo = document.createElement('div');

    splash.id = 'jupyterlab-splash';
    logo.id = 'main-logo';

    jupyterFaviconIcon.element({
      container: logo,
      stylesheet: 'splash'
    });

    logo.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <polygon points="209.72 381.51 279.63 258.82 209.72 136.12 69.9 136.12 0 258.82 69.9 381.51 209.72 381.51" fill="#f5b01a" fill-opacity="0.5">
    <animate attributeName="fill-opacity" values="0.5;1;1;0.5;0.5;0.5" dur="1.8s" />
  </polygon>
  <polygon points="442.1 245.39 512 122.69 442.1 0 302.28 0 232.37 122.69 302.28 245.39 442.1 245.39" fill="#f5b01a" fill-opacity="0.5">
    <animate attributeName="fill-opacity" values="0.5;0.5;0.5;1;1;0.5" dur="1.8s" />
  </polygon>
  <polygon points="442.1 517.64 512 394.95 442.1 272.25 302.28 272.25 232.37 394.95 302.28 517.64 442.1 517.64" fill="#f5b01a" fill-opacity="1">
    <animate attributeName="fill-opacity" values="1;0.5;0.5;0.5;0.5;1" dur="1.8s" />
  </polygon>
</svg>`;

    splash.appendChild(logo);

    // Create debounced recovery dialog function.
    let dialog: Dialog<unknown> | null;
    const recovery = new Throttler(
      async () => {
        if (dialog) {
          return;
        }

        dialog = new Dialog({
          title: trans.__('Loading…'),
          body: trans.__(`The loading screen is taking a long time.
Would you like to clear the workspace or keep waiting?`),
          buttons: [
            Dialog.cancelButton({ label: trans.__('Keep Waiting') }),
            Dialog.warnButton({ label: trans.__('Clear Workspace') })
          ]
        });

        try {
          const result = await dialog.launch();
          dialog.dispose();
          dialog = null;
          if (result.button.accept && commands.hasCommand(CommandIDs.reset)) {
            return commands.execute(CommandIDs.reset);
          }

          // Re-invoke the recovery timer in the next frame.
          requestAnimationFrame(() => {
            // Because recovery can be stopped, handle invocation rejection.
            void recovery.invoke().catch(_ => undefined);
          });
        } catch (error) {
          /* no-op */
        }
      },
      { limit: SPLASH_RECOVER_TIMEOUT, edge: 'trailing' }
    );

    // Return ISplashScreen.
    let splashCount = 0;
    return {
      show: (light = true) => {
        splash.classList.remove('splash-fade');
        //splash.classList.toggle('light', light);
        //splash.classList.toggle('dark', !light);
        splashCount++;
        document.body.appendChild(splash);

        // Because recovery can be stopped, handle invocation rejection.
        void recovery.invoke().catch(_ => undefined);

        return new DisposableDelegate(async () => {
          await restored;
          if (--splashCount === 0) {
            void recovery.stop();

            if (dialog) {
              dialog.dispose();
              dialog = null;
            }

            splash.classList.add('splash-fade');
            window.setTimeout(() => {
              document.body.removeChild(splash);
            }, 2000);
          }
        });
      }
    };
  }
};


/**
 * The Nectar logos
 */
/*
const logo: JupyterFrontEndPlugin<void> = {
    id: '@nectar/jupyterlab-theme:logo',
    requires: [IThemeManager, ILabShell],
    activate: (app: JupyterFrontEnd, manager: IThemeManager, shell: ILabShell) => {
        const style = '@nectar/jupyterlab-theme/index.css';

        // Create the nectar logo
        const nectar_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><polygon id="p3" style="fill:#F5B01A;" points="442.1,245.4 512,122.7 442.1,0 302.3,0 232.4,122.7 302.3,245.4 "/><polygon id="p2" style="fill:#F5B01A;" points="442.1,517.6 512,394.9 442.1,272.2 302.3,272.2 232.4,394.9 302.3,517.6 "/><polygon id="p1" style="fill:#F5B01A;" points="209.7,381.5 279.6,258.8 209.7,136.1 69.9,136.1 0,258.8 69.9,381.5 "/></svg>';
        //const nectar_icon = new LabIcon({ name: 'ui-components:nectar', svgstr: nectar_svg });

        // Set the icons elsewhere
        jupyterFaviconIcon.svgstr = nectar_svg;
        jupyterIcon.svgstr = nectar_svg;
        jupyterlabWordmarkIcon.svgstr = nectar_svg;

        // Register the plugin
        manager.register({
            name: 'nectar',
            isLight: true,
            themeScrollbars: true,
            load: () => manager.loadCSS(style),
            unload: () => Promise.resolve(undefined)
        });
    },
    autoStart: true
};
*/
/**
 * The Nectar header bar.
 */
const header: JupyterFrontEndPlugin<void> = {
  id: '@nectar/jupyterlab-theme:header',
  autoStart: true,
  requires: [JupyterFrontEnd.IPaths],
  activate: (app: JupyterFrontEnd, paths: JupyterFrontEnd.IPaths) => {
    (window as any).jp = app;
    console.log('JupyterLab extension @nectar/jupyterlab-theme is activated!');
    const headerWidget = ReactWidget.create(
      React.createElement(Header, {
        hubPrefix: paths.urls.hubPrefix,
        hubUser: paths.urls.hubUser,
        baseUrl: paths.urls.base
      })
    );
    headerWidget.id = 'nectar-header';
    app.shell.add(headerWidget, 'header');
  }
};

/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  header,
//  logo,
  splash
];
export default plugins;
