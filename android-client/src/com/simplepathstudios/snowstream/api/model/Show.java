package com.simplepathstudios.snowstream.api.model;

import java.util.ArrayList;

public class Show {
      public Integer id;
      public String name;
      public String directory;
      public Shelf shelf;
      public ArrayList<ImageFile> image_files;
      public ArrayList<MetadataFile> metadata_files;
      public ImageFile main_poster_image;
}
