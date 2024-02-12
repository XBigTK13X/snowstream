package com.simplepathstudios.snowstream.api.model;

import java.util.ArrayList;

public class Episode {
   public Integer id;
   public Integer show_season_id;
   public String name;
   public Integer episode_order_counter;
   public ArrayList<VideoFile> video_files;
}
