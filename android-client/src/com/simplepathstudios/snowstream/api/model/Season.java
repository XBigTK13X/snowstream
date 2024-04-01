package com.simplepathstudios.snowstream.api.model;

import android.os.Bundle;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.simplepathstudios.snowstream.MobileActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.adapter.model.PosterListItem;

import java.util.ArrayList;

public class Season implements PosterListItem {
   public Integer id;
   public Integer show_id;
   public String name;
   public String directory;
   public Integer season_order_counter;
   public Show show;
   public ArrayList<ImageFile> image_files;
   public ArrayList<MetadataFile> metadata_files;
   public ImageFile main_poster_image;


   @Override
   public void onClick() {
      Bundle bundle = new Bundle();
      bundle.putInt("ShowId", this.show_id);
      bundle.putInt("SeasonId", this.id);
      bundle.putString("SeasonName", this.name);
      bundle.putString("ListKind", "Episodes");
      Util.getApp().navigateTo(R.id.poster_list_fragment, bundle);
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
      return this.name == null ? "Season "+this.season_order_counter : this.name;
   }
}
