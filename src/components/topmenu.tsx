import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { batchActions } from 'redux-batched-actions';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { wipeDisc, listContent, selfTest } from '../redux/actions';
import { actions as appActions } from '../redux/app-feature';
import { actions as renameDialogActions } from '../redux/rename-dialog-feature';
import { useShallowEqualSelector } from '../utils';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

import RefreshIcon from '@material-ui/icons/Refresh';
import EditIcon from '@material-ui/icons/Edit';
import GitHubIcon from '@material-ui/icons/GitHub';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import BugReportIcon from '@material-ui/icons/BugReport';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoIcon from '@material-ui/icons/Info';
import ToggleOffIcon from '@material-ui/icons/ToggleOff';
import ToggleOnIcon from '@material-ui/icons/ToggleOn';
import Win95Icon from '../images/win95/win95.png';
import HelpIcon from '@material-ui/icons/Help';

import { W95TopMenu } from './win95/topmenu';
import { Capability } from '../services/netmd';

const useStyles = makeStyles(theme => ({
    listItemIcon: {
        minWidth: theme.spacing(5),
    },
    toolTippedText: {
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
    },
}));

export const TopMenu = function(props: { onClick?: () => void }) {
    const classes = useStyles();
    const dispatch = useDispatch();

    let { mainView, darkMode, vintageMode, fullWidthSupport } = useShallowEqualSelector(state => state.appState);
    const deviceCapabilities = useShallowEqualSelector(state => state.main.deviceCapabilities);
    let discTitle = useShallowEqualSelector(state => state.main.disc?.title ?? ``);
    let fullWidthDiscTitle = useShallowEqualSelector(state => state.main.disc?.fullWidthTitle ?? ``);

    const githubLinkRef = React.useRef<null | HTMLAnchorElement>(null);
    const helpLinkRef = React.useRef<null | HTMLAnchorElement>(null);
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [showSelfTest, setShowSelfTest] = React.useState(false);
    const menuOpen = Boolean(menuAnchorEl);

    const isCapable = (capability: Capability) => deviceCapabilities.includes(capability);

    const handleMenuOpen = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            setShowSelfTest(event.shiftKey);
            setMenuAnchorEl(event.currentTarget);
        },
        [setMenuAnchorEl, setShowSelfTest]
    );

    const handleDarkMode = useCallback(() => {
        dispatch(appActions.setDarkMode(!darkMode));
    }, [dispatch, darkMode]);

    const handleVintageMode = useCallback(() => {
        dispatch(appActions.setVintageMode(!vintageMode));
    }, [dispatch, vintageMode]);

    const handleMenuClose = useCallback(() => {
        setMenuAnchorEl(null);
    }, [setMenuAnchorEl]);

    const handleWipeDisc = useCallback(() => {
        dispatch(wipeDisc());
        handleMenuClose();
    }, [dispatch, handleMenuClose]);

    const handleAllowFullWidth = useCallback(() => {
        dispatch(appActions.setFullWidthSupport(!fullWidthSupport));
    }, [dispatch, fullWidthSupport]);

    const handleRefresh = useCallback(() => {
        dispatch(listContent());
        handleMenuClose();
    }, [dispatch, handleMenuClose]);

    const handleRenameDisc = useCallback(() => {
        dispatch(
            batchActions([
                renameDialogActions.setVisible(true),
                renameDialogActions.setCurrentName(discTitle),
                renameDialogActions.setGroupIndex(null),
                renameDialogActions.setCurrentFullWidthName(fullWidthDiscTitle),
                renameDialogActions.setIndex(-1),
                renameDialogActions.setOfConvert(false),
            ])
        );
        handleMenuClose();
    }, [dispatch, handleMenuClose, discTitle, fullWidthDiscTitle]);

    const handleSelfTest = useCallback(() => {
        handleMenuClose();
        dispatch(selfTest());
    }, [dispatch, handleMenuClose]);

    const handleExit = useCallback(() => {
        dispatch(appActions.setMainView('WELCOME'));
        handleMenuClose();
    }, [dispatch, handleMenuClose]);

    const handleShowAbout = useCallback(() => {
        dispatch(appActions.showAboutDialog(true));
        handleMenuClose();
    }, [dispatch, handleMenuClose]);

    const handleShowChangelog = useCallback(() => {
        dispatch(appActions.showChangelogDialog(true));
        handleMenuClose();
    }, [dispatch, handleMenuClose]);

    const handleGithubLink = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            if (event.target !== githubLinkRef.current) {
                // Prevent opening the link twice
                githubLinkRef.current?.click();
            }
            handleMenuClose();
        },
        [handleMenuClose]
    );

    const handleHelpLink = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            if (event.target !== helpLinkRef.current) {
                // Prevent opening the link twice
                helpLinkRef.current?.click();
            }
            handleMenuClose();
        },
        [handleMenuClose]
    );

    const menuItems = [];
    if (mainView === 'MAIN') {
        menuItems.push(
            <MenuItem key="update" onClick={handleRefresh}>
                <ListItemIcon className={classes.listItemIcon}>
                    <RefreshIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Reload TOC</ListItemText>
            </MenuItem>
        );
        menuItems.push(
            <MenuItem key="title" onClick={handleRenameDisc} disabled={!isCapable(Capability.metadataEdit)}>
                <ListItemIcon className={classes.listItemIcon}>
                    <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Rename Disc</ListItemText>
            </MenuItem>
        );
        menuItems.push(
            <MenuItem key="wipe" onClick={handleWipeDisc} disabled={!isCapable(Capability.metadataEdit)}>
                <ListItemIcon className={classes.listItemIcon}>
                    <DeleteForeverIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Wipe Disc</ListItemText>
            </MenuItem>
        );
        menuItems.push(
            <MenuItem key="exit" onClick={handleExit}>
                <ListItemIcon className={classes.listItemIcon}>
                    <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Exit</ListItemText>
            </MenuItem>
        );
    }
    if (mainView === 'MAIN') {
        menuItems.push(<Divider key="action-divider" />);
        menuItems.push(
            <MenuItem key="allowFullWidth" onClick={handleAllowFullWidth}>
                <ListItemIcon className={classes.listItemIcon}>
                    {fullWidthSupport ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText>
                    {fullWidthSupport ? `Disable ` : `Enable `}
                    <Tooltip
                        title="This advanced feature enables the use of Hiragana and Kanji alphabets. More about this in Support and FAQ."
                        arrow
                    >
                        <span className={classes.toolTippedText}>Full-Width Title Editing</span>
                    </Tooltip>
                </ListItemText>
            </MenuItem>
        );
    }
    menuItems.push(
        <MenuItem key="darkMode" onClick={handleDarkMode}>
            <ListItemIcon className={classes.listItemIcon}>
                {/* <Switch name="darkModeSwitch" inputProps={{ 'aria-label': 'Dark Mode switch' }} size="small" /> */}
                {darkMode ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>Dark Mode</ListItemText>
        </MenuItem>
    );
    if (mainView === 'MAIN') {
        menuItems.push(
            <MenuItem key="vintageMode" onClick={handleVintageMode}>
                <ListItemIcon className={classes.listItemIcon}>
                    <img alt="Windows 95" src={Win95Icon} width="24px" height="24px" />
                </ListItemIcon>
                <ListItemText>Retro Mode (beta)</ListItemText>
            </MenuItem>
        );

        if (showSelfTest) {
            menuItems.push(
                <MenuItem key="test" onClick={handleSelfTest}>
                    <ListItemIcon className={classes.listItemIcon}>
                        <BugReportIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Self Test</ListItemText>
                </MenuItem>
            );
        }
    }
    if (mainView === 'MAIN') {
        menuItems.push(<Divider key="feature-divider" />);
    }
    menuItems.push(
        <MenuItem key="about" onClick={handleShowAbout}>
            <ListItemIcon className={classes.listItemIcon}>
                <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>About</ListItemText>
        </MenuItem>
    );
    menuItems.push(
        <MenuItem key="changelog" onClick={handleShowChangelog}>
            <ListItemIcon className={classes.listItemIcon}>
                <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Changelog</ListItemText>
        </MenuItem>
    );
    menuItems.push(
        <MenuItem key="support" onClick={handleHelpLink}>
            <ListItemIcon className={classes.listItemIcon}>
                <HelpIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
                <Link
                    rel="noopener noreferrer"
                    href="https://github.com/cybercase/webminidisc/wiki/Support-and-FAQ"
                    target="_blank"
                    ref={helpLinkRef}
                    onClick={handleHelpLink}
                >
                    Support and FAQ
                </Link>
            </ListItemText>
        </MenuItem>
    );
    menuItems.push(
        <MenuItem key="github" onClick={handleGithubLink}>
            <ListItemIcon className={classes.listItemIcon}>
                <GitHubIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
                <Link
                    rel="noopener noreferrer"
                    href="https://github.com/asivery/webminidisc"
                    target="_blank"
                    ref={githubLinkRef}
                    onClick={handleGithubLink}
                >
                    Fork me on GitHub
                </Link>
            </ListItemText>
        </MenuItem>
    );

    if (vintageMode) {
        const p = {
            mainView,
            onClick: props.onClick,
            handleWipeDisc,
            handleRefresh,
            handleRenameDisc,
            handleExit,
            handleShowAbout,
            handleShowChangelog,
            handleVintageMode,
            isCapable,
        };
        return <W95TopMenu {...p} />;
    }
    return (
        <React.Fragment>
            <IconButton aria-label="actions" aria-controls="actions-menu" aria-haspopup="true" onClick={handleMenuOpen}>
                <MoreVertIcon />
            </IconButton>
            <Menu id="actions-menu" anchorEl={menuAnchorEl} keepMounted open={menuOpen} onClose={handleMenuClose}>
                {menuItems}
            </Menu>
        </React.Fragment>
    );
};
