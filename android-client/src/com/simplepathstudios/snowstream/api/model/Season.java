package com.simplepathstudios.snowstream.api.model;

import java.util.ArrayList;

public class Season {
   public Integer id;
   public Integer show_id;
   public String name;
   public String directory;
   public Integer season_order_counter;
   public Show show;
   public ArrayList<ImageFile> image_files;
   public ArrayList<MetadataFile> metadata_files;
   public ImageFile main_poster_image;
}
