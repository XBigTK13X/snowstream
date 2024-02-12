package com.simplepathstudios.snowstream;

import org.videolan.libvlc.LibVLC;
import org.videolan.libvlc.Media;
import org.videolan.libvlc.MediaPlayer;
import org.videolan.libvlc.util.VLCVideoLayout;


// https://code.videolan.org/videolan/libvlc-android-samples/-/blob/master/java_sample/src/main/java/org/videolan/javasample/JavaActivity.java?ref_type=heads
// https://code.videolan.org/videolan/libvlc-android-samples/-/blob/master/java_sample/src/main/res/layout/activity_main.xml?ref_type=heads
public class VideoPlayer {
   private static VideoPlayer __instance;
   public static VideoPlayer getInstance(){
      if(__instance == null){
         __instance = new VideoPlayer();
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

   public void cleanup(){
      mediaPlayer.release();
      libVLC.release();
   }

   public void useLayout(VLCVideoLayout layout){
      if(mediaPlayer != null && vlcLayout != layout){
         mediaPlayer.attachViews(layout,null,true,true);
      }
   }

   public void play(String url){
      final Media media = new Media(libVLC,url);
      mediaPlayer.setMedia(media);
      mediaPlayer.play();
      //media.release();
   }
}
