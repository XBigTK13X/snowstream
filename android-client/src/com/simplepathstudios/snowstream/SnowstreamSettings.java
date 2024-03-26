package com.simplepathstudios.snowstream;


import android.net.Uri;

public class SnowstreamSettings {
    public static final String ClientBuildDate = "February 12, 2024";
    public static final String ClientVersion = "0.5.0";
    public static boolean EnableDebugLog = true;
    public static final Uri UpdateSnowstreamUrl = Uri.parse("http://9914.us:8091/software/android/snowstream.apk");
    public static final boolean DebugResourceLeaks = false;
    public static String DevServerUrl = "http://192.168.1.232:8000";
    public static String ProdServerUrl = "http://192.168.1.232:8000";
    public static final int SearchDelayMilliseconds = 300;
    public static final int COLUMNS_PER_POSTER_GRID_ROW = 8;
}
