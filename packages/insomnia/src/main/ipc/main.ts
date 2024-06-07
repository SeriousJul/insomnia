import { app, BrowserWindow, IpcRendererEvent, shell } from 'electron';
import fs from 'fs';

import type { HiddenBrowserWindowBridgeAPI } from '../../hidden-window';
import * as models from '../../models';
import { authorizeUserInWindow } from '../authorizeUserInWindow';
import { backup, restoreBackup } from '../backup';
import installPlugin from '../install-plugin';
import { CurlBridgeAPI } from '../network/curl';
import { cancelCurlRequest, curlRequest } from '../network/libcurl-promise';
import { WebSocketBridgeAPI } from '../network/websocket';
import { ipcMainHandle, ipcMainOn, type RendererOnChannels } from './electron';
import { gRPCBridgeAPI } from './grpc';

export interface RendererToMainBridgeAPI {
  loginStateChange: () => void;
  openInBrowser: (url: string) => void;
  restart: () => void;
  halfSecondAfterAppStart: () => void;
  openDeepLink: (url: string) => void;
  manualUpdateCheck: () => void;
  backup: () => Promise<void>;
  restoreBackup: (version: string) => Promise<void>;
  authorizeUserInWindow: typeof authorizeUserInWindow;
  setMenuBarVisibility: (visible: boolean) => void;
  installPlugin: typeof installPlugin;
  writeFile: (options: { path: string; content: string }) => Promise<string>;
  cancelCurlRequest: typeof cancelCurlRequest;
  curlRequest: typeof curlRequest;
  on: (channel: RendererOnChannels, listener: (event: IpcRendererEvent, ...args: any[]) => void) => () => void;
  webSocket: WebSocketBridgeAPI;
  grpc: gRPCBridgeAPI;
  curl: CurlBridgeAPI;
  showContextMenu: (options: { key: string }) => void;
  database: {
    caCertificate: {
      create: (options: { parentId: string; path: string }) => Promise<string>;
    };
  };
  hiddenBrowserWindow: HiddenBrowserWindowBridgeAPI;
}
export function registerMainHandlers() {
  ipcMainHandle('database.caCertificate.create', async (_, options: { parentId: string; path: string }) => {
    return models.caCertificate.create(options);
  });
  ipcMainOn('loginStateChange', async () => {
    BrowserWindow.getAllWindows().forEach(w => {
      w.webContents.send('loggedIn');
    });
  });
  ipcMainHandle('backup', async () => {
    return backup();
  });
  ipcMainHandle('restoreBackup', async (_, options: string) => {
    return restoreBackup(options);
  });
  ipcMainHandle('authorizeUserInWindow', (_, options: Parameters<typeof authorizeUserInWindow>[0]) => {
    const { url, urlSuccessRegex, urlFailureRegex, sessionId } = options;
    return authorizeUserInWindow({ url, urlSuccessRegex, urlFailureRegex, sessionId });
  });

  ipcMainHandle('writeFile', async (_, options: { path: string; content: string }) => {
    try {
      await fs.promises.writeFile(options.path, options.content);
      return options.path;
    } catch (err) {
      throw new Error(err);
    }
  });

  ipcMainHandle('curlRequest', (_, options: Parameters<typeof curlRequest>[0]) => {
    return curlRequest(options);
  });

  ipcMainOn('cancelCurlRequest', (_, requestId: string): void => {
    cancelCurlRequest(requestId);
  });

  ipcMainHandle('installPlugin', (_, lookupName: string) => {
    return installPlugin(lookupName);
  });

  ipcMainOn('restart', () => {
    app.relaunch();
    app.exit();
  });

  ipcMainOn('openInBrowser', (_, href: string) => {
    const { protocol } = new URL(href);
    if (protocol === 'http:' || protocol === 'https:') {
      // eslint-disable-next-line no-restricted-properties
      shell.openExternal(href);
    }
  });
}
