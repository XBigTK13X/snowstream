package com.simplepathstudios.snowstream.api.model;

import java.util.ArrayList;

public class Movie {
    public Integer id;
    public String name;
    public String release_year;
    public String directory;
    public ArrayList<VideoFile> video_files;
}
