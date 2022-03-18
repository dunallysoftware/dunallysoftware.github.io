export default class SoundEffectPlayer  {

    volume;
    musicVolume;
    spSounds = new Map();
    mpSounds = new Map();
    suspendedSounds = [];
    //private final List<Integer> suspendedMpSounds = new ArrayList<>();
    //private final GamePreferences gamePreferences;
    gamePreferences;


    constructor(gamePreferences)
    {
        this.gamePreferences = gamePreferences;
        //gamePreferences.addListener(this);
        this.volume = 10; //gamePreferences.getFloat(R.string.preferences_noises_volume, 0.8f);
        this.musicVolume = 10; //gamePreferences.getFloat(R.string.preferences_music_volume, 0.8f);
        //soundPool = new SoundPool(4, AudioManager.STREAM_MUSIC, 0);
        this.spSounds.set("birdie", new Sound(new Audio("./audio/birdie.wav"), false));
        this.spSounds.set("music", new Sound(new Audio("./audio/tritsch_tratsch_polka.ogg"),true));
        this.spSounds.get("music").audio.loop=true;
        this.spSounds.set("word_found", new Sound(new Audio("./audio/word_found.wav"),false));
        //spSounds.put(R.raw.duck_intro, soundPool.load(context, R.raw.duck_intro, 0));
        this.spSounds.set("duck_panic", new Sound(new Audio("./audio/duck_panic.wav"),false));
        this.spSounds.set("duck_long", new Sound(new Audio("./audio/duck_long.wav"),false));
        this.spSounds.get("duck_long").audio.loop=true;
        this.spSounds.set("duck_shield", new Sound(new Audio("./audio/duck_shield.wav"),false));

        this.setVolumes(this);

        this.gamePreferences.addSubscriber(this, this.setVolumes);
        //mpSounds.put(R.raw.duck_panic, new MyMediaPlayer(context, R.raw.duck_panic, false, false));
        //mpSounds.put(R.raw.duck_long, new MyMediaPlayer(context, R.raw.duck_long, false, true));
        //mpSounds.put(R.raw.duck_shield, new MyMediaPlayer(context, R.raw.duck_shield, false, true));
        //mpSounds.put(R.raw.tritsch_tratsch_polka, new MyMediaPlayer(context, R.raw.tritsch_tratsch_polka, true, true));
    }

    setVolumes=function(object)
    {
      this.volume = object.gamePreferences.getValue("SOUND_EFFECTS_VOLUME");
      this.musicVolume = object.gamePreferences.getValue("MUSIC_VOLUME");
      for (const sound of object.spSounds.values())
      {
        //let sound = this.spSounds[key];
        if (sound.isMusic)
        {
          sound.audio.volume=this.musicVolume/10.0;
        }
        else {
          sound.audio.volume=this.volume/10.0;
        }
      }
    }

/*
    private class MyMediaPlayer {
        private final MediaPlayer mediaPlayer;
        private final boolean isMusic;
        private MyMediaPlayer(Context context, int resource, boolean isMusic, boolean loop)
        {
            this.mediaPlayer = MediaPlayer.create(context, resource);
            this.mediaPlayer.setLooping(loop);
            this.isMusic = isMusic;
        }

        private void start(boolean resume)
        {
            if (!resume)
            {
                mediaPlayer.seekTo(0);
            }
            if (isMusic) {
                mediaPlayer.setVolume(musicVolume, musicVolume);
            }
            else
            {
                mediaPlayer.setVolume(volume, volume);
            }
            mediaPlayer.start();
        }
        private void pause()
        {
            if (mediaPlayer.isPlaying()) mediaPlayer.pause();
        }
        private void setVolume(float requestedVolume)
        {
            mediaPlayer.setVolume(requestedVolume, requestedVolume);
        }
        private void release()
        {
            mediaPlayer.release();
        }

    }
*/
    pauseAll = function(suspend)
    {
        this.suspendedSounds=[];
        for (const sound of this.spSounds.values())
        {
          if (sound.audio.duration > 0 && !sound.audio.paused && !sound.audio.ended)
          {
            if (suspend) this.suspendedSounds.push(sound);
            sound.audio.pause();            
          }
        }
    }

    resumeAll = function()
    {
        // Only MediaPlayers can be restarted
        for (let s = 0; s< this.suspendedSounds.length; s++)
        {
            this.suspendedSounds[s].audio.play();
        }
    }

  //  public void clearSuspended()
  //  {
  //      suspendedMpSounds.clear();
  //  }

    soundEffectIsPaused = function(soundName)
    {
//alert(this.suspendedSounds.length + "  " + this.suspendedSounds.indexOf(soundName));
      return (this.suspendedSounds.indexOf(this.spSounds.get(soundName)) >= 0);
    }

    playSoundEffect = function(soundName)
    {
        if (this.spSounds.has(soundName)) {
            let soundEffect = this.spSounds.get(soundName).audio;
            if (!soundEffect.ended) soundEffect.load();
            soundEffect.play();
            //int soundId = spSounds.get(soundResource);
            //soundPool.play(soundId, volume, volume, 0, 0, 1);
        }
    }

    pauseSoundEffect = function(soundName)
    {
      if (this.spSounds.has(soundName)) {
          let soundEffect = this.spSounds.get(soundName).audio;
          if (!soundEffect.ended) soundEffect.pause();
      }
    }

    setEffectVolume = function(soundName, volume)
    {
      if (this.spSounds.has(soundName)) {
          let soundEffect = this.spSounds.get(soundName).audio;
          soundEffect.volume = volume/10.0;
      }
    }


/*
    public void startLongSoundEffect(int soundResource)
    {
        if (mpSounds.containsKey(soundResource))
        {
            MyMediaPlayer mp = mpSounds.get(soundResource);
            if (mp==null || mp.mediaPlayer==null) return;
            mp.start(mp.isMusic);   // Start unless is music, when we should resume
        }
    }





    public void stopLongSoundEffect(int soundResource)
    {
        if (mpSounds.containsKey(soundResource) )
        {
            MyMediaPlayer mp = mpSounds.get(soundResource);
            if (mp != null) mp.pause();
        }
    }

    // Update volume on a mediaplayer.
    public void setLongSoundEffectVolume(int soundResource, float volume)
    {
        if (mpSounds.containsKey(soundResource))
        {
            SoundEffectPlayer.MyMediaPlayer mp =mpSounds.get(soundResource);
            if (mp==null || mp.mediaPlayer==null) return;
            mp.setVolume(volume);
        }
    }
*/
/*
    public void setOnCompletionListener(int soundResource, MediaPlayer.OnCompletionListener listener)
    {
        if (mpSounds.containsKey(soundResource))
        {
            mpSounds.get(soundResource).setOnCompletionListener(listener);
        }
    }
*/
/*
    public void cleanup()
    {
        for (MyMediaPlayer mediaPlayer : mpSounds.values())
        {
            mediaPlayer.release();
        }
        soundPool.release();
        soundPool = null;
    }

    // Called when options updated
    public void optionsUpdates()
    {
        this.volume = gamePreferences.getFloat(R.string.preferences_noises_volume, 0.8f);
        this.musicVolume = gamePreferences.getFloat(R.string.preferences_music_volume, 0.8f);
    }
*/
}



class Sound {
      audio;
      isMusic;
      constructor(audio, isMusic)
      {
        this.audio = audio;
        this.isMusic = isMusic;

      }
    }
