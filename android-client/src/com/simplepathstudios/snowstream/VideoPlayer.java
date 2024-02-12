package com.simplepathstudios.snowstream;

import android.net.Uri;
import android.view.Surface;
import android.view.SurfaceView;

import dev.jdtech.mpv.MPVLib;


//https://github.com/jarnedemeulemeester/libmpv-android/releases/tag/v0.1.4
//https://github.com/jarnedemeulemeester/findroid/blob/main/player/video/src/main/java/dev/jdtech/jellyfin/mpv/MPVPlayer.kt
public class VideoPlayer {
   private static final String TAG = "VideoPlayer";
   private static VideoPlayer __instance;
   public static VideoPlayer getInstance(){
      if(__instance == null){
         __instance = new VideoPlayer();
      }
      else {
         __instance.cleanup();
         __instance.setup();
      }
      return __instance;
   }

   private VideoPlayer(){
   }

   public void setup(){
   }

   public void cleanup(){
   }

   public void useSurface(Surface surface){
      MPVLib.create(Util.getGlobalContext());

      MPVLib.setOptionString("tls-verify","no");
      MPVLib.setOptionString("profile", "fast");
      MPVLib.setOptionString("vo", "gpu-next");
      MPVLib.setOptionString("ao", "audiotrack");
      MPVLib.setOptionString("gpu-context", "android");
      MPVLib.setOptionString("opengl-es", "yes");
      MPVLib.setOptionString("hwdec", "mediacodec");
      MPVLib.setOptionString("hwdec-codecs", "h264,hevc,mpeg4,mpeg2video,vp8,vp9,av1");

      // Cache
      MPVLib.setOptionString("cache", "yes");
      MPVLib.setOptionString("cache-pause-initial", "yes");
      MPVLib.setOptionString("demuxer-max-bytes", "32MiB");
      MPVLib.setOptionString("demuxer-max-back-bytes", "32MiB");

      // Subs
      MPVLib.setOptionString("sub-scale-with-window", "yes");
      MPVLib.setOptionString("sub-use-margins", "no");

      // Language
      MPVLib.setOptionString("alang", "");
      MPVLib.setOptionString("slang", "");

      // Other options
      MPVLib.setOptionString("force-window", "no");
      MPVLib.setOptionString("keep-open", "always");
      MPVLib.setOptionString("save-position-on-quit", "no");
      MPVLib.setOptionString("sub-font-provider", "none");
      MPVLib.setOptionString("ytdl", "no");

      MPVLib.init();

      MPVLib.attachSurface(surface);
      MPVLib.setOptionString("force-window", "yes");
      MPVLib.setOptionString("vo", "gpu-next");
   }

   public void play(String url){
      MPVLib.command(new String[]{"loadfile",url});

   }
}
