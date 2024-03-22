package com.simplepathstudios.snowstream.api.model;

import android.os.Bundle;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.adapter.model.PosterListItem;

import java.util.ArrayList;

public class Episode implements PosterListItem {
   public Integer id;
   public Integer show_season_id;
   public String name;
   public Integer episode_order_counter;
   public ArrayList<VideoFile> video_files;
   public ArrayList<ImageFile> image_files;
   public ArrayList<MetadataFile> metadata_files;
   public ImageFile main_poster_image;
   public Season season;


   @Override
   public void onClick() {
      NavController navController = Navigation.findNavController(MainActivity.getInstance(), R.id.nav_host_fragment);
      Bundle bundle = new Bundle();
      bundle.putInt("ShowId", this.show_season_id);
      bundle.putInt("EpisodeId", this.id);
      bundle.putString("EpisodeName", this.name);
      navController.navigate(R.id.episode_details_fragment, bundle);
   }

   @Override
   public String getWebPath() {
      if(this.main_poster_image == null){
         return null;
      }
      return this.main_poster_image.web_path;
   }

   @Override
   public String getTitle() {
      return this.name == null ? "Episode "+this.episode_order_counter : this.name;
   }
}
