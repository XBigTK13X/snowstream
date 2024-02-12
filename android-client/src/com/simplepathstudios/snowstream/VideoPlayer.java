package com.simplepathstudios.snowstream;

import android.net.Uri;

import org.videolan.libvlc.LibVLC;
import org.videolan.libvlc.Media;
import org.videolan.libvlc.MediaPlayer;
import org.videolan.libvlc.util.VLCVideoLayout;


// https://code.videolan.org/videolan/libvlc-android-samples/-/blob/master/java_sample/src/main/java/org/videolan/javasample/JavaActivity.java?ref_type=heads
// https://code.videolan.org/videolan/libvlc-android-samples/-/blob/master/java_sample/src/main/res/layout/activity_main.xml?ref_type=heads
//https://code.videolan.org/videolan/vlc-androidpublic
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
   LibVLC libVLC;
   MediaPlayer mediaPlayer;
   VLCVideoLayout vlcLayout;
   private VideoPlayer(){
      libVLC = new LibVLC(Util.getGlobalContext());
      mediaPlayer = new MediaPlayer(libVLC);
   }

   public void setup(){
      libVLC = new LibVLC(Util.getGlobalContext());
      mediaPlayer = new MediaPlayer(libVLC);
   }

   public void cleanup(){
      mediaPlayer.release();
      libVLC.release();
   }

   public void useLayout(VLCVideoLayout layout){
      mediaPlayer.attachViews(layout,null,true,true);
   }

   public void play(String url){
      Util.log(TAG,url);
      final Media media = new Media(libVLC,Uri.parse(url));
      mediaPlayer.setMedia(media);
      media.release();
      mediaPlayer.play();
      //media.release();
   }
}
