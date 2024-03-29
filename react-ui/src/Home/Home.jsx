import React, { useState, useEffect, useCallback, useRef } from 'react';
import querystring from 'query-string';
import SpotifyWebApi from 'spotify-web-api-node';
import SongPreview from './SongPreview';
import WikiInfo from './WikiInfo';

import Button from '@material-ui/core/Button';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import grey from "@material-ui/core/colors/grey";
import { makeStyles } from '@material-ui/core/styles';
import { Paper, AppBar, Toolbar, Typography } from '@material-ui/core';

const spotifyApi = new SpotifyWebApi({
  redirectUri: 'https://spotifidia.herokuapp.com/callback',
  clientId: '7d7cfc8ba99847eb8a155cc0b831c7b0',
});

const scope = 'user-read-private user-read-email user-read-playback-state user-top-read streaming';

const authorizationURL = querystring.stringifyUrl({
  url: 'https://accounts.spotify.com/authorize',
  query: {
    response_type: 'token',
    client_id: '7d7cfc8ba99847eb8a155cc0b831c7b0',
    scope: scope,
    redirect_uri: 'https://spotifidia.herokuapp.com/callback',
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    top: 124,
    left: 250,
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    color: theme.palette.success.main,
  },
  button: {
    margin: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    textAlign: 'center',
    marginBottom: theme.spacing(1),
    backgroundColor: grey[500],
    borderRadius: 25
  },
  sidebar: {
    position: 'fixed',
    top: 64,
    backgroundColor: grey[700],
    left: 0,
    bottom: 0,
    width: 250,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25
  },
  subtitle: {
    top: 64,
    height: 60,
    left: 250,
    position: 'absolute',
    paddingLeft: 12,
    paddingTop: 12,
  }
}));

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  //const [userInfo, setUserInfo] = useState(null);
  const playingPoll = useRef();

  useEffect(() => {
    const token = localStorage.getItem('spotifyAuthToken');

    if (token) {
      setLoggedIn(true);
      spotifyApi.setAccessToken(token);
    }

  }, []);

  const getNowPlaying = useCallback(() => {
    if (loggedIn) {
      spotifyApi.getMyCurrentPlaybackState()
        .then((response) => {
          if (response.body && response.body.is_playing) {
            setNowPlaying({
              name: response.body.item.name,
              artist: response.body.item.artists[0].name,
              albumArt: response.body.item.album.images[0].url,
              albumName: response.body.item.album.name,
            });
          } else {
            setNowPlaying(null);
            console.log("Not playing anything");
          }
        })
        .catch(() => {
          setLoggedIn(false);
          localStorage.removeItem('spotifyAuthToken');
        });
    }
  }, [loggedIn]);

  // const getUserInfo = useCallback(() => {
  //   if (loggedIn) {
  //     spotifyApi.getMe()
  //       .then((data) => {
  //         console.log(data.body);
  //         setUserInfo({
  //           name: data.body.display_name,
  //           image: data.body.images[0].url,
  //         })
  //     })
  //   }
  // }, [loggedIn]);

  // getUserInfo();

  useEffect(() => {
    clearInterval(playingPoll.current);
    playingPoll.current = setInterval(getNowPlaying, 500);
  }, [getNowPlaying]);

  const classes = useStyles();

  return (
    <div className='App'>
      <AppBar position="fixed" style={{ background: '#161717' }}>
        <Toolbar>
          <Typography variant="h4" className={classes.title} >
            Welcome to Spotifidia!
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.subtitle}>
          {
            loggedIn ? (
              <Typography variant="h6" >
                Lets play some Music..
              </Typography>
            ) : (
              <Typography variant="h6">
                  Log in to Spotify and play music to learn about what you're listening to!
                  <Button
                    variant="contained"
                    color="default"
                    className={classes.button}
                    startIcon={<LockOpenOutlinedIcon />}
                    href={authorizationURL}
                  >
                  Connect with Spotify
                  </Button>
              </Typography>
            )
          }
      </div>
      {
        nowPlaying && (
          <>
            <div className={classes.sidebar}>
              <SongPreview nowPlaying={nowPlaying} />
            </div>
            <div className={classes.root}>
              <Paper elevation={10} className={classes.paper}>
                <WikiInfo nowPlaying={nowPlaying} />
              </Paper>
            </div>
          </>
        )
      }
    </div>
  );
}

export default Home;