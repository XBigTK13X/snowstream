package com.simplepathstudios.snowstream.api.model;

import android.os.Bundle;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.adapter.model.PosterListItem;

import java.util.ArrayList;

public class Show implements PosterListItem {
      public Integer id;
      public String name;
      public String directory;
      public Shelf shelf;
      public ArrayList<ImageFile> image_files;
      public ArrayList<MetadataFile> metadata_files;
      public ImageFile main_poster_image;

      @Override
      public void onClick() {
            NavController navController = Navigation.findNavController(MainActivity.getInstance(), R.id.nav_host_fragment);
            Bundle bundle = new Bundle();
            bundle.putInt("ShowId", this.id);
            bundle.putString("ShowName", this.name);
            bundle.putString("ListKind", "Seasons");
            navController.navigate(R.id.poster_list_fragment, bundle);
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
            return this.name;
      }
}
