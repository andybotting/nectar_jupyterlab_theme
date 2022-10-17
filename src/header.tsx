import React from 'react';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { ThemeProvider } from './theme-provider';
import Button from '@material-ui/core/Button';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';


export const Header = (props: {
  hubPrefix?: string;
  hubUser?: string;
  baseUrl: string;
}): React.ReactElement => {
  const userName = props.hubUser || 'user';
  const changeConfigurationUrl = props.hubPrefix + 'home?changeconfig';

  const onClickLogout = async () => {
    const result = await showDialog({
      title: 'Logout?',
      body: 'Do you want to logout? This will NOT shutdown your session or stop your running notebooks. However sessions that are idle for an extended period of time will automatically be shut down.',
      buttons: [
        Dialog.okButton({
          caption: 'Logout',
          label: 'Logout'
        }),
        Dialog.cancelButton({
          caption: 'Cancel',
          label: 'Cancel'
        })
      ]
    });
    if (result.button.accept) {
      window.location.replace(props.baseUrl + 'logout');
    }
  };

  return (
    <ThemeProvider>
      <div className="nectar-header">
        <div className="nectar-header-left">
          <div className="nectar-logo"></div>
          <Button className="nectar-nav-item" href={changeConfigurationUrl}>Home</Button>
          <Button className="nectar-nav-item" href="https://support.ehelp.edu.au/a/solutions/articles/6000261095" target="_blank">About</Button>
          <Button className="nectar-nav-item" href="https://support.ehelp.edu.au/support/home" target="_blank">Help</Button>
        </div>
        <div className="nectar-header-right">
          <span className="nectar-username-text">{userName}</span>
          <Button className="nectar-nav-item" startIcon={<ExitToAppIcon />} onClick={onClickLogout}>Logout</Button>
        </div>
      </div>
    </ThemeProvider>
  );
};
